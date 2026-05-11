// src/shared/ui/Label/ui/Label.tsx

// ============================================
// Label Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import React, { useMemo } from 'react';
import type { LabelProps } from '../model/types';
import styles from './Label.module.scss';

/**
 * Label Component
 *
 * Accessible label component with proper htmlFor association.
 * Supports required indicator, error/success/warning states, and descriptions.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Email Address
 * </Label>
 * <Input id="email" type="email" />
 * ```
 *
 * @example
 * ```tsx
 * <Label htmlFor="password" error>
 *   Password
 * </Label>
 * <Input id="password" error="Password is required" />
 * ```
 */
export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  size = 'md',
  variant = 'default',
  required = false,
  error = false,
  success = false,
  description,
  className = '',
  ...props
}) => {
  // Determine final variant based on state props (priority: error > success > warning > default)
  const finalVariant = useMemo(() => {
    if (error) return 'error';
    if (success) return 'success';
    return variant;
  }, [error, success, variant]);

  // Development warnings
  if (process.env.NODE_ENV === 'development') {
    if (error && success) {
      console.warn('Label: cannot have both error and success props simultaneously');
    }

    if (!htmlFor) {
      console.warn('Label: htmlFor prop is required for accessibility');
    }
  }

  // Build CSS classes
  const labelClasses = classNames(
    styles.label,
    styles[size],
    styles[finalVariant],
    required && styles.required,
    className
  );

  return (
    <div
      className={styles.wrapper}
      role="group"
      aria-labelledby={htmlFor}
      aria-describedby={description ? `${htmlFor}-description` : undefined}
    >
      <label
        htmlFor={htmlFor}
        className={labelClasses}
        data-required={required || undefined}
        data-error={error || undefined}
        data-success={success || undefined}
        {...props}
      >
        {children}
      </label>

      {description && (
        <span className={styles.description} id={`${htmlFor}-description`}>
          {description}
        </span>
      )}
    </div>
  );
};

Label.displayName = 'Label';

export default Label;
