import { classNames } from '@/shared/lib/utils/classNames';
import React from 'react';
import { getColorValue, getSizeInPixels } from '../model/constants';
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
}: IconProps) => {
  const iconStyle: React.CSSProperties = {
    width: getSizeInPixels(size),
    height: getSizeInPixels(size),
    color: getColorValue(color),
    strokeWidth,
  };

  const iconClassName = classNames(
    styles.icon,
    disabled && styles.disabled,
    onClick && !disabled && styles.clickable,
    className
  );

  const ariaProps = decorative ? { 'aria-hidden': true } : { 'aria-label': ariaLabel, role: 'img' };

  return (
    <span
      className={iconClassName}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={disabled ? undefined : onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      {...ariaProps}
    >
      <IconComponent style={iconStyle} aria-hidden={decorative ? 'true' : undefined} />
    </span>
  );
};

Icon.displayName = 'Icon';
