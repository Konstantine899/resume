// ============================================
// InputLabel Component
// ============================================

import React from 'react';
import { classNames } from '@/shared/lib/utils';
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
        <label
          htmlFor={htmlFor}
          className={classNames(styles.floatingLabel, { [styles.required]: required }, className)}
        >
          {children}
        </label>
      );
    }

    return (
      <label
        htmlFor={htmlFor}
        className={classNames(styles.label, { [styles.required]: required }, className)}
      >
        {children}
      </label>
    );
  }
);

InputLabel.displayName = 'InputLabel';
