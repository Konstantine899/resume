// src/shared/ui/DatePicker/lib/isoDate.ts

/**
 * Единственный парсер/форматтер дат в проекте (SPEC риск «парсер ровно один»).
 *
 * Правило часовых поясов (план A7): дата внутри компонентов — СТРОКА.
 * Объект `Date` здесь НЕ создаётся вообще — `new Date('yyyy-mm-dd')`
 * парсится как UTC-midnight и в отрицательных поясах сдвигает отображаемый
 * день на −1. Вся арифметика — целочисленные алгоритмы civil
 * (Howard Hinnant days_from_civil / civil_from_days), TZ-независимые.
 *
 * Calendar импортирует этот модуль напрямую (legal deep-import сегмента
 * `lib` — тот же allowInternal, что у public-api-only).
 */

export interface IsoDateParts {
  year: number;
  /** 1-based месяц (1 = январь). */
  month: number;
  /** 1-based день. */
  day: number;
}

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE_RE = /^(\d{2})\.(\d{2})\.(\d{4})$/;

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const daysInMonth = (year: number, month: number): number => {
  if (month === 2 && isLeapYear(year)) return 29;
  return MONTH_LENGTHS[month - 1] ?? 0;
};

const isValidParts = (year: number, month: number, day: number): boolean =>
  year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);

const pad = (value: number, length: number): string => String(value).padStart(length, '0');

/** Целочисленные дни от 1970-01-01 (proleptic Gregorian), чистая математика. */
export const daysFromCivil = (year: number, month: number, day: number): number => {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
};

export const civilFromDays = (z: number): IsoDateParts => {
  const shifted = z + 719468;
  const era = Math.floor(shifted / 146097);
  const doe = shifted - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
  );
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp + (mp < 10 ? 3 : -9);
  return { year: month <= 2 ? y + 1 : y, month, day };
};

/**
 * Разбор ISO `yyyy-mm-dd` → год/месяц/день. БЕЗ создания `Date`
 * (доказательство в тесте: конструктор шпионит и падает на вызове).
 * Невалидная строка (в т.ч. 2026-02-30, 2026-13-01) → null.
 */
export const isoToParts = (iso: string): IsoDateParts | null => {
  const match = ISO_DATE_RE.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidParts(year, month, day)) return null;
  return { year, month, day };
};

export const isValidIsoDate = (iso: string): boolean => isoToParts(iso) !== null;

/** parts → ISO `yyyy-mm-dd`. Предполагаются валидные части. */
export const partsToIso = ({ year, month, day }: IsoDateParts): string =>
  `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;

/** ISO → отображение `dd.mm.yyyy` (OPEN-4: в обоих локалях). */
export const formatDisplayDate = (iso: string): string => {
  const parts = isoToParts(iso);
  if (!parts) return '';
  return `${pad(parts.day, 2)}.${pad(parts.month, 2)}.${pad(parts.year, 4)}`;
};

/**
 * Ручной ввод → ISO. Принимает и `dd.mm.yyyy`, и ISO (парсер один).
 * Строго два знака на сегмент: «5.1.2026» → null.
 */
export const parseDisplayDate = (text: string): string | null => {
  const trimmed = text.trim();
  const display = DISPLAY_DATE_RE.exec(trimmed);
  const isoMatch = display ? null : ISO_DATE_RE.exec(trimmed);
  const parts = display
    ? { day: Number(display[1]), month: Number(display[2]), year: Number(display[3]) }
    : isoMatch
      ? { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) }
      : null;
  if (!parts || !isValidParts(parts.year, parts.month, parts.day)) return null;
  return partsToIso(parts);
};

/** 0 = понедельник … 6 = воскресенье. */
export const weekdayMondayZero = ({ year, month, day }: IsoDateParts): number =>
  (((daysFromCivil(year, month, day) + 3) % 7) + 7) % 7;

export const addDays = (parts: IsoDateParts, delta: number): IsoDateParts =>
  civilFromDays(daysFromCivil(parts.year, parts.month, parts.day) + delta);

/** Сохраняет день, зажимая в длину нового месяца (31 янв + 1 мес → 28 фев). */
export const addMonths = (parts: IsoDateParts, delta: number): IsoDateParts => {
  const zeroBased = parts.year * 12 + (parts.month - 1) + delta;
  const year = Math.floor(zeroBased / 12);
  const month = (zeroBased % 12) + 1;
  return { year, month, day: Math.min(parts.day, daysInMonth(year, month)) };
};

/** Лексикографическое сравнение ISO одного формата — без Date. */
export const compareIsoDates = (a: string, b: string): number => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};
