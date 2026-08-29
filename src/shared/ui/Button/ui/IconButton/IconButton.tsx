// ============================================
// IconButton Component — polymorphic, useButton, icon size inference
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import React, { isValidElement, cloneElement, useMemo } from 'react';
import type { ButtonOwnProps, ButtonSize, PolymorphicProps } from '../../model/types';
import { useButton } from '../../lib/hooks/useButton';
import { inferIconSize } from '../../lib/utils/inferIconSize';
import { mergeRefs } from '../../lib/utils/mergeRefs';
import { sanitizeAnchorProps } from '../../lib/utils/sanitizeAnchorProps';
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
function IconButtonImpl(
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
    asChild = false,
    ...props
  }: PolymorphicProps<React.ElementType, ButtonOwnProps> & {
    icon?: React.ReactNode;
    ariaLabel?: string;
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

  const sizedIcon = useMemo(
    () => (icon ? inferIconSize(icon, size as ButtonSize) : null),
    [icon, size]
  );

  // asChild mode: merge button props into the provided icon element (cloned)
  if (asChild && isValidElement(icon)) {
    /* eslint-disable react-hooks/refs */
    const iconProps = icon.props as Record<string, unknown>;
    const childOnClick = iconProps.onClick as React.MouseEventHandler | undefined;
    const childRef = iconProps.ref as React.Ref<unknown> | undefined;

    const mergedOnClick: React.MouseEventHandler = (event) => {
      childOnClick?.(event);
      handleClick(event);
    };
    const mergedRef = mergeRefs(ref as React.Ref<unknown>, childRef);

    return cloneElement(icon, {
      className: classNames(
        buttonClassName,
        iconProps.className as string,
        isDisabled && styles.disabled
      ),
      onClick: mergedOnClick,
      ref: mergedRef,
      'aria-label': ariaLabel,
      'aria-disabled': isDisabled || undefined,
      'aria-busy': loading || undefined,
      'data-state': loading ? 'loading' : 'idle',
      'data-testid': 'icon-button',
      ...props,
    } as Record<string, unknown>) as React.ReactElement;
    /* eslint-enable react-hooks/refs */
  }

  // Harden anchor rendering: sanitize href scheme + rel="noopener noreferrer" for _blank
  const safeProps = Tag === 'a' ? sanitizeAnchorProps(props as Record<string, unknown>) : props;

  return (
    <Tag
      ref={ref}
      className={classNames(buttonClassName, isDisabled && !isButtonElement && styles.disabled)}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-state={loading ? 'loading' : 'idle'}
      data-testid="icon-button"
      {...(isNativeInteractive
        ? isButtonElement
          ? { disabled: disabled, type: type || 'button' }
          : {}
        : { role: 'button', tabIndex: 0, onKeyDown: handleKeyDown })}
      {...safeProps}
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
 * Forwards refs correctly (forwardRef + memo).
 */
export const IconButton = React.memo(React.forwardRef(IconButtonImpl)) as <
  C extends React.ElementType = 'button',
>(
  props: PolymorphicProps<C, ButtonOwnProps & { icon: React.ReactNode; ariaLabel: string }> & {
    ref?: React.ForwardedRef<React.ComponentRef<C>>;
  }
) => React.ReactElement;
