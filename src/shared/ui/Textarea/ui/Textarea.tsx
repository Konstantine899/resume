// ============================================
// Textarea Component
// ============================================

import React from 'react';
import type { TextareaProps } from '../model/types';
import styles from './Textarea.module.scss';

/**
 * Textarea Component
 *
 * A flexible textarea component with multiple variants and states.
 * Follows FSD architecture - reusable UI component.
 */
export const Textarea: React.FC<TextareaProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  label,
  error,
  success,
  loading,
  fullWidth = false,
  helperText,
  rows = 3,
  ...props
}) => {
  // Build CSS classes
  const textareaClasses = [
    styles.textarea,
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

  const wrapperClasses = [styles.textareaWrapper, fullWidth && styles.fullWidth]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.textareaContainer}>
        <textarea className={textareaClasses} rows={rows} {...props} />

        {loading && <span className={styles.loadingIndicator}>Loading...</span>}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}

      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
};

Textarea.displayName = 'Textarea';

export default Textarea;
