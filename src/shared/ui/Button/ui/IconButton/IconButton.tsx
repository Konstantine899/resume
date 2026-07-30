// ============================================
// IconButton Component — polymorphic, useButton, icon size inference
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import React from 'react';
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
 * <IconButton component="a" href="/about" icon={<Mail />} ariaLabel="Mail" />
 * ```
 *
 * @example
 * // Loading state
 * ```tsx
 * <IconButton icon={<Edit size={20} />} ariaLabel="Edit" loading />
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
    component,
    asChild: _asChild,
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

  const Tag = component || ('button' as React.ElementType);
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
 * IconButton — icon-only button with polymorphic `component` prop and auto icon sizing.
 *
 * Defaults to rendering a `<button>` element. Use `component="a"` to render as a link.
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
