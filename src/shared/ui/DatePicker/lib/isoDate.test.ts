// src/shared/ui/DatePicker/lib/isoDate.test.ts

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addDays,
  addMonths,
  civilFromDays,
  compareIsoDates,
  daysFromCivil,
  daysInMonth,
  formatDisplayDate,
  isLeapYear,
  isoToParts,
  isValidIsoDate,
  parseDisplayDate,
  partsToIso,
  weekdayMondayZero,
} from './isoDate';

const OriginalDate = globalThis.Date;

/** Подменяет глобальный Date на «шпион», падающий на конструировании. */
const installDateTrap = (): (() => void) => {
  const spy = vi.fn(() => {
    throw new Error('Date must not be constructed inside the parser (plan A7)');
  });
  globalThis.Date = spy as unknown as DateConstructor;
  return () => {
    globalThis.Date = OriginalDate;
  };
};

describe('isoToParts (WU-1a, план A7 — без Date)', () => {
  afterEach(() => {
    globalThis.Date = OriginalDate;
  });

  it('разбирает конец года 2025-12-31', () => {
    expect(isoToParts('2025-12-31')).toEqual({ year: 2025, month: 12, day: 31 });
  });

  it('разбирает начало года 2026-01-01', () => {
    expect(isoToParts('2026-01-01')).toEqual({ year: 2026, month: 1, day: 1 });
  });

  it('разбирает високосный день 2028-02-29', () => {
    expect(isoToParts('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 });
  });

  it('НЕ создаёт объект Date при разборе (ловушка на конструкторе)', () => {
    const restore = installDateTrap();
    try {
      expect(isoToParts('2025-12-31')).toEqual({ year: 2025, month: 12, day: 31 });
      expect(isoToParts('2026-01-01')).toEqual({ year: 2026, month: 1, day: 1 });
      expect(isoToParts('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 });
    } finally {
      restore();
    }
  });

  it('отклоняет невалидные значения', () => {
    expect(isoToParts('2026-02-30')).toBeNull(); // такого дня нет
    expect(isoToParts('2026-13-01')).toBeNull(); // месяц 13
    expect(isoToParts('2026-00-10')).toBeNull(); // месяц 0
    expect(isoToParts('2026-01-00')).toBeNull(); // день 0
    expect(isoToParts('26-01-01')).toBeNull(); // не 4-значный год
    expect(isoToParts('2026-1-1')).toBeNull(); // не zero-padded
    expect(isoToParts('')).toBeNull();
    expect(isoToParts('today')).toBeNull();
  });
});

describe('календарная математика (без Date)', () => {
  it('isLeapYear: 2028 да, 2026 нет, 2000 да, 1900 нет', () => {
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });

  it('daysInMonth: февралю високосного 2028 — 29', () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it('daysFromCivil/civilFromDays — обратимая пара, включая високосный день', () => {
    expect(daysFromCivil(1970, 1, 1)).toBe(0);
    expect(civilFromDays(0)).toEqual({ year: 1970, month: 1, day: 1 });
    const leap = daysFromCivil(2028, 2, 29);
    expect(civilFromDays(leap)).toEqual({ year: 2028, month: 2, day: 29 });
  });

  it('addDays пересекает границу года: 2025-12-31 + 1 = 2026-01-01', () => {
    const from = isoToParts('2025-12-31');
    expect(from).not.toBeNull();
    if (!from) return;
    expect(partsToIso(addDays(from, 1))).toBe('2026-01-01');
    expect(partsToIso(addDays(from, -1))).toBe('2025-12-30');
  });

  it('addMonths зажимает день: 31 янв + 1 мес → 28 фев (невисокосный)', () => {
    const jan31 = isoToParts('2026-01-31');
    expect(jan31).not.toBeNull();
    if (!jan31) return;
    expect(partsToIso(addMonths(jan31, 1))).toBe('2026-02-28');
    expect(partsToIso(addMonths(jan31, 12))).toBe('2027-01-31');
    expect(partsToIso(addMonths(jan31, -1))).toBe('2025-12-31');
  });

  it('weekdayMondayZero: 2026-10-08 — четверг = 3', () => {
    const d = isoToParts('2026-10-08');
    expect(d).not.toBeNull();
    if (!d) return;
    expect(weekdayMondayZero(d)).toBe(3); // пн=0 … чт=3 … вс=6
  });

  it('compareIsoDates лексикографически (один формат)', () => {
    expect(compareIsoDates('2026-01-01', '2026-01-01')).toBe(0);
    expect(compareIsoDates('2025-12-31', '2026-01-01')).toBe(-1);
    expect(compareIsoDates('2026-02-01', '2026-01-31')).toBe(1);
  });
});

describe('ручной ввод / отображение (OPEN-4)', () => {
  it('formatDisplayDate: ISO → dd.mm.yyyy', () => {
    expect(formatDisplayDate('2026-01-05')).toBe('05.01.2026');
    expect(formatDisplayDate('2025-12-31')).toBe('31.12.2025');
    expect(formatDisplayDate('bogus')).toBe('');
  });

  it('parseDisplayDate принимает dd.mm.yyyy', () => {
    expect(parseDisplayDate('05.01.2026')).toBe('2026-01-05');
    expect(parseDisplayDate(' 31.12.2025 ')).toBe('2025-12-31');
  });

  it('parseDisplayDate принимает и ISO (парсер один на оба формата)', () => {
    expect(parseDisplayDate('2026-01-05')).toBe('2026-01-05');
  });

  it('parseDisplayDate отклоняет кривые строки без исключений', () => {
    expect(parseDisplayDate('5.1.2026')).toBeNull(); // не zero-padded
    expect(parseDisplayDate('32.01.2026')).toBeNull();
    expect(parseDisplayDate('29.02.2026')).toBeNull(); // невисокосный
    expect(parseDisplayDate('')).toBeNull();
    expect(parseDisplayDate('abc')).toBeNull();
  });

  it('isValidIsoDate и partsToIso round-trip', () => {
    expect(isValidIsoDate('2026-06-15')).toBe(true);
    expect(isValidIsoDate('2026-06-31')).toBe(false);
    const parts = isoToParts('2028-02-29');
    expect(parts).not.toBeNull();
    if (!parts) return;
    expect(partsToIso(parts)).toBe('2028-02-29');
  });
});
