// src/shared/ui/Select/ui/Select/Select.tsx

import { useId } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import styles from './Select.module.scss';
import type { SelectProps } from '../../model/types';

/**
 * Kit Select — нативный `<select>` со стилями kit (план plan_kit_select,
 * OPEN-1 = A). Закрытый контроль: `appearance: none` + собственная стрелка;
 * открытый пикер progressive enhancement через `@supports (appearance:
 * base-select)` — вне поддержки остаётся обычный нативный пикер.
 *
 * Строго управляемый (A3), без собственных строк (A2): label/placeholder/
 * error — строки потребителя через `t()`. RHF-интеграция — на стороне
 * потребителя: `setValue(name, value, { shouldDirty: true })` в onChange.
 */
export const Select = ({
  options,
  value,
  onChange,
  label,
  placeholder,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  disabled,
  required,
  fullWidth,
  className,
  id,
  name,
  ...rest
}: SelectProps) => {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const describedByIds: string[] = [];
  if (error !== undefined) {
    describedByIds.push(errorId);
  } else if (helperText !== undefined) {
    describedByIds.push(helperId);
  }

  const variantClass = variant === 'default' ? false : (styles[variant] ?? false);

  return (
    <div className={classNames(styles.selectRoot, fullWidth && styles.fullWidth, className)}>
      {label !== undefined && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className={styles.field}>
        <select
          {...rest}
          id={selectId}
          name={name}
          className={classNames(
            styles.select,
            styles[mapSizeToClass(size)],
            variantClass,
            error !== undefined && styles.error
          )}
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={error !== undefined || undefined}
          aria-describedby={describedByIds.length > 0 ? describedByIds.join(' ') : undefined}
          onChange={(event) => onChange(event.target.value)}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error !== undefined && (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
      {error === undefined && helperText !== undefined && (
        <span id={helperId} className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
};
