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

export const InputLabel: React.FC<InputLabelProps> = ({
  htmlFor,
  children,
  required,
  floating,
  className,
}) => {
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
};

InputLabel.displayName = 'InputLabel';
