// src/shared/ui/DatePicker/ui/DatePicker/DatePicker.tsx

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Calendar } from '@/shared/ui/Calendar';
import { Input } from '@/shared/ui/Input';
import { Popover } from '@/shared/ui/Popover';
import { CalendarDays } from 'lucide-react';
import React, { useState } from 'react';
import { formatDisplayDate, parseDisplayDate } from '../../lib/isoDate';
import styles from './DatePicker.module.scss';

/**
 * DatePicker props. The ISO string `yyyy-mm-dd` is the only date
 * representation at the boundary (plan A7 / OPEN-4).
 */
export interface DatePickerProps {
  /** Selected date `yyyy-mm-dd` | null. */
  value: string | null;
  /** Fires with the picked ISO date, or null when cleared. */
  onChange: (iso: string | null) => void;
  /** Earliest selectable date `yyyy-mm-dd` (inclusive). */
  minDate?: string;
  /** Latest selectable date `yyyy-mm-dd` (inclusive). */
  maxDate?: string;
  /** Input label (kit Input contract). */
  label?: string;
  /** Error message string (kit Input contract — not a boolean). */
  error?: string;
  /** Renders the clear button; clear fires onChange(null). */
  clearable?: boolean;
  /** Extra class for the root element. */
  className?: string;
}

/**
 * DatePicker — kit date field: kit Input + calendar-icon Popover trigger
 * + Calendar grid (plan_kit_calendar WU-2).
 *
 * @remarks
 * - Controlled only: `value` is ISO or null; the input DISPLAYS
 *   `dd.mm.yyyy` in both locales (OPEN-4).
 * - Manual typing accepts `dd.mm.yyyy` (and ISO — single parser). An
 *   unparseable non-empty value highlights the error, never throws.
 * - The Popover trigger is a separate icon button, NOT a wrapper around
 *   the Input — PopoverTrigger hardcodes `role="button"`, so wrapping an
 *   input would create a nested-interactive a11y failure.
 * - Selecting a day closes the popover (`closeOnContentClick`); clearing
 *   via the Input's built-in clear button fires `onChange(null)`.
 *
 * @example
 * ```tsx
 * <DatePicker value={iso} onChange={setIso} label="Start date" clearable />
 * ```
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  label,
  error,
  clearable = false,
  className = '',
}) => {
  const { t } = useLanguage();
  // Local draft of the input text; synced from value, updated while typing.
  const [text, setText] = useState(() => (value !== null ? formatDisplayDate(value) : ''));
  const [invalid, setInvalid] = useState(false);

  // Keep the draft in sync when the parent sets the value (calendar pick,
  // external reset). No setState-in-effect violation: this is a prop-sync
  // adjust during render via the prev-value pattern below.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value !== null ? formatDisplayDate(value) : '');
    setInvalid(false);
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.value;
    setText(next);
    if (next.trim() === '') {
      setInvalid(false);
      onChange(null);
      return;
    }
    const iso = parseDisplayDate(next);
    if (iso !== null) {
      setInvalid(false);
      onChange(iso);
    } else {
      // Partial typing (e.g. "20.06.20") is not an error yet — only flag
      // fully-formed-but-invalid dates. A crude but effective heuristic:
      // the field looks complete once it has 10 characters.
      setInvalid(next.length >= 10);
    }
  };

  return (
    <div className={classNames(styles.datePicker, className)}>
      <Popover.Provider closeOnContentClick closeOnEsc closeOnClickOutside>
        <div className={styles.row}>
          <Input
            value={text}
            onChange={handleTextChange}
            label={label}
            error={error ?? (invalid ? t('calendarInvalidDate') : undefined)}
            clearable={clearable}
            onClear={clearable ? () => onChange(null) : undefined}
            fullWidth
            showCounter={false}
            inputMode="numeric"
            autoComplete="off"
          />
          <Popover.Trigger
            as="button"
            type="button"
            aria-label={t('calendarOpen')}
            className={styles.trigger}
          >
            <CalendarDays size={16} aria-hidden="true" />
          </Popover.Trigger>
        </div>
        <Popover.Content position="bottom" size="sm">
          <Calendar value={value} onChange={onChange} minDate={minDate} maxDate={maxDate} />
        </Popover.Content>
      </Popover.Provider>
    </div>
  );
};
