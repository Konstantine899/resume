// ============================================
// Input Component
// ============================================

import React, {
  Children,
  useId,
  useCallback,
  useEffect,
  cloneElement,
  isValidElement,
} from 'react';
import { classNames, sanitizeHref } from '@/shared/lib/utils';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { Paragraph } from '@/shared/ui/Paragraph';
import type { InputOwnProps, InputStatus, PolymorphicProps } from '../model/types';
import { Spinner } from '@/shared/ui/Spinner';
import { Icon } from '@/shared/ui/Icon';
import { Eye, EyeOff } from 'lucide-react';
import { INPUT_CONSTANTS } from '../model/constants';
import { Skeleton } from '@/shared/ui/Skeleton';
import { validateInputProps } from '../lib/utils/validateInputProps';
import { inferIconSize } from '../lib/utils/inferIconSize';
import { useInput } from '../lib/hooks/useInput';
import { usePasswordToggle } from '../lib/hooks/usePasswordToggle';
import { InputClearButton } from './InputClearButton/InputClearButton';
import { InputCounter } from './InputCounter/InputCounter';
import styles from './Input.module.scss';
import { InputLabel } from './InputLabel/InputLabel';

/**
 * Resolves the wrapper `data-status` attribute with a fixed priority:
 * error > success > loading > skeleton.
 */
