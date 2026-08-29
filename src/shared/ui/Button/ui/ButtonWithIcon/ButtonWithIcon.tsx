// ============================================
// ButtonWithIcon Component — polymorphic, useButton, icon size inference
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import React, { Children, cloneElement, isValidElement, useMemo } from 'react';
import type { ButtonOwnProps, ButtonSize, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
import { inferIconSize } from '../../lib/utils/inferIconSize';
import { mergeRefs } from '../../lib/utils/mergeRefs';
import { sanitizeAnchorProps } from '../../lib/utils/sanitizeAnchorProps';
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
function ButtonWithIconImpl(
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
    asChild = false,
    ...props
  }: PolymorphicProps<React.ElementType, ButtonOwnProps> & {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  },
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
    moduleStyles: styles,
  });

  const isDisabled = disabled || loading;
  const Tag = component || ('button' as React.ElementType);
  const isButtonElement = Tag === 'button';
  const isNativeInteractive = isButtonElement || Tag === 'a';

  const sizedLeftIcon = useMemo(
    () => (leftIcon ? inferIconSize(leftIcon, size as ButtonSize) : undefined),
    [leftIcon, size]
  );
  const sizedRightIcon = useMemo(
    () => (rightIcon ? inferIconSize(rightIcon, size as ButtonSize) : undefined),
    [rightIcon, size]
  );

  // asChild mode: merge button props into a single child element (when one is provided)
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
        'data-testid': 'button-with-icon',
        ...props,
      } as Record<string, unknown>) as React.ReactElement;
    }
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        '[ButtonWithIcon] asChild requires a single valid child element; falling back to default render.'
      );
    }
    /* eslint-enable react-hooks/refs */
  }

  // Harden anchor rendering: sanitize href scheme + rel="noopener noreferrer" for _blank
  const safeProps = Tag === 'a' ? sanitizeAnchorProps(props as Record<string, unknown>) : props;

  const iconContent = (
    <>
      {sizedLeftIcon && <span className={styles.icon}>{sizedLeftIcon}</span>}
      <span className={styles.text}>{children}</span>
      {sizedRightIcon && <span className={styles.icon}>{sizedRightIcon}</span>}
    </>
  );

  return (
    <Tag
      ref={ref}
      className={classNames(buttonClassName, isDisabled && !isButtonElement && styles.disabled)}
      onClick={handleClick}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="button-with-icon"
      {...(isNativeInteractive
        ? isButtonElement
          ? { disabled: disabled, type: type || 'button' }
          : {}
        : { role: 'button', tabIndex: 0, onKeyDown: handleKeyDown })}
      {...safeProps}
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
 * Forwards refs correctly (forwardRef + memo).
 */
export const ButtonWithIcon = React.memo(React.forwardRef(ButtonWithIconImpl)) as <
  C extends React.ElementType = 'button',
>(
  props: PolymorphicProps<
    C,
    ButtonOwnProps & { leftIcon?: React.ReactNode; rightIcon?: React.ReactNode }
  > & {
    ref?: React.ForwardedRef<React.ComponentRef<C>>;
  }
) => React.ReactElement;
