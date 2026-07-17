// ============================================
// InputLabel Component
// ============================================

import React from 'react';
import styles from '../Input.module.scss';

export interface InputLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  floating?: boolean;
  className?: string;
}

/**
 * InputLabel — лейбл для Input с поддержкой floating-режима и индикатора required.
 *
 * @example
 * ```tsx
 * <InputLabel htmlFor="email" required>Email</InputLabel>
 * <InputLabel htmlFor="name" floating>Name</InputLabel>
 * ```
 */
export const InputLabel = React.memo(
  ({ htmlFor, children, required, floating, className }: InputLabelProps) => {
    if (floating) {
      return (
        <label htmlFor={htmlFor} className={styles.floatingLabel}>
          {required && <span className={styles.required}>*</span>}
          {children}
        </label>
      );
    }

    return (
      <label htmlFor={htmlFor} className={className || styles.label}>
        {required && <span className={styles.required}>*</span>}
        {children}
      </label>
    );
  }
);

InputLabel.displayName = 'InputLabel';
