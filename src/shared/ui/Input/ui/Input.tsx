// ============================================
// Input Component
// ============================================

import React, { useId } from 'react';
import type { InputProps } from '../model/types';
import { Loader } from '@/shared/ui/Loader';
import styles from './Input.module.scss';

/**
 * Input Component — универсальный компонент поля ввода
 *
 * @example
 * ```tsx
 * <Input label="Email" type="email" placeholder="your@email.com" />
 * <Input label="Password" type="password" error="Invalid password" />
 * <Input label="Search" icon={<Search />} />
 * ```
 */
export const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  label,
  error,
  success,
  loading,
  icon,
  iconAfter,
  fullWidth = false,
  helperText,
  id,
  disabled,
  readOnly,
  required,
  showCounter = false,
  clearable = false,
  onClear,
  ...props
}) => {
  // Генерация уникальных ID для accessibility
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const counterId = `${inputId}-counter`;

  // State для clearable input
  const [value, setValue] = React.useState(props.defaultValue || props.value);

  // Обработчик изменения значения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  // Обработчик очистки
  const handleClear = () => {
    setValue('');
    onClear?.();
    const input = document.getElementById(inputId);
    if (input) {
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  // Вычисление количества символов
  const currentValue = String(value || props.value || props.defaultValue || '');
  const maxLength = props.maxLength as number | undefined;
  const charCount = currentValue.length;
  const showCharCounter = showCounter && maxLength !== undefined;

  // Build CSS classes
  const inputClasses = [
    styles.input,
    styles[variant],
    styles[size],
    error && styles.error,
    success && styles.success,
    loading && styles.loading,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = [styles.inputWrapper, fullWidth && styles.fullWidth]
    .filter(Boolean)
    .join(' ');

  // Accessibility props
  const describedBy = error
    ? errorId
    : helperText
      ? helperId
      : showCharCounter
        ? counterId
        : undefined;

  return (
    <div className={wrapperClasses} data-testid="input-wrapper">
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {required && <span className={styles.required}>*</span>}
          {label}
        </label>
      )}

      <div className={styles.inputContainer}>
        {icon && (
          <span className={styles.iconFloating} aria-hidden="true" data-testid="icon-floating">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={!!error}
          aria-busy={loading}
          aria-describedby={describedBy}
          value={value}
          onChange={handleChange}
          placeholder={variant === 'floating' ? ' ' : props.placeholder}
          {...props}
        />

        {clearable && currentValue.length > 0 && !disabled && !readOnly && !loading && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear input"
            tabIndex={-1}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {iconAfter && !loading && !clearable && (
          <span className={styles.iconAfter} aria-hidden="true">
            {iconAfter}
          </span>
        )}

        {loading && (
          <span className={styles.loadingIndicator}>
            <Loader size="sm" />
          </span>
        )}
      </div>

      {error && (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      )}

      {helperText && !error && (
        <span id={helperId} className={styles.helperText}>
          {helperText}
        </span>
      )}

      {showCharCounter && maxLength && (
        <span id={counterId} className={styles.counter} data-testid="counter">
          <span className={charCount >= maxLength * 0.9 ? styles.warning : ''}>{charCount}</span>/
          {maxLength}
        </span>
      )}
    </div>
  );
};

Input.displayName = 'Input';

export default Input;
