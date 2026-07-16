import { classNames } from '@/shared/lib/utils/classNames';
import React, { forwardRef, useCallback, useEffect, useMemo } from 'react';
import { getColorValue, getSizeInPixels, ICON_CONSTANTS } from '../model/constants';
import { validateIconProps } from '@/shared/lib/utils/validateIconProps';
import type { IconProps } from '../model/types';
import styles from './Icon.module.scss';

const IconComponent = forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      name: IconComponentChild,
      size = ICON_CONSTANTS.DEFAULT_SIZE,
      color = ICON_CONSTANTS.DEFAULT_COLOR,
      strokeWidth = ICON_CONSTANTS.DEFAULT_STROKE_WIDTH,
      className = '',
      ariaLabel,
      decorative = false,
      disabled = false,
      onClick,
      isPressed,
      id,
    },
    ref
  ) => {
    useEffect(() => {
      validateIconProps(color, size, strokeWidth);
    }, [color, size, strokeWidth]);

    const iconStyle: React.CSSProperties = useMemo(
      () => ({
        width: getSizeInPixels(size),
        height: getSizeInPixels(size),
        color: getColorValue(color),
      }),
      [size, color]
    );

    const isInteractive = useMemo(() => onClick !== undefined && !disabled, [onClick, disabled]);

    const iconClassName = useMemo(
      () =>
        classNames(
          styles.icon,
          disabled && styles.disabled,
          isInteractive && styles.clickable,
          className
        ),
      [disabled, isInteractive, className]
    );

    const commonAriaProps = decorative
      ? ({ 'aria-hidden': true } as const)
      : ({ 'aria-label': ariaLabel } as const);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLSpanElement>) => {
        if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          e.currentTarget.click();
        }
      },
      [disabled, onClick]
    );

    return (
      <span
        ref={ref}
        id={id}
        className={iconClassName}
        onClick={disabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? undefined : isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : commonAriaProps['aria-hidden'] ? undefined : 'img'}
        aria-pressed={isInteractive && isPressed !== undefined ? isPressed : undefined}
        data-testid={decorative ? undefined : 'icon-wrapper'}
        data-size={size}
        data-color={color}
        data-interactive={isInteractive}
        {...commonAriaProps}
      >
        <IconComponentChild
          style={iconStyle}
          strokeWidth={strokeWidth}
          aria-hidden={decorative ? 'true' : undefined}
        />
      </span>
    );
  }
);

IconComponent.displayName = 'Icon';
export const Icon = React.memo(IconComponent);
Icon.displayName = 'Icon';

export default Icon;
