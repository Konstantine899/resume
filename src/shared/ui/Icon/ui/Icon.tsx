import { classNames } from '@/shared/lib/utils/classNames';
import React, { useCallback, useMemo } from 'react';
import { getColorValue, getSizeInPixels, ICON_COLORS } from '../model/constants';
import type { IconProps } from '../model/types';
import styles from './Icon.module.scss';

export const Icon = React.memo(
  ({
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
    // Runtime validation в development режиме
    if (process.env.NODE_ENV === 'development') {
      if (typeof color === 'string' && !(color in ICON_COLORS)) {
        const validColors = Object.keys(ICON_COLORS).join(', ');
        // eslint-disable-next-line no-console
        console.warn(
          `Icon: invalid color "${color}". Valid values: ${validColors}, or any valid CSS color`
        );
      }
    }

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
          onClick(e as unknown as React.MouseEvent<HTMLSpanElement>);
        }
      },
      [disabled, onClick]
    );

    return (
      <span
        id={id}
        className={iconClassName}
        onClick={disabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
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
  }
);

Icon.displayName = 'Icon';
