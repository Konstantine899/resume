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
  ...props
}) => {
  // Генерация уникальных ID для accessibility
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

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
  const describedBy = error ? errorId : helperText ? helperId : undefined;

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
          <span className={styles.icon} aria-hidden="true">
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
          {...props}
        />

        {iconAfter && !loading && (
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
    </div>
  );
};

Input.displayName = 'Input';

export default Input;
