// ============================================
// Input Component
// ============================================

import React, { useId, useCallback, useEffect, isValidElement } from 'react';
import { classNames } from '@/shared/lib/utils';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { Paragraph } from '@/shared/ui/Paragraph';
import type { InputOwnProps, PolymorphicProps } from '../model/types';
import { Spinner } from '@/shared/ui/Spinner';
import { Eye, EyeOff } from 'lucide-react';
import { INPUT_CONSTANTS } from '../model/constants';
import { Skeleton } from '@/shared/ui/Skeleton';
import { validateInputProps } from '../lib/utils/validateInputProps';
import { inferIconSize } from '../lib/utils/inferIconSize';
import { useInput } from '../model/hooks/useInput';
import { usePasswordToggle } from '../model/hooks/usePasswordToggle';
import { ClearIcon } from './InputClearButton/InputClearIcon';
import styles from './Input.module.scss';
import { InputLabel } from './InputLabel/InputLabel';

/**
 * Input Component — универсальный компонент поля ввода с поддержкой полиморфизма.
 *
 * @example
 * ```tsx
 * <Input label="Email" type="email" placeholder="your@email.com" />
 * <Input label="Password" type="password" error="Invalid password" />
 * <Input label="Search" icon={<Search />} />
 * ```
 */
function InputImpl<C extends React.ElementType = 'input'>(
  {
    component,
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
    asChild = false,
    children,
    ...props
  }: PolymorphicProps<C, InputOwnProps>,
  ref: React.ForwardedRef<React.ComponentRef<C>>
) {
  const Tag = component || ('input' as React.ElementType);
  const isInputElement = Tag === 'input';

  // Генерация уникальных ID для accessibility
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const counterId = `${inputId}-counter`;

  // Ref для input
  const inputRef = React.useRef<HTMLElement>(null);
  const mergedRef = useMergeRefs(ref as React.Ref<HTMLElement>, inputRef);

  // useInput hook for value state, character count, and accessible states
  const rawProps = props as Record<string, unknown>;
  const {
    value,
    isControlled,
    setInternalValue,
    charCount,
    showCharCounter,
    isWarning,
    maxLengthValue,
    states,
    currentValue,
  } = useInput({
    value: rawProps.value as string | undefined,
    defaultValue: rawProps.defaultValue as string | undefined,
    maxLength: props.maxLength as number | undefined,
    showCounter,
    loading,
    error,
    disabled,
    readOnly,
    skeleton,
  });

  // usePasswordToggle hook
  const { showPassword, inputType, handleTogglePassword, handlePasswordToggleKeyDown, isPassword } =
    usePasswordToggle({
      type: props.type as string | undefined,
      showPasswordToggle,
    });

  // Обработчик очистки (memoized)
  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }

    onClear?.();
    inputRef.current?.focus();
  }, [isControlled, setInternalValue, onClear]);

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
            {inferIconSize(icon, size)}
          </span>
        )}

        {skeleton ? (
          <Skeleton variant="text" width="100%" height={INPUT_CONSTANTS.SKELETON_HEIGHT} />
        ) : asChild && isValidElement(children) ? (
          /* asChild mode: clone child element with all input props */
          /* eslint-disable react-hooks/refs */
          React.cloneElement(children, {
            ref: mergedRef,
            id: inputId,
            className: classNames(
              inputClasses,
              (children.props as Record<string, unknown>).className as string | undefined
            ),
            disabled: disabled || undefined,
            readOnly: readOnly || undefined,
            required: required || undefined,
            'aria-required': required || undefined,
            'aria-invalid': Boolean(error),
            'aria-busy': loading ? true : undefined,
            'aria-describedby': describedBy,
            value: value || undefined,
            onChange: (e: React.ChangeEvent<HTMLElement>) => {
              if (!isControlled) {
                setInternalValue((e.target as HTMLInputElement).value);
              }
              (props.onChange as React.ChangeEventHandler<HTMLElement> | undefined)?.(e);
            },
            onBlur: (e: React.FocusEvent<HTMLElement>) => {
              (props.onBlur as React.FocusEventHandler<HTMLElement> | undefined)?.(e);
            },
            placeholder: variant === 'floating' ? ' ' : props.placeholder,
            type: inputType,
            ...props,
          } as Record<string, unknown>)
        ) : (
          /* eslint-enable react-hooks/refs */
          <Tag
            ref={mergedRef}
            {...props}
            id={inputId}
            className={inputClasses}
            disabled={isInputElement ? disabled : undefined}
            readOnly={isInputElement ? readOnly : undefined}
            required={isInputElement ? required : undefined}
            aria-required={required || undefined}
            aria-invalid={Boolean(error)}
            aria-busy={loading ? true : undefined}
            aria-describedby={describedBy}
            value={isInputElement ? value : undefined}
            onChange={(e: React.ChangeEvent<HTMLElement>) => {
              if (!isControlled) {
                setInternalValue((e.target as HTMLInputElement).value);
              }
              (props.onChange as React.ChangeEventHandler<HTMLElement> | undefined)?.(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLElement>) => {
              (props.onBlur as React.FocusEventHandler<HTMLElement> | undefined)?.(e);
            }}
            placeholder={
              isInputElement ? (variant === 'floating' ? ' ' : props.placeholder) : undefined
            }
            type={isInputElement ? inputType : undefined}
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
            {inferIconSize(iconAfter, size)}
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

      {showCharCounter && !skeleton && (
        <span id={counterId} className={styles.counter} data-testid="counter" aria-live="polite">
          <span className={isWarning ? styles.warning : ''}>{charCount}</span>/{maxLengthValue}
        </span>
      )}
    </div>
  );
}

InputImpl.displayName = 'Input';

export const Input = React.memo(
  InputImpl as React.FC<PolymorphicProps<React.ElementType, InputOwnProps>>
) as <C extends React.ElementType = 'input'>(
  props: PolymorphicProps<C, InputOwnProps> & {
    ref?: React.ForwardedRef<React.ComponentRef<C>>;
  }
) => React.ReactElement;
