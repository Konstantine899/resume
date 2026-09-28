// ============================================
// ButtonWithIcon Component — polymorphic, useButton, icon size inference
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { sanitizeHref } from '@/shared/lib/utils';
import React, { Children, cloneElement, isValidElement, useMemo } from 'react';
import type { ButtonOwnProps, ButtonSize, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
import { isInteractiveElement, mergeAsChildProps } from '../../lib/utils/mergeAsChildProps';
import { resolveButtonAppearance } from '../../lib/utils/resolveButtonAppearance';
import { inferIconSize } from '../../lib/utils/inferIconSize';
import styles from './ButtonWithIcon.module.scss';

/**
 * ButtonWithIcon Component — кнопка с иконкой (слева или справа)
 *
 * @example
 * // Left icon
 * ```tsx
 * <ButtonWithIcon leftIcon={<Download size={18} />} onClick={handleDownload}>
 *   Скачать
 * </ButtonWithIcon>
 * ```
 *
 * @example
 * // Right icon
 * ```tsx
 * <ButtonWithIcon rightIcon={<ArrowRight size={18} />} onClick={handleNext}>
 *   Далее
 * </ButtonWithIcon>
 * ```
 *
 * @example
 * // As a link
 * ```tsx
 * <ButtonWithIcon component="a" href="/about" leftIcon={<Mail />}>Link</ButtonWithIcon>
 * ```
 */
function ButtonWithIconImpl<C extends React.ElementType = 'button'>(
  {
    children,
    leftIcon,
    rightIcon,
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
  }: PolymorphicProps<
    C,
    ButtonOwnProps & { leftIcon?: React.ReactNode; rightIcon?: React.ReactNode }
  >,
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

  const sizedLeftIcon = useMemo(
    () => (leftIcon ? inferIconSize(leftIcon, size as ButtonSize) : undefined),
    [leftIcon, size]
  );
  const sizedRightIcon = useMemo(
    () => (rightIcon ? inferIconSize(rightIcon, size as ButtonSize) : undefined),
    [rightIcon, size]
  );

  // asChild mode: merge props into child element instead of rendering own DOM node.
  // The child owns the content (text + icons included) — no loader/content wrapper is rendered.
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
        dataTestId: 'button-with-icon',
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

  const iconContent = (
    <>
      {sizedLeftIcon && <span className={styles.icon}>{sizedLeftIcon}</span>}
      <span className={styles.text}>{children}</span>
      {sizedRightIcon && <span className={styles.icon}>{sizedRightIcon}</span>}
    </>
  );

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
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="button-with-icon"
      {...(isButtonElement ? { disabled, type: type || 'button' } : {})}
      {...(props as Record<string, unknown>)}
      {...(href !== undefined ? { href: sanitizeHref(href) } : {})}
    >
      {loader}
      <span className={contentClassName}>{iconContent}</span>
    </Tag>
  ) as React.ReactElement;
}

ButtonWithIconImpl.displayName = 'ButtonWithIcon';

/**
 * ButtonWithIcon — button with left/right icons, polymorphic `component` prop, and auto icon sizing.
 *
 * Defaults to rendering a `<button>` element. Use `component="a"` to render as a link,
 * or `asChild` to merge the button behaviour into a single custom child element.
 * Icon size is auto-inferred from button size unless the icon has an explicit `size` prop.
 */
export const ButtonWithIcon = React.memo(
  ButtonWithIconImpl as React.FC<
    PolymorphicProps<
      React.ElementType,
      ButtonOwnProps & { leftIcon?: React.ReactNode; rightIcon?: React.ReactNode }
    >
  >
) as <C extends React.ElementType = 'button'>(
  props: PolymorphicProps<
    C,
    ButtonOwnProps & { leftIcon?: React.ReactNode; rightIcon?: React.ReactNode }
  > & {
    ref?: React.ForwardedRef<React.ComponentRef<C>>;
  }
) => React.ReactElement;
