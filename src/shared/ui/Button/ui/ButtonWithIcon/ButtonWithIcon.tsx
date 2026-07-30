// ============================================
// ButtonWithIcon Component — polymorphic, useButton, icon size inference
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import React from 'react';
import type { ButtonOwnProps, ButtonSize, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
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
    disabled = false,
    className = '',
    type,
    fullWidth = false,
    loading = false,
    loadingVariant = 'spinner',
    component,
    asChild: _asChild,
    ...props
  }: PolymorphicProps<
    C,
    ButtonOwnProps & { leftIcon?: React.ReactNode; rightIcon?: React.ReactNode }
  >,
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
  const sizedLeftIcon = leftIcon ? inferIconSize(leftIcon, size as ButtonSize) : undefined;
  const sizedRightIcon = rightIcon ? inferIconSize(rightIcon, size as ButtonSize) : undefined;

  const iconContent = (
    <>
      {sizedLeftIcon && <span className={styles.icon}>{sizedLeftIcon}</span>}
      <span className={styles.text}>{children}</span>
      {sizedRightIcon && <span className={styles.icon}>{sizedRightIcon}</span>}
    </>
  );

  return (
    <Tag
      ref={ref as React.Ref<React.ComponentRef<C>>}
      role={!isButtonElement ? 'button' : undefined}
      onClick={handleClick}
      className={classNames(buttonClassName, isDisabled && !isButtonElement && styles.disabled)}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="button-with-icon"
      {...(isButtonElement ? { disabled: isDisabled, type: type || 'button' } : {})}
      {...props}
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
 * Defaults to rendering a `<button>` element. Use `component="a"` to render as a link.
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
