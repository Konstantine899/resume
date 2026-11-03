// src/shared/ui/Calendar/model/types.ts

/**
 * Props of the kit Calendar month grid (ARIA APG date-grid pattern).
 *
 * The calendar is a pure controlled component: the ISO string is the only
 * date representation at its boundary (plan A7 — timezone protection, no
 * `Date` parsing inside).
 */
export interface CalendarProps {
  /** Selected date `yyyy-mm-dd` | null. `null` renders the current month without a selection. */
  value: string | null;
  /** Fires with the picked ISO date. */
  onChange: (iso: string) => void;
  /** Earliest selectable date `yyyy-mm-dd` (inclusive). */
  minDate?: string;
  /** Latest selectable date `yyyy-mm-dd` (inclusive). */
  maxDate?: string;
  /** Extra class for the root element. */
  className?: string;
}