function resolveStatus(options: {
  error?: string;
  success?: boolean;
  loading?: boolean;
  skeleton?: boolean;
}): InputStatus | undefined {
  if (options.error) return 'error';
  if (options.success) return 'success';
  if (options.loading) return 'loading';
  if (options.skeleton) return 'skeleton';
  return undefined;
}

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
function InputImpl<C extends React.ElementType = 'input'>({
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
  href,
  // React 19 delivers `ref` as a regular prop (the legacy second-arg form is
  // never populated for plain function components) — destructure it so the
  // merged ref below is not clobbered by the rest-props spread.
  ref,
  ...props
}: PolymorphicProps<C, InputOwnProps> & {
  ref?: React.ForwardedRef<React.ComponentRef<C>>;
}) {
  const Tag = component || ('input' as React.ElementType);
  const isInputElement = Tag === 'input';
  // Form controls accept value/onChange/onBlur; only input/textarea take
  // placeholder and readOnly (select has neither attribute).
  const isFormControl = isInputElement || Tag === 'textarea' || Tag === 'select';
  const isTextFormControl = isInputElement || Tag === 'textarea';

  // Генерация уникальных ID для accessibility
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const counterId = `${inputId}-counter`;

  // Ref для input
  const inputRef = React.useRef<HTMLElement>(null);
  const mergedRef = useMergeRefs(ref as React.Ref<HTMLElement>, inputRef);

  // Accessibility props (destructured for the dev-warning effect below)
  const ariaLabel = props['aria-label'] as string | undefined;
  const ariaLabelledby = props['aria-labelledby'] as string | undefined;

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

  // Overflow past maxLength must be announced as invalid, not just styled.
  const isOverflow = maxLengthValue !== undefined && charCount > maxLengthValue;
  const ariaInvalid = Boolean(error) || isOverflow;

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

  // asChild accepts exactly one child element; anything else falls back to <Tag>.
  const asChildChildrenCount =
    asChild && children !== undefined && children !== null ? Children.count(children) : undefined;
  const asChildCandidates = asChildChildrenCount !== undefined ? Children.toArray(children) : [];
  const asChildChild: React.ReactElement | null =
    asChildCandidates.length === 1 && isValidElement(asChildCandidates[0])
      ? (asChildCandidates[0] as React.ReactElement)
      : null;
  const asChildChildProps = (asChildChild?.props ?? {}) as Record<string, unknown>;

  // Dev warnings for invalid props
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // In asChild mode the rendered element is the child, so its accessible
      // name (aria-label / aria-labelledby) also satisfies the requirement.
      const childProps =
        asChild && children && typeof children === 'object' && 'props' in children
          ? (children.props as Record<string, unknown>)
          : undefined;
      const warnings = validateInputProps(
        variant,
        size,
        showCounter,
        props.maxLength as number | undefined,
        disabled,
        loading,
        {
          label,
          ariaLabel,
          ariaLabelledby,
        },
        {
          ariaLabel: childProps?.['aria-label'] as string | undefined,
          ariaLabelledby: childProps?.['aria-labelledby'] as string | undefined,
        },
        asChildChildrenCount
      );
      warnings.forEach((w) => {
        // eslint-disable-next-line no-console
        console.warn(w.message);
      });
    }
  }, [
    variant,
    size,
    showCounter,
    props.maxLength,
    disabled,
    loading,
    label,
    ariaLabel,
    ariaLabelledby,
    asChild,
    children,
    asChildChildrenCount,
  ]);

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

  // Accessibility props: join every visible describer (error/helper are mutually
  // exclusive, the char counter is announced alongside them).
  const describedByIds: string[] = [];
  if (error) {
    describedByIds.push(errorId);
  } else if (helperText) {
    describedByIds.push(helperId);
  }
  if (showCharCounter && !skeleton) {
    describedByIds.push(counterId);
  }
  const describedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

  const status = resolveStatus({ error, success, loading, skeleton });

  const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
    if (!isControlled) {
      setInternalValue((e.target as HTMLInputElement).value);
    }
    (props.onChange as React.ChangeEventHandler<HTMLElement> | undefined)?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    (props.onBlur as React.FocusEventHandler<HTMLElement> | undefined)?.(e);
  };

  return (
    <div
      className={wrapperClasses}
      data-testid="input-wrapper"
      data-state={states.length > 0 ? states.join(' ') : undefined}
      data-size={size}
      data-variant={variant}
      data-status={status}
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
        ) : asChildChild ? (
          /* asChild mode: clone child element with all input props */
          /* eslint-disable react-hooks/refs */
          cloneElement(asChildChild, {
            // Raw caller props FIRST: every controlled key below must win over
            // the rest spread (onChange/ref/placeholder/type/... arrive inside
            // props on React 19) — spreading them last would clobber the merge.
            ...props,
            ref: mergedRef,
            id: inputId,
            className: classNames(inputClasses, asChildChildProps.className as string | undefined),
            disabled: disabled || undefined,
            readOnly: readOnly || undefined,
            required: required || undefined,
            'aria-required': required || undefined,
            'aria-invalid': ariaInvalid,
            'aria-busy': loading ? true : undefined,
            'aria-describedby': describedBy,
            value: isControlled ? value : value || undefined,
            onChange: handleChange,
            onBlur: handleBlur,
            placeholder: variant === 'floating' ? ' ' : props.placeholder,
            type: inputType,
            // Sanitize the child's own href (kept when the Input has none).
            ...(asChildChildProps.href !== undefined
              ? { href: sanitizeHref(asChildChildProps.href as string) }
              : {}),
            // An explicit Input-level href overrides the child's and is sanitized too.
            ...(href !== undefined ? { href: sanitizeHref(href) } : {}),
          } as Record<string, unknown>)
        ) : (
          /* eslint-enable react-hooks/refs */
          <Tag
            ref={mergedRef}
            {...props}
            id={inputId}
            className={inputClasses}
            disabled={isFormControl ? disabled : undefined}
            readOnly={isTextFormControl ? readOnly : undefined}
            required={isFormControl ? required : undefined}
            aria-required={required || undefined}
            aria-invalid={ariaInvalid}
            aria-busy={loading ? true : undefined}
            aria-describedby={describedBy}
            value={isFormControl ? value : undefined}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={
              isTextFormControl ? (variant === 'floating' ? ' ' : props.placeholder) : undefined
            }
            type={isInputElement ? inputType : undefined}
            {...(href !== undefined ? { href: sanitizeHref(href) } : {})}
          />
        )}

        {label && variant === 'floating' && (
          <InputLabel htmlFor={inputId} required={required} floating>
            {label}
          </InputLabel>
        )}

        {showPasswordToggle && isPassword && !skeleton && !disabled && !readOnly && !loading && (
          <button
            type="button"
            className={styles.passwordToggle ?? ''}
            onClick={handleTogglePassword}
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
          !skeleton && <InputClearButton onClick={handleClear} tabIndex={0} />}

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
          id={counterId}
          current={charCount}
          max={maxLengthValue ?? 0}
          data-testid="counter"
        />
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
