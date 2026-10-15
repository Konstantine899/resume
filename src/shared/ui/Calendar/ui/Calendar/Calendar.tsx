// src/shared/ui/Calendar/ui/Calendar/Calendar.tsx

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useId, useRef, useState } from 'react';
// Calendar deep-imports the single date parser (legal `lib` segment — same
// allowInternal as public-api-only; isoDate is a leaf module, no cycle).
import {
  addDays,
  addMonths,
  compareIsoDates,
  daysInMonth,
  isoToParts,
  partsToIso,
  weekdayMondayZero,
  type IsoDateParts,
} from '../../../DatePicker/lib/isoDate';
import { FIRST_DAY_OF_WEEK } from '../../model/constants';
import type { CalendarProps } from '../../model/types';
import styles from './Calendar.module.scss';

const MONTH_KEYS = [
  'calendarMonthJanuary',
  'calendarMonthFebruary',
  'calendarMonthMarch',
  'calendarMonthApril',
  'calendarMonthMay',
  'calendarMonthJune',
  'calendarMonthJuly',
  'calendarMonthAugust',
  'calendarMonthSeptember',
  'calendarMonthOctober',
  'calendarMonthNovember',
  'calendarMonthDecember',
] as const;

/** "Now" in the USER's timezone (local getters). A7 forbids `new Date(iso)`
 *  parsing only — the current moment is legitimately a local Date. */
const getTodayParts = (): IsoDateParts => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

const sameDay = (a: IsoDateParts, b: IsoDateParts): boolean =>
  a.year === b.year && a.month === b.month && a.day === b.day;

/** Offset of a day from the week start (0 … 6) in the locale's week order. */
const weekOffset = (parts: IsoDateParts, firstDay: number): number => {
  const sundayZero = (weekdayMondayZero(parts) + 1) % 7;
  return (sundayZero - firstDay + 7) % 7;
};

/**
 * APG date-grid keyboard map → the next focused day, or null for keys that
 * do not move focus (Enter/Space select, everything else is ignored).
 */
const nextForKey = (
  key: string,
  current: IsoDateParts,
  shiftKey: boolean,
  firstDay: number
): IsoDateParts | null => {
  switch (key) {
    case 'ArrowLeft':
      return addDays(current, -1);
    case 'ArrowRight':
      return addDays(current, 1);
    case 'ArrowUp':
      return addDays(current, -7);
    case 'ArrowDown':
      return addDays(current, 7);
    case 'PageUp':
      return addMonths(current, shiftKey ? -12 : -1);
    case 'PageDown':
      return addMonths(current, shiftKey ? 12 : 1);
    case 'Home':
      return addDays(current, -weekOffset(current, firstDay));
    case 'End':
      return addDays(current, 6 - weekOffset(current, firstDay));
    default:
      return null;
  }
};

/** Drill-down view of the calendar: days → months → decade (WU-5). */
type CalendarView = 'day' | 'month' | 'decade';

/**
 * Calendar — kit month-grid date picker (ARIA APG date-grid pattern).
 *
 * @remarks
 * - Controlled only (plan A2): `value` is an ISO string `yyyy-mm-dd` or
 *   `null`; `onChange` always yields a valid ISO date. All date arithmetic
 *   goes through the single parser in `DatePicker/lib/isoDate` — no `Date`
 *   parsing, no timezone shifts (plan A7).
 * - Fixed 6×7 geometry (6 week-rows + 1 weekday header-row): a stable box,
 *   no layout shift when the month changes.
 * - Keyboard follows APG: arrows ±1/±7 days, PageUp/PageDown ±1 month
 *   (Shift ±1 year), Home/End week edges, Enter/Space select. Navigation is
 *   never blocked by min/max — only selection is (disabled days stay
 *   focusable via `aria-disabled`, never the `disabled` attribute).
 * - The viewed month is derived state: `value`'s month (or today) until the
 *   user navigates; crossing a month boundary re-renders the new month and
 *   moves DOM focus to the roving cell.
 * - Drill-down (WU-5): the header button walks day → month → decade views;
 *   months/years are native `<button>`s (Tab/Enter for free). Navigation
 *   clicks call `stopPropagation()` so a DatePicker popover stays open
 *   (`closeOnContentClick`); only a day-selection click bubbles and closes.
 * - min/max at the upper levels: a month/year is `aria-disabled` when NO
 *   day inside it is selectable — the interval is continuous, so this is
 *   `last < min || first > max`, never a both-ends check (June would look
 *   fully disabled against an in-June window that way).
 *
 * @example
 * ```tsx
 * <Calendar value={iso} onChange={setIso} minDate="2026-01-01" />
 * ```
 */
