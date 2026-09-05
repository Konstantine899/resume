// ============================================
// IconButton Component — polymorphic, useButton, icon size inference
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import React, { Children, cloneElement, isValidElement } from 'react';
import type { ButtonOwnProps, ButtonSize, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
import { inferIconSize } from '../../lib/utils/inferIconSize';
import styles from './IconButton.module.scss';

/**
 * IconButton Component — кнопка только с иконкой
 *
 * @example
 * // Basic usage
 * ```tsx
 * <IconButton icon={<Mail size={20} />} ariaLabel="Отправить письмо" variant="ghost" />
 * ```
 *
 * @example
 * // As a link
 * ```tsx
 * <IconButton as="a" href="/about" icon={<Mail />} ariaLabel="Mail" />
 * ```
 *
 * @example
 * // Loading state
 * ```tsx
 * <IconButton icon={<Edit size={20} />} ariaLabel="Edit" loading />
 * ```
 *
 * @example
 * // asChild pattern
 * ```tsx
 * <IconButton asChild>
 *   <a href="/about"><Mail /></a>
 * </IconButton>
 * ```
 */
function IconButtonImpl<C extends React.ElementType = 'button'>(
  {
    icon,
    ariaLabel,
    variant = 'primary',
    size = 'md',
    colorScheme,
    onClick,
    disabled = false,
    className = '',
    type,
    fullWidth = false,
    loading = false,
    loadingVariant = 'spinner',
    as,
    asChild = false,
    children,
    ...props
  }: PolymorphicProps<C, ButtonOwnProps & { icon: React.ReactNode; ariaLabel: string }>,
  ref: React.ForwardedRef<React.ComponentRef<C>>
) {
  const { buttonClassName, contentClassName, handleClick, loader } = useButton({
    variant: variant === 'danger' ? 'primary' : variant,
    size,
    colorScheme: colorScheme ?? (variant === 'danger' ? 'danger' : undefined),
    loading,
    loadingVariant,
    fullWidth,
    disabled,
    className,
    onClick,
    styles,
  });

  // asChild mode: merge props into child element instead of rendering own DOM node
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      return null;
    }

    const isDisabled = disabled || loading;
    const childProps = child.props as Record<string, unknown>;

    /* eslint-disable react-hooks/refs */
    return cloneElement(child, {
      className: classNames(
        buttonClassName,
        childProps.className as string,
        isDisabled && styles.disabled
      ),
      onClick: handleClick,
      'aria-label': ariaLabel,
      'aria-disabled': isDisabled || undefined,
      'aria-busy': loading || undefined,
      'data-state': loading ? 'loading' : 'idle',
      'data-testid': 'icon-button',
      ref: ref as React.Ref<unknown>,
      ...props,
    } as Record<string, unknown>) as React.ReactElement;
    /* eslint-enable react-hooks/refs */
  }

  const Tag = as || ('button' as React.ElementType);
  const isButtonElement = Tag === 'button';
  const isDisabled = disabled || loading;
  const sizedIcon = inferIconSize(icon, size as ButtonSize);

  return (
    <Tag
      ref={ref as React.Ref<React.ComponentRef<C>>}
      role={!isButtonElement ? 'button' : undefined}
      onClick={handleClick}
      className={classNames(buttonClassName, isDisabled && !isButtonElement && styles.disabled)}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="icon-button"
      {...(isButtonElement ? { disabled: isDisabled, type: type || 'button' } : {})}
      {...props}
    >
      {loader}
      <span className={contentClassName}>{sizedIcon}</span>
    </Tag>
  ) as React.ReactElement;
}

IconButtonImpl.displayName = 'IconButton';

/**
 * IconButton — icon-only button with polymorphic `as` prop and auto icon sizing.
 *
 * Defaults to rendering a `<button>` element. Use `as="a"` to render as a link.
 * Use `asChild` to compose with a single child element (Radix Slot pattern).
 * Icon size is auto-inferred from button size unless the icon has an explicit `size` prop.
 */
export const IconButton = React.memo(
  IconButtonImpl as React.FC<
    PolymorphicProps<
      React.ElementType,
      ButtonOwnProps & { icon: React.ReactNode; ariaLabel: string }
    >
  >
) as <C extends React.ElementType = 'button'>(
  props: PolymorphicProps<C, ButtonOwnProps & { icon: React.ReactNode; ariaLabel: string }> & {
    ref?: React.ForwardedRef<React.ComponentRef<C>>;
  }
) => React.ReactElement;
