// ============================================
// Button Component — polymorphic, uses useButton + ButtonLoader
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { sanitizeHref } from '@/shared/lib/utils';
import React, { Children, cloneElement, isValidElement } from 'react';
import type { ButtonOwnProps, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
import { isInteractiveElement, mergeAsChildProps } from '../../lib/utils/mergeAsChildProps';
import { resolveButtonAppearance } from '../../lib/utils/resolveButtonAppearance';
import styles from './Button.module.scss';

/**
 * Button Component — базовая текстовая кнопка
 *
 * @example
 * // Basic usage
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleSubmit}>
 *   Отправить
 * </Button>
 * ```
 *
 * @example
 * // Loading state
 * ```tsx
 * <Button loading>Loading...</Button>
 * ```
 *
 * @example
 * // As a link
 * ```tsx
 * <Button component="a" href="/about">Link</Button>
 * ```
 */
function ButtonImpl<C extends React.ElementType = 'button'>(
  {
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
  }: PolymorphicProps<C, ButtonOwnProps>,
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
  });

  // asChild mode: merge props into child element instead of rendering own DOM node
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
        dataTestId: 'button',
        handleClick,
        handleKeyDown,
        isDisabled,
        loading,
        href,
        restProps: props as Record<string, unknown>,
      }),
    } as Record<string, unknown>) as React.ReactElement;
  }

  const Tag = component || ('button' as React.ElementType);
  const isButtonElement = Tag === 'button';
  const interactive = isInteractiveElement(Tag);
  const isDisabled = disabled || loading;

  // A11y contract for non-native elements:
  // — role="button" only when the element has no native semantics (a real <a>/<button>
  //   keeps link/button semantics — giving an <a href> role="button" breaks it);
  // — tabIndex makes the element reachable (native <button>/<a href> are focusable already);
  // — Enter/Space activation goes through the guarded click path, while a native <button>
  //   activates on its own;
  // — native `disabled` is set ONLY for an explicit `disabled` prop: `loading` keeps the
  //   element focusable and announces itself via aria-busy/aria-disabled instead.
  return (
    <Tag
      ref={ref as React.Ref<React.ComponentRef<C>>}
      role={interactive ? undefined : 'button'}
      tabIndex={isButtonElement ? undefined : 0}
      onClick={handleClick}
      onKeyDown={isButtonElement ? onKeyDown : handleKeyDown}
      className={classNames(buttonClassName, isDisabled && !isButtonElement && styles.disabled)}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="button"
      {...(isButtonElement ? { disabled, type: type || 'button' } : {})}
      {...(props as Record<string, unknown>)}
      {...(href !== undefined ? { href: sanitizeHref(href) } : {})}
    >
      {loader}
      <span className={contentClassName}>{children}</span>
    </Tag>
  ) as React.ReactElement;
}

ButtonImpl.displayName = 'Button';

/**
 * Button — text-only button with polymorphic `component` prop support.
 *
 * Defaults to rendering a `<button>` element. Use `component="a"` to render as a link,
 * or any other HTML element / React component.
 */
export const Button = React.memo(
  ButtonImpl as React.FC<PolymorphicProps<React.ElementType, ButtonOwnProps>>
) as <C extends React.ElementType = 'button'>(
  props: PolymorphicProps<C, ButtonOwnProps> & {
    ref?: React.ForwardedRef<React.ComponentRef<C>>;
  }
) => React.ReactElement;
