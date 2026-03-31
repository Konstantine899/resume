// ============================================
// Button Component
// ============================================

import React from 'react';
import styles from './Button.module.scss';
import type { ButtonProps } from './types';

/**
 * Button Component
 * 
 * A flexible button component with multiple variants, sizes, and states.
 * Follows FSD architecture principles - reusable UI component.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  // Handle click with disabled/loading states
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.();
  };

  // Build CSS classes
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    loading && styles.loading,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Render icon if provided
  const renderIcon = () => {
    if (!icon) return null;
    
    const iconClasses = [
      styles.icon,
      styles[`icon-${iconPosition}`],
    ].filter(Boolean).join(' ');

    return (
      <span className={iconClasses}>
        {icon}
      </span>
    );
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={buttonClasses}
      aria-disabled={disabled || loading}
      data-testid="button"
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
      
      {iconPosition === 'left' && renderIcon()}
      
      <span className={styles.content}>
        {children}
      </span>
      
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

Button.displayName = 'Button';

export default Button;