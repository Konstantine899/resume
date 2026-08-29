// ============================================
// Input Component
// ============================================

import React, { Children, useId, useCallback, useEffect, cloneElement } from 'react';
import { classNames } from '@/shared/lib/utils';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { Paragraph } from '@/shared/ui/Paragraph';
import type { InputOwnProps, PolymorphicProps } from '../model/types';
import { Spinner } from '@/shared/ui/Spinner';
import { Icon } from '@/shared/ui/Icon';
import { Eye, EyeOff } from 'lucide-react';
import { INPUT_CONSTANTS } from '../model/constants';
import { Skeleton } from '@/shared/ui/Skeleton';
import { validateInputProps } from '../lib/utils/validateInputProps';
import { inferIconSize } from '../lib/utils/inferIconSize';
import { sanitizeHref } from '../lib/utils/safeHref';
import { sanitizeAnchorProps } from '../lib/utils/sanitizeAnchorProps';
import { useInput } from '../model/hooks/useInput';
import { usePasswordToggle } from '../model/hooks/usePasswordToggle';
import styles from './Input.module.scss';
import { InputLabel } from './InputLabel/InputLabel';
import { InputCounter } from './InputCounter/InputCounter';
import { InputClearButton } from './InputClearButton/InputClearButton';

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
function InputImpl(
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
  }: PolymorphicProps<React.ElementType, InputOwnProps>,
  ref: React.ForwardedRef<React.ComponentRef<React.ElementType>>
) {
  const Tag = component || ('input' as React.ElementType);
  const isInputElement = Tag === 'input';
  const isValueElement = Tag === 'input' || Tag === 'textarea' || Tag === 'select';
  const resolvedProps = Tag === 'a' ? sanitizeAnchorProps(props as Record<string, unknown>) : props;

  // Генерация уникальных ID для accessibility
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const counterId = `${inputId}-counter`;

  // Ref для input
  const inputRef = React.useRef<HTMLElement>(null);
  const mergedRef = useMergeRefs(ref as React.Ref<HTMLElement>, inputRef);

  // asChild: resolve the single child element (or null) and merge its ref + sanitize anchor href
  const onlyChild =
    asChild && Children.count(children) === 1
      ? (Children.only(children) as React.ReactElement)
      : null;
  const childProps = (onlyChild?.props as Record<string, unknown> | undefined) ?? {};
  const childHref =
    onlyChild && onlyChild.type === 'a' && typeof childProps.href === 'string'
      ? sanitizeHref(childProps.href as string)
      : undefined;
  const childMergedRef = useMergeRefs(
    mergedRef,
    (childProps.ref as React.Ref<HTMLElement> | undefined) ?? null
  );

  // useInput hook for value state, character count, and accessible states
  const rawProps = props as Record<string, unknown>;
  const {
    value,
    isControlled,
    setInternalValue,
    charCount,
    showCharCounter,
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

  const ariaInvalid = Boolean(error) || (maxLengthValue != null && charCount > maxLengthValue);

  // usePasswordToggle hook
  const { showPassword, inputType, handleTogglePassword, isPassword } = usePasswordToggle({
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
    styles.input ?? '',
    styles[variant] ?? '',
    styles[size] ?? '',
    {
      [styles.error ?? '']: Boolean(error),
      [styles.success ?? '']: Boolean(success),
      [styles.loading ?? '']: Boolean(loading),
      [styles.fullWidth ?? '']: fullWidth,
    },
    className
  );

  const wrapperClasses = classNames(styles.inputWrapper ?? '', {
    [styles.fullWidth ?? '']: fullWidth,
  });

  // Accessibility props
  const describedByIds = [
    error ? errorId : undefined,
    helperText && !error ? helperId : undefined,
    showCharCounter ? counterId : undefined,
  ].filter(Boolean) as string[];
  const describedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;
  const dataStatus = error
    ? 'error'
    : success
      ? 'success'
      : loading
        ? 'loading'
        : skeleton
          ? 'skeleton'
          : undefined;

  return (
    <div
      className={wrapperClasses}
      data-testid="input-wrapper"
      data-state={states.length > 0 ? states.join(' ') : undefined}
      data-size={size}
      data-variant={variant}
      data-status={dataStatus}
      data-skeleton={skeleton || undefined}
      aria-busy={skeleton || undefined}
    >
      {label && variant !== 'floating' && (
        <InputLabel htmlFor={inputId} required={required}>
          {label}
        </InputLabel>
      )}

      <div
        className={classNames(styles.inputContainer ?? '', {
          [styles.floatingLabelWrapper ?? '']: variant === 'floating',
        })}
      >
        {icon && (
          <span
            className={variant === 'floating' ? (styles.iconFloating ?? '') : (styles.icon ?? '')}
            aria-hidden="true"
            data-testid={variant === 'floating' ? 'icon-floating' : 'icon'}
          >
            {inferIconSize(icon, size)}
          </span>
        )}

        {skeleton ? (
          <Skeleton
            variant="text"
            width={INPUT_CONSTANTS.SKELETON_WIDTH}
            height={INPUT_CONSTANTS.SKELETON_HEIGHT}
          />
        ) : onlyChild ? (
          /* asChild mode: clone the single child, merging its ref + sanitizing anchor href */
          cloneElement(onlyChild, {
            ...props,
            ...(childHref !== undefined ? { href: childHref } : {}),
            ref: childMergedRef,
            id: inputId,
            className: classNames(inputClasses, (childProps.className as string | undefined) ?? ''),
            disabled: disabled || undefined,
            readOnly: readOnly || undefined,
            required: required || undefined,
            'aria-required': required || undefined,
            'aria-invalid': ariaInvalid,
            'aria-busy': loading ? true : undefined,
            'aria-disabled': disabled || loading || undefined,
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
          } as Record<string, unknown>)
        ) : (
          <Tag
            ref={mergedRef}
            {...resolvedProps}
            id={inputId}
            className={inputClasses}
            disabled={isInputElement ? disabled : undefined}
            readOnly={isInputElement ? readOnly : undefined}
            required={isInputElement ? required : undefined}
            aria-required={required || undefined}
            aria-invalid={ariaInvalid}
            aria-disabled={disabled || loading || undefined}
            aria-busy={loading ? true : undefined}
            aria-describedby={describedBy}
            value={isValueElement ? value : undefined}
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
            className={styles.passwordToggle ?? ''}
            onClick={handleTogglePassword}
            disabled={disabled || loading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            tabIndex={0}
          >
            <Icon
              name={showPassword ? EyeOff : Eye}
              size={INPUT_CONSTANTS.PASSWORD_TOGGLE_ICON_SIZE}
              color="inherit"
              decorative
            />
          </button>
        )}

        {clearable &&
          currentValue.length > 0 &&
          !disabled &&
          !readOnly &&
          !loading &&
          !skeleton && <InputClearButton onClick={handleClear} />}

        {iconAfter && !loading && !clearable && !skeleton && (
          <span className={styles.iconAfter ?? ''} aria-hidden="true">
            {inferIconSize(iconAfter, size)}
          </span>
        )}

        {loading && !skeleton && (
          <span className={styles.loadingIndicator ?? ''}>
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
        <InputCounter
          current={charCount}
          max={maxLengthValue ?? 0}
          id={counterId}
          data-testid="counter"
        />
      )}
    </div>
  );
}

InputImpl.displayName = 'Input';

export const Input = React.forwardRef(InputImpl) as <C extends React.ElementType = 'input'>(
  props: PolymorphicProps<C, InputOwnProps> & {
    ref?: React.ForwardedRef<React.ComponentRef<C>>;
  }
) => React.ReactElement;
