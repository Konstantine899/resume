// ============================================
// Button Component — polymorphic, uses useButton + ButtonLoader
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import React from 'react';
import type { ButtonOwnProps, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
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
    onClick,
    disabled = false,
    className = '',
    type,
    fullWidth = false,
    loading = false,
    loadingVariant = 'spinner',
    component,
    ...props
  }: PolymorphicProps<C, ButtonOwnProps>,
  ref: React.ForwardedRef<React.ComponentRef<C>>
) {
  const { buttonClassName, contentClassName, handleClick, loader } = useButton({
    variant,
    size,
    loading,
    loadingVariant,
    fullWidth,
    disabled,
    className,
    onClick,
  });

  const Tag = component || ('button' as React.ElementType);
  const isButtonElement = Tag === 'button';
  const isDisabled = disabled || loading;

  return (
    <Tag
      ref={ref as React.Ref<React.ComponentRef<C>>}
      role={!isButtonElement ? 'button' : undefined}
      onClick={handleClick}
      className={classNames(buttonClassName, isDisabled && !isButtonElement && styles.disabled)}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="button"
      {...(isButtonElement ? { disabled: isDisabled, type: type || 'button' } : {})}
      {...props}
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
