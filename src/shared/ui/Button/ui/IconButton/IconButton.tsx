// ============================================
// IconButton Component — polymorphic, useButton, icon size inference
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { sanitizeHref } from '@/shared/lib/utils';
import React, { Children, cloneElement, isValidElement, useMemo } from 'react';
import type { ButtonOwnProps, ButtonSize, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
import { isInteractiveElement, mergeAsChildProps } from '../../lib/utils/mergeAsChildProps';
import { resolveButtonAppearance } from '../../lib/utils/resolveButtonAppearance';
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
    children,
    variant = 'primary',
    size = 'md',
    colorScheme,
    onClick,
    onKeyDown,
    disabled = false,
    className = '',
    type,
    fullWidth = false,
    loading = false,
    loadingVariant = 'spinner',
    component,
    asChild = false,
    href,
    ...props
  }: PolymorphicProps<C, ButtonOwnProps & { icon: React.ReactNode; ariaLabel: string }>,
  ref: React.ForwardedRef<React.ComponentRef<C>>
) {
  const { buttonClassName, contentClassName, handleClick, handleKeyDown, loader } = useButton({
    ...resolveButtonAppearance(variant, colorScheme),
    size,
    loading,
    loadingVariant,
    fullWidth,
    disabled,
    className,
    onClick,
    onKeyDown,
    cssModule: styles,
  });

  const sizedIcon = useMemo(() => inferIconSize(icon, size as ButtonSize), [icon, size]);

  // asChild mode: merge props into child element instead of rendering own DOM node.
  // The child owns the content (icon included) — no loader/content wrapper is rendered.
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      return null;
    }

    const isDisabled = disabled || loading;
    // React 19 delivers `ref` inside props (the legacy second-arg `ref` is undefined for
    // non-forwardRef components), so restProps below already carries the real ref — do not
    // re-add `ref` after the spread or the undefined second-arg value would mask it.
    return cloneElement(child, {
      ...mergeAsChildProps({
        child,
        buttonClassName,
        disabledClassName: styles.disabled,
        dataTestId: 'icon-button',
        handleClick,
        handleKeyDown,
        isDisabled,
        loading,
        href,
        extraProps: { 'aria-label': ariaLabel },
        restProps: props as Record<string, unknown>,
      }),
    } as Record<string, unknown>) as React.ReactElement;
  }

  const Tag = component || ('button' as React.ElementType);
  const isButtonElement = Tag === 'button';
  const interactive = isInteractiveElement(Tag);
  const isDisabled = disabled || loading;

  // A11y contract mirrors Button: native semantics preserved, native `disabled` only
  // for an explicit `disabled` prop (loading → aria-busy/aria-disabled).
  return (
    <Tag
      ref={ref as React.Ref<React.ComponentRef<C>>}
      role={interactive ? undefined : 'button'}
      tabIndex={isButtonElement ? undefined : 0}
      onClick={handleClick}
      onKeyDown={isButtonElement ? onKeyDown : handleKeyDown}
      className={classNames(buttonClassName, isDisabled && !isButtonElement && styles.disabled)}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="icon-button"
      {...(isButtonElement ? { disabled, type: type || 'button' } : {})}
      {...(props as Record<string, unknown>)}
      {...(href !== undefined ? { href: sanitizeHref(href) } : {})}
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
 * Defaults to rendering a `<button>` element. Use `component="a"` to render as a link,
 * or `asChild` to merge the button behaviour into a single custom child element.
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
