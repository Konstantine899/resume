import React from 'react';
import type { IconButtonProps } from '../model/types';
import styles from './IconButton.module.scss';

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  children,
  size = 'md',
  variant = 'ghost',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  rotation = 0,
  fullWidth = false,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const buttonClasses = [
    styles.iconButton,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={buttonClasses}
      aria-label={ariaLabel}
      type="button"
      {...props}
    >
      <span
        className={styles.icon}
        style={rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : undefined}
      >
        {icon}
      </span>
      {children && <span className={styles.content}>{children}</span>}
    </button>
  );
};

IconButton.displayName = 'IconButton';
