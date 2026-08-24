// ============================================
// Textarea Component — Senior+
// ============================================

import { forwardRef, memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Icon } from '@/shared/ui/Icon';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Spinner } from '@/shared/ui/Spinner';
import { TEXTAREA_CONSTANTS } from '../model/constants';
import type { TextareaProps } from '../model/types';
import { validateTextareaProps } from '../lib/utils/validateTextareaProps';
import styles from './Textarea.module.scss';

// ============================================
// Auto-resize utility
// ============================================

/**
 * Apply auto-resize to a textarea element.
 * Caps height at maxRows * lineHeight when maxRows is provided.
 */
function applyAutoResize(textarea: HTMLTextAreaElement, maxRows?: number): void {
  // eslint-disable-next-line no-param-reassign
  textarea.style.height = 'auto';
  if (maxRows !== undefined) {
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
    if (!Number.isNaN(lineHeight) && lineHeight > 0) {
      // eslint-disable-next-line no-param-reassign
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxRows * lineHeight)}px`;
    } else {
      // eslint-disable-next-line no-param-reassign
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  } else {
    // eslint-disable-next-line no-param-reassign
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}

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
      maxRows,
      resize,
      trimOnBlur = false,
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
      onBlur,
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

    // Ref for autoResize
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
          applyAutoResize(textareaRef.current, maxRows);
        }
      },
      [isControlled, onChange, autoResize, maxRows]
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

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (trimOnBlur) {
          const trimmed = valueString.trim();
          if (trimmed !== valueString) {
            if (isControlled) {
              // For controlled: update the DOM value, the dispatched input event
              // triggers React's onChange exactly once with the trimmed value.
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                'value'
              )?.set;
              if (nativeInputValueSetter) {
                nativeInputValueSetter.call(e.target, trimmed);
                e.target.dispatchEvent(new Event('input', { bubbles: true }));
              }
            } else {
              setInternalValue(trimmed);
            }
          }
        }
        onBlur?.(e);
      },
      [trimOnBlur, valueString, isControlled, onBlur]
    );

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
        applyAutoResize(textareaRef.current, maxRows);
      }
    }, [autoResize, maxRows, valueString]);

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
          resize && styles[`resize-${resize}`],
          className
        ),
      [variant, size, error, success, loading, autoResize, resize, className]
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
            onBlur={handleBlur}
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
              <Icon name={X} size={16} decorative />
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
          <span
            id={counterId}
            className={styles.counter}
            data-testid="textarea-counter"
            aria-live="polite"
            aria-atomic="true"
          >
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
