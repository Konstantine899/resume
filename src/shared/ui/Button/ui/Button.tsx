// src/shared/ui/Button/ui/Button.tsx

import { classNames } from '@/shared/lib/utils/classNames'; // ✅ Добавить
import React from 'react';
import type { ButtonProps } from '../model/types';
import styles from './Button.module.scss';

export const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  iconPosition = 'left',
  rotation = 0,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
  loading = false,
  ariaLabel,
  ...props
}) => {
  const isIconOnly = !!icon && !children;
  const hasIcon = !!icon;
  const hasText = !!children;

  if (isIconOnly && !ariaLabel) {
    console.warn('Button: ariaLabel is required for icon-only buttons');
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const buttonClassName = classNames(
    styles.button,
    styles[variant],
    styles[size],
    isIconOnly && styles.iconOnly,
    loading && styles.loading,
    fullWidth && styles.fullWidth,
    className
  );

  const renderIcon = (position: 'left' | 'right') => {
    if (!hasIcon || iconPosition !== position) return null;

    const iconStyle = rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : undefined;

    return (
      <span className={styles.icon} style={iconStyle}>
        {icon}
      </span>
    );
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={buttonClassName}
      aria-label={isIconOnly ? ariaLabel : undefined}
      aria-disabled={disabled || loading}
      data-testid="button"
      {...props}
    >
      <span className={styles.inner}>
        {renderIcon('left')}
        {hasText && <span className={styles.text}>{children}</span>}
        {renderIcon('right')}
      </span>

      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
};

Button.displayName = 'Button';

export default Button;
