// ============================================
// Button Component — polymorphic, uses useButton + ButtonLoader
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import React, { Children, cloneElement, isValidElement } from 'react';
import type { ButtonOwnProps, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
import { mergeRefs } from '../../lib/utils/mergeRefs';
import { sanitizeAnchorProps } from '../../lib/utils/sanitizeAnchorProps';
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
function ButtonImpl(
  {
    children,
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
    asChild = false,
    ...props
  }: PolymorphicProps<React.ElementType, ButtonOwnProps>,
  ref: React.ForwardedRef<React.ComponentRef<React.ElementType>>
) {
  const { buttonClassName, contentClassName, handleClick, handleKeyDown, loader } = useButton({
    variant,
    size,
    colorScheme,
    loading,
    loadingVariant,
    fullWidth,
    disabled,
    className,
    onClick,
  });

  const isDisabled = disabled || loading;
  const Tag = component || ('button' as React.ElementType);
  const isButtonElement = Tag === 'button';
  const isNativeInteractive = isButtonElement || Tag === 'a';

  // asChild mode: merge button props into a single child element instead of rendering own DOM node
  if (asChild) {
    /* eslint-disable react-hooks/refs */
    const childArray = Children.toArray(children);
    if (childArray.length === 1 && isValidElement(childArray[0])) {
      const child = childArray[0];
      const childProps = child.props as Record<string, unknown>;
      const childOnClick = childProps.onClick as React.MouseEventHandler | undefined;
      const childRef = childProps.ref as React.Ref<unknown> | undefined;

      const mergedOnClick: React.MouseEventHandler = (event) => {
        childOnClick?.(event);
        handleClick(event);
      };
      const mergedRef = mergeRefs(ref as React.Ref<unknown>, childRef);

      return cloneElement(child, {
        className: classNames(
          buttonClassName,
          childProps.className as string,
          isDisabled && styles.disabled
        ),
        onClick: mergedOnClick,
        ref: mergedRef,
        'aria-disabled': isDisabled || undefined,
        'aria-busy': loading || undefined,
        'data-state': loading ? 'loading' : 'idle',
        'data-testid': 'button',
        ...props,
      } as Record<string, unknown>) as React.ReactElement;
    }
    // Fall through to normal render when asChild child is invalid
    /* eslint-enable react-hooks/refs */
  }

  // Harden anchor rendering: sanitize href scheme + rel="noopener noreferrer" for _blank
  const safeProps = Tag === 'a' ? sanitizeAnchorProps(props as Record<string, unknown>) : props;

  return (
    <Tag
      ref={ref}
      className={classNames(buttonClassName, isDisabled && !isButtonElement && styles.disabled)}
      onClick={handleClick}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="button"
      {...(isNativeInteractive
        ? isButtonElement
          ? { disabled: disabled, type: type || 'button' }
          : {}
        : { role: 'button', tabIndex: 0, onKeyDown: handleKeyDown })}
      {...safeProps}
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
 * or any other HTML element / React component. Forwards refs correctly (forwardRef + memo).
 */
export const Button = React.memo(React.forwardRef(ButtonImpl)) as <
  C extends React.ElementType = 'button',
>(
  props: PolymorphicProps<C, ButtonOwnProps> & { ref?: React.ForwardedRef<React.ComponentRef<C>> }
) => React.ReactElement;