export const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  className = '',
}) => {
  const { t, language } = useLanguage();
  const labelId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  // Month/decade grids share one ref — only one upper view renders at a time.
  const pickerRef = useRef<HTMLDivElement>(null);
  // DOM focus is moved only after a keyboard navigation, never on mount.
  const pendingFocusRef = useRef(false);

  const [today] = useState<IsoDateParts>(getTodayParts);
  // Explicit month navigation; null = derive the viewed month from value/today.
  const [nav, setNav] = useState<{ year: number; month: number } | null>(null);
  const [focused, setFocused] = useState<IsoDateParts>(
    () => isoToParts(value ?? '') ?? getTodayParts()
  );
  const [view, setView] = useState<CalendarView>('day');

  const valueParts = value !== null ? isoToParts(value) : null;
  const base = valueParts ?? today;
  const viewed = nav ?? { year: base.year, month: base.month };
  const firstDay = FIRST_DAY_OF_WEEK[language];

  const isDisabled = (iso: string): boolean =>
    (minDate !== undefined && compareIsoDates(iso, minDate) < 0) ||
    (maxDate !== undefined && compareIsoDates(iso, maxDate) > 0);

  // A whole month is unselectable iff every day in it is out of range.
  // With one continuous [min, max] interval that is exactly
  // `last day < min || first day > max` (see the class doc remark).
  const isMonthDisabled = (year: number, month: number): boolean =>
    (minDate !== undefined &&
      compareIsoDates(partsToIso({ year, month, day: daysInMonth(year, month) }), minDate) < 0) ||
    (maxDate !== undefined && compareIsoDates(partsToIso({ year, month, day: 1 }), maxDate) > 0);

  const isYearDisabled = (year: number): boolean =>
    (minDate !== undefined &&
      compareIsoDates(partsToIso({ year, month: 12, day: 31 }), minDate) < 0) ||
    (maxDate !== undefined && compareIsoDates(partsToIso({ year, month: 1, day: 1 }), maxDate) > 0);

  const selectDay = (parts: IsoDateParts): void => {
    const iso = partsToIso(parts);
    if (isDisabled(iso)) {
      return;
    }
    setFocused(parts);
    onChange(iso);
  };

  // Moves focus to the roving cell after a keyboard navigation re-render,
  // or to the "current" cell of the upper view after a drill-down transition.
  useEffect(() => {
    if (!pendingFocusRef.current) {
      return;
    }
    pendingFocusRef.current = false;
    const target =
      view === 'day'
        ? gridRef.current?.querySelector<HTMLElement>('[data-focused="true"]')
        : pickerRef.current?.querySelector<HTMLElement>('[data-current="true"]');
    target?.focus();
  });

  const moveFocus = (next: IsoDateParts): void => {
    setFocused(next);
    if (next.month !== viewed.month || next.year !== viewed.year) {
      setNav({ year: next.year, month: next.month });
    }
    pendingFocusRef.current = true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    // The APG grid moves DOM focus directly (roving tabindex); read the
    // current day from the focused cell, not from React state — DOM focus
    // can also move via tab / screen reader without a state update.
    const iso = (event.target as HTMLElement).dataset.iso;
    const current = iso !== undefined ? isoToParts(iso) : null;
    if (current === null) {
      return;
    }

    const next = nextForKey(event.key, current, event.shiftKey, firstDay);
    if (next === null) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectDay(current);
      }
      return;
    }
    event.preventDefault();
    moveFocus(next);
  };

  const shiftPeriod = (delta: number): void => {
    if (view === 'day') {
      const next = addMonths(focused, delta);
      setNav({ year: next.year, month: next.month });
      setFocused(next);
      return;
    }
    // Month view steps ±1 year, decade view ±10 years. Focus stays on the
    // chevron — no re-render needs to move it.
    const step = view === 'month' ? delta : delta * 10;
    setNav({ year: viewed.year + step, month: viewed.month });
  };

  // Drill-up via the header: day → month → decade. The upper views are
  // terminal (decade header is inert). Focus moves into the new view.
  const drillUp = (event: React.MouseEvent): void => {
    event.stopPropagation();
    setView(view === 'day' ? 'month' : 'decade');
    pendingFocusRef.current = true;
  };

  const pickMonth = (month: number): void => {
    setNav({ year: viewed.year, month });
    setFocused((prev) => ({
      year: viewed.year,
      month,
      day: Math.min(prev.day, daysInMonth(viewed.year, month)),
    }));
    setView('day');
    pendingFocusRef.current = true;
  };

  const pickYear = (year: number): void => {
    setNav({ year, month: viewed.month });
    setView('month');
    pendingFocusRef.current = true;
  };

  // Fixed 6×7 grid: lead-back to the week start, then 42 consecutive days.
  const firstOfMonth: IsoDateParts = { year: viewed.year, month: viewed.month, day: 1 };
  const gridStart = addDays(firstOfMonth, -weekOffset(firstOfMonth, firstDay));
  const cells = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const weeks = Array.from({ length: 6 }, (_, week) => cells.slice(week * 7, week * 7 + 7));

  // Header label per view: "June 2026" → "2026" → "2020–2029" (en-dash).
  const decadeStart = Math.floor(viewed.year / 10) * 10;
  const headerText =
    view === 'day'
      ? `${t(MONTH_KEYS[viewed.month - 1] ?? '')} ${viewed.year}`
      : view === 'month'
        ? String(viewed.year)
        : `${decadeStart}–${decadeStart + 9}`;

  const prevLabel =
    view === 'day'
      ? 'calendarPrevMonth'
      : view === 'month'
        ? 'calendarPrevYear'
        : 'calendarPrevDecade';
  const nextLabel =
    view === 'day'
      ? 'calendarNextMonth'
      : view === 'month'
        ? 'calendarNextYear'
        : 'calendarNextDecade';

  return (
    <div className={classNames(styles.calendar, className)}>
      <div className={styles.header}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t(prevLabel)}
          onClick={(event) => {
            // Keep a DatePicker popover open (`closeOnContentClick`).
            event.stopPropagation();
            shiftPeriod(-1);
          }}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </Button>
        {view === 'decade' ? (
          <span id={labelId} className={styles.monthLabel}>
            {headerText}
          </span>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`${headerText}, ${
              view === 'day' ? t('calendarSelectMonth') : t('calendarSelectYear')
            }`}
            onClick={drillUp}
          >
            <span id={labelId} className={styles.monthLabel}>
              {headerText}
            </span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t(nextLabel)}
          onClick={(event) => {
            event.stopPropagation();
            shiftPeriod(1);
          }}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>

      {view === 'day' && (
        <div
          role="grid"
          aria-labelledby={labelId}
          ref={gridRef}
          onKeyDown={handleKeyDown}
          className={styles.grid}
        >
          <div role="row" className={styles.weekHeader}>
            {Array.from({ length: 7 }, (_, index) => {
              const weekdayIndex = (firstDay + index) % 7;
              return (
                <div role="columnheader" key={weekdayIndex} className={styles.weekday}>
                  {t(`calendarWeekday_${weekdayIndex}`)}
                </div>
              );
            })}
          </div>

          {weeks.map((week) => (
            <div role="row" key={partsToIso(week[0] as IsoDateParts)} className={styles.week}>
              {week.map((parts) => {
                const inMonth = parts.year === viewed.year && parts.month === viewed.month;
                const iso = partsToIso(parts);
                const isSelected = iso === value;
                const isFocused = sameDay(parts, focused);
                const isDayDisabled = isDisabled(iso);
                const isToday = sameDay(parts, today);

                return (
                  <div
                    key={iso}
                    role="gridcell"
                    data-iso={iso}
                    aria-label={`${parts.day} ${t(MONTH_KEYS[parts.month - 1] ?? '')}`}
                    aria-selected={isSelected || undefined}
                    aria-disabled={isDayDisabled || undefined}
                    aria-hidden={!inMonth || undefined}
                    tabIndex={isFocused ? 0 : -1}
                    data-today={isToday || undefined}
                    data-focused={isFocused || undefined}
                    className={classNames(
                      styles.day,
                      isSelected && styles.daySelected,
                      isToday && styles.dayToday,
                      isDayDisabled && styles.dayDisabled,
                      !inMonth && styles.dayOutside
                    )}
                    // No stopPropagation on purpose: the day click must
                    // bubble so a DatePicker popover closes itself.
                    onClick={inMonth ? () => selectDay(parts) : undefined}
                  >
                    {parts.day}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {view === 'month' && (
        <div
          role="group"
          aria-labelledby={labelId}
          ref={pickerRef}
          className={classNames(styles.pickerGrid, styles.pickerGridMonths)}
        >
          {MONTH_KEYS.map((key, index) => {
            const month = index + 1;
            const disabled = isMonthDisabled(viewed.year, month);
            const isCurrent = month === viewed.month;
            return (
              <button
                key={key}
                type="button"
                aria-disabled={disabled || undefined}
                data-current={isCurrent || undefined}
                className={classNames(
                  styles.pickerCell,
                  isCurrent && styles.pickerCellCurrent,
                  disabled && styles.pickerCellDisabled
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  if (disabled) {
                    return;
                  }
                  pickMonth(month);
                }}
              >
                {t(key)}
              </button>
            );
          })}
        </div>
      )}

      {view === 'decade' && (
        <div
          role="group"
          aria-labelledby={labelId}
          ref={pickerRef}
          className={classNames(styles.pickerGrid, styles.pickerGridYears)}
        >
          {Array.from({ length: 10 }, (_, index) => decadeStart + index).map((year) => {
            const disabled = isYearDisabled(year);
            const isCurrent = year === viewed.year;
            return (
              <button
                key={year}
                type="button"
                aria-disabled={disabled || undefined}
                data-current={isCurrent || undefined}
                className={classNames(
                  styles.pickerCell,
                  isCurrent && styles.pickerCellCurrent,
                  disabled && styles.pickerCellDisabled
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  if (disabled) {
                    return;
                  }
                  pickYear(year);
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
