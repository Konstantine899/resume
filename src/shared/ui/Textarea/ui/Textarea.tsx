// ============================================
// Textarea Component — Senior+
// ============================================

import { forwardRef, memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Spinner } from '@/shared/ui/Spinner';
import { TEXTAREA_CONSTANTS } from '../model/constants';
import type { TextareaProps } from '../model/types';
import { validateTextareaProps } from '../lib/validateTextareaProps';
import styles from './Textarea.module.scss';

// ============================================
// Component
// ============================================

const TextareaComponent = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      size = 'md',
      className,
      label,
      error,
      success,
      loading,
      fullWidth = false,
      helperText,
      rows = TEXTAREA_CONSTANTS.DEFAULT_ROWS,
      clearable = false,
      onClear,
      showCounter = false,
      autoResize = false,
      id,
      icon,
      iconAfter,
      disabled,
      readOnly,
      required,
      placeholder,
      value: controlledValue,
      defaultValue,
      onChange,
      maxLength,
      ...props
    },
    ref
  ) => {
    // Dev warnings for invalid props
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        const warnings = validateTextareaProps(variant, size, showCounter, maxLength);
        warnings.forEach((w) => {
          // eslint-disable-next-line no-console
          console.warn(w.message);
        });
      }
    }, [variant, size, showCounter, maxLength]);

    // ==========================================
    // Accessibility IDs
    // ==========================================
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    const counterId = `${textareaId}-counter`;

    // ==========================================
    // Controlled / Uncontrolled
    // ==========================================
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string>(() => String(defaultValue ?? ''));
    const currentValue = isControlled ? controlledValue : internalValue;
    const valueString = String(currentValue ?? '');

    // Ref для autoResize
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // ==========================================
    // Handlers
    // ==========================================
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);

        // Auto-resize
        if (autoResize && textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      },
      [isControlled, onChange, autoResize]
    );

    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue('');
      }
      onClear?.();
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, [isControlled, onClear]);

    // ==========================================
    // Memoized ref callback — stable across renders
    // ==========================================
    const textareaRefCallback = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) {
          // eslint-disable-next-line no-param-reassign
          ref.current = node;
        }
      },
      [ref]
    );

    // ==========================================
    // Char Counter
    // ==========================================
    const charCount = valueString.length;
    const showCharCounter = showCounter && maxLength !== undefined;
    const isOverLimit = maxLength !== undefined && charCount > maxLength;
    const isNearLimit =
      maxLength !== undefined &&
      charCount >= maxLength * TEXTAREA_CONSTANTS.CHAR_COUNT_WARNING_THRESHOLD;

    // ==========================================
    // Auto-resize effect
    // ==========================================
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoResize, valueString]);

    // ==========================================
    // CSS Classes
    // ==========================================
    const textareaClasses = useMemo(
      () =>
        classNames(
          styles.textarea,
          styles[variant],
          styles[size],
          error && styles.error,
          success && styles.success,
          loading && styles.loading,
          autoResize && styles.autoResize,
          className
        ),
      [variant, size, error, success, loading, autoResize, className]
    );

    const wrapperClasses = useMemo(
      () => classNames(styles.textareaWrapper, fullWidth && styles.fullWidth),
      [fullWidth]
    );

    // ==========================================
    // Accessibility
    // ==========================================
    const describedBy = error
      ? errorId
      : helperText
        ? helperId
        : showCharCounter
          ? counterId
          : undefined;

    const showClearButton =
      clearable && valueString.length > 0 && !disabled && !readOnly && !loading;
    const showIconAfter = iconAfter && !loading && !showClearButton;

    // ==========================================
    // Render
    // ==========================================
    return (
      <div className={wrapperClasses} data-testid="textarea-wrapper">
        {label && (
          <label htmlFor={textareaId} className={styles.label} data-testid="textarea-label">
            {required && <span className={styles.required}>*</span>}
            {label}
          </label>
        )}

        <div className={styles.textareaContainer}>
          {icon && (
            <span className={styles.icon} aria-hidden="true" data-testid="textarea-icon">
              {icon}
            </span>
          )}

          <textarea
            ref={textareaRefCallback}
            id={textareaId}
            className={textareaClasses}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            rows={rows}
            maxLength={maxLength}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            aria-invalid={error ? true : undefined}
            aria-busy={loading ? true : undefined}
            aria-describedby={describedBy}
            data-testid="textarea"
            {...props}
          />

          {showClearButton && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label={TEXTAREA_CONSTANTS.CLEAR_BUTTON_LABEL}
              tabIndex={-1}
              data-testid="textarea-clear"
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

          {showIconAfter && (
            <span className={styles.iconAfter} aria-hidden="true" data-testid="textarea-icon-after">
              {iconAfter}
            </span>
          )}

          {loading && (
            <span className={styles.loadingIndicator} data-testid="textarea-loading">
              <Spinner size="sm" aria-label={TEXTAREA_CONSTANTS.LOADING_LABEL} />
            </span>
          )}
        </div>

        {error && (
          <Paragraph asChild theme="error" size="s" id={errorId} data-testid="textarea-error">
            <span role="alert">{error}</span>
          </Paragraph>
        )}

        {helperText && !error && (
          <Paragraph as="span" theme="muted" size="s" id={helperId} data-testid="textarea-helper">
            {helperText}
          </Paragraph>
        )}

        {showCharCounter && maxLength && (
          <span id={counterId} className={styles.counter} data-testid="textarea-counter">
            <span
              className={isOverLimit || isNearLimit ? styles.warning : ''}
              data-testid="textarea-counter-value"
            >
              {charCount}
            </span>
            /{maxLength}
          </span>
        )}
      </div>
    );
  }
);

TextareaComponent.displayName = 'Textarea';

export const Textarea = memo(TextareaComponent);
Textarea.displayName = 'Textarea';
