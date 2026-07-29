// ============================================
// Input Component
// ============================================

import React, { useId, useCallback, forwardRef, useEffect } from 'react';
import { classNames } from '@/shared/lib/utils';
import { Paragraph } from '@/shared/ui/Paragraph';
import type { InputProps } from '../model/types';
import { Spinner } from '@/shared/ui/Spinner';
import { Eye, EyeOff } from 'lucide-react';
import { INPUT_CONSTANTS } from '../model/constants';
import { Skeleton } from '@/shared/ui/Skeleton';
import { validateInputProps } from '../lib/utils/validateInputProps';
import { ClearIcon } from './InputClearIcon';
import styles from './Input.module.scss';
import { InputLabel } from './InputLabel/InputLabel';

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
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      className = '',
      label,
      error,
      success,
      loading,
      skeleton,
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
      showPasswordToggle = false,
      ...props
    },
    ref
  ) => {
    // Генерация уникальных ID для accessibility
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const counterId = `${inputId}-counter`;

    // Ref для input
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

    // Определяем controlled/uncontrolled
    const isControlled = props.value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(() =>
      isControlled ? (props.value as string) : String(props.defaultValue ?? '')
    );
    const value = isControlled ? (props.value as string) : internalValue;

    // State для password visibility toggle
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = props.type === 'password';
    const inputType =
      isPassword && showPasswordToggle ? (showPassword ? 'text' : 'password') : props.type;

    // Обработчик очистки (memoized)
    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue('');
      }

      onClear?.();
      inputRef.current?.focus();
    }, [isControlled, onClear]);

    // Toggle password visibility (memoized)
    const handleTogglePassword = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    // Password toggle keyboard handler
    const handlePasswordToggleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTogglePassword();
        }
      },
      [handleTogglePassword]
    );

    // Dev warnings for invalid props
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        const warnings = validateInputProps(
          variant,
          size,
          showCounter,
          props.maxLength as number | undefined,
          disabled,
          loading
        );
        warnings.forEach((w) => {
          // eslint-disable-next-line no-console
          console.warn(w.message);
        });
      }
    }, [variant, size, showCounter, props.maxLength, disabled, loading]);

    // Вычисление количества символов
    const currentValue = String(value ?? '');
    const maxLength = props.maxLength as number | undefined;
    const charCount = currentValue.length;
    const showCharCounter = showCounter && maxLength !== undefined;
    const isWarning =
      maxLength && charCount >= maxLength * INPUT_CONSTANTS.COUNTER_WARNING_THRESHOLD;

    // Build CSS classes (используем classNames)
    const inputClasses = classNames(
      styles.input,
      styles[variant],
      styles[size],
      {
        [styles.error]: Boolean(error),
        [styles.success]: Boolean(success),
        [styles.loading]: Boolean(loading),
        [styles.fullWidth]: fullWidth,
      },
      className
    );

    const wrapperClasses = classNames(styles.inputWrapper, {
      [styles.fullWidth]: fullWidth,
    });

    // Build data-state string для accessibility
    const states: string[] = [];
    if (loading) states.push('loading');
    if (error) states.push('error');
    if (disabled) states.push('disabled');
    if (readOnly) states.push('readonly');
    if (skeleton) states.push('skeleton');

    // Accessibility props
    const describedBy = error
      ? errorId
      : helperText
        ? helperId
        : showCharCounter
          ? counterId
          : undefined;

    return (
      <div
        className={wrapperClasses}
        data-testid="input-wrapper"
        data-state={states.length > 0 ? states.join(' ') : undefined}
        data-size={size}
        data-variant={variant}
        data-status={
          error
            ? 'error'
            : success
              ? 'success'
              : loading
                ? 'loading'
                : skeleton
                  ? 'skeleton'
                  : undefined
        }
        data-skeleton={skeleton || undefined}
        aria-busy={skeleton || undefined}
      >
        {label && variant !== 'floating' && (
          <InputLabel htmlFor={inputId} required={required}>
            {label}
          </InputLabel>
        )}

        <div
          className={classNames(styles.inputContainer, {
            [styles.floatingLabelWrapper]: variant === 'floating',
          })}
        >
          {icon && (
            <span
              className={variant === 'floating' ? styles.iconFloating : styles.icon}
              aria-hidden="true"
              data-testid={variant === 'floating' ? 'icon-floating' : 'icon'}
            >
              {icon}
            </span>
          )}

          {skeleton ? (
            <Skeleton variant="text" width="100%" height={INPUT_CONSTANTS.SKELETON_HEIGHT} />
          ) : (
            <input
              ref={inputRef}
              {...props}
              id={inputId}
              className={inputClasses}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              aria-required={required || undefined}
              aria-invalid={Boolean(error)}
              aria-busy={loading ? true : undefined}
              aria-describedby={describedBy}
              value={value}
              onChange={(e) => {
                if (!isControlled) {
                  setInternalValue(e.target.value);
                }
                props.onChange?.(e);
              }}
              onBlur={(e) => {
                props.onBlur?.(e);
              }}
              placeholder={variant === 'floating' ? ' ' : props.placeholder}
              type={inputType}
            />
          )}

          {label && variant === 'floating' && (
            <InputLabel htmlFor={inputId} required={required} floating>
              {label}
            </InputLabel>
          )}

          {showPasswordToggle && isPassword && !skeleton && (
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={handleTogglePassword}
              onKeyDown={handlePasswordToggleKeyDown}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff size={INPUT_CONSTANTS.PASSWORD_TOGGLE_ICON_SIZE} />
              ) : (
                <Eye size={INPUT_CONSTANTS.PASSWORD_TOGGLE_ICON_SIZE} />
              )}
            </button>
          )}

          {clearable &&
            currentValue.length > 0 &&
            !disabled &&
            !readOnly &&
            !loading &&
            !skeleton && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
                aria-label="Clear input"
                tabIndex={0}
              >
                <ClearIcon />
              </button>
            )}

          {iconAfter && !loading && !clearable && !skeleton && (
            <span className={styles.iconAfter} aria-hidden="true">
              {iconAfter}
            </span>
          )}

          {loading && !skeleton && (
            <span className={styles.loadingIndicator}>
              <Spinner size="sm" />
            </span>
          )}
        </div>

        {error && (
          <Paragraph asChild theme="error" size="s" id={errorId}>
            <span role="alert">{error}</span>
          </Paragraph>
        )}

        {helperText && !error && (
          <Paragraph as="span" theme="muted" size="s" id={helperId}>
            {helperText}
          </Paragraph>
        )}

        {showCharCounter && maxLength && !skeleton && (
          <span id={counterId} className={styles.counter} data-testid="counter" aria-live="polite">
            <span className={isWarning ? styles.warning : ''}>{charCount}</span>/{maxLength}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
