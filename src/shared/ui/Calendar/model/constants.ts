// src/shared/ui/Calendar/model/constants.ts

/**
 * Calendar constants: the 24×24 target-size floor (WCAG 2.2 SC 2.5.8,
 * same budget as Pagination) and the i18n week start per language.
 */
export const CALENDAR_CONSTANTS = {
  /** Minimum day-cell footprint in px. */
  MIN_TAP_TARGET_PX: 24,
  /** Fixed grid geometry: 6 weeks × 7 days — a stable box, no layout shift. */
  WEEKS_PER_GRID: 6,
  DAYS_PER_WEEK: 7,
} as const;

/**
 * Index of the first weekday: 0 = Sunday … 6 = Saturday (Date#getDay order).
 * ru starts the week on Monday, en on Sunday (план A3 / SPEC).
 */
export const FIRST_DAY_OF_WEEK: Record<'ru' | 'en', number> = {
  ru: 1,
  en: 0,
};
