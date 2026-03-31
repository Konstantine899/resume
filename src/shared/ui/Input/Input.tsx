// ============================================
// Input Component
// ============================================

import React from 'react';
import styles from './Input.module.scss';
import type { InputProps } from './types';

/**
 * Input Component
 * 
 * A flexible input component with multiple variants and states.
 * Follows FSD architecture - reusable UI component.
 */
export const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  label,
  error,
  success,
  loading,
  icon,
  iconAfter,
  fullWidth = false,
  helperText,
  ...props
}) => {
  // Build CSS classes
  const inputClasses = [
    styles.input,
    styles[variant],
    styles[size],
    error && styles.error,
    success && styles.success,
    loading && styles.loading,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = [
    styles.inputWrapper,
    fullWidth && styles.fullWidth,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <div className={styles.inputContainer}>
        {icon && (
          <span className={styles.icon}>
            {icon}
          </span>
        )}
        
        <input
          className={inputClasses}
          {...props}
        />
        
        {iconAfter && (
          <span className={styles.iconAfter}>
            {iconAfter}
          </span>
        )}
        
        {loading && (
          <span className={styles.loadingIndicator}>
            Loading...
          </span>
        )}
      </div>
      
      {error && (
        <span className={styles.errorText}>
          {error}
        </span>
      )}
      
      {helperText && !error && (
        <span className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
};

Input.displayName = 'Input';

export default Input;