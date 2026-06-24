import { classNames } from '@/shared/lib/utils/classNames';
import React, { useCallback, useEffect, useState } from 'react';
import { getColorValue, getSizeInPixels, ICON_COLORS } from '../model/constants';
import type { IconProps } from '../model/types';
import styles from './Icon.module.scss';

export const Icon = ({
  name: IconComponent,
  size = 'md',
  color = 'foreground',
  strokeWidth = 2,
  className = '',
  ariaLabel,
  decorative = false,
  disabled = false,
  onClick,
  isPressed,
  id,
}: IconProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // Runtime validation в development режиме
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (typeof color === 'string' && !(color in ICON_COLORS)) {
        const validColors = Object.keys(ICON_COLORS).join(', ');
        // eslint-disable-next-line no-console
        console.warn(
          `Icon: invalid color "${color}". Valid values: ${validColors}, or any valid CSS color`
        );
      }
    }
  }, [color]);

  const iconStyle: React.CSSProperties = {
    width: getSizeInPixels(size),
    height: getSizeInPixels(size),
    color: getColorValue(color),
  };

  const iconClassName = classNames(
    styles.icon,
    disabled && styles.disabled,
    onClick && !disabled && styles.clickable,
    isFocused && styles.focused,
    className
  );

  const isInteractive = onClick !== undefined && !disabled;

  const commonAriaProps = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ 'aria-label': ariaLabel } as const);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent<HTMLSpanElement>);
      }
    },
    [disabled, onClick]
  );

  const handleFocus = useCallback(() => {
    if (isInteractive) {
      setIsFocused(true);
    }
  }, [isInteractive]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <span
      id={id}
      className={iconClassName}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={disabled ? undefined : isInteractive ? 0 : undefined}
      role={isInteractive ? 'button' : commonAriaProps['aria-hidden'] ? undefined : 'img'}
      aria-pressed={isInteractive && isPressed !== undefined ? isPressed : undefined}
      data-testid={decorative ? undefined : 'icon-wrapper'}
      {...commonAriaProps}
    >
      <IconComponent
        style={{ ...iconStyle, strokeWidth: undefined }}
        strokeWidth={strokeWidth}
        aria-hidden={decorative ? 'true' : undefined}
      />
    </span>
  );
};

Icon.displayName = 'Icon';
