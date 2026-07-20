// src/shared/ui/Label/ui/Label.tsx

// ============================================
// Label Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { memo, forwardRef } from 'react';
import { Paragraph } from '@/shared/ui/Paragraph';
import type { LabelProps } from '../model/types';
import { LABEL_DEFAULTS } from '../model/constants';
import { validateLabelProps } from '../lib/utils/validateLabelProps';
import { Skeleton } from '@/shared/ui/Skeleton';
import styles from './Label.module.scss';

/**
 * Label Component
 *
 * Accessible label component with proper htmlFor association.
 * Supports required indicator, error/success/warning states, descriptions,
 * and skeleton loading mode.
 *
 * @group UI Components
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
 *
 * @example
 * ```tsx
 * // Skeleton loading state
 * <Label htmlFor="name" skeleton>
 *   Full Name
 * </Label>
 * ```
 */
export const Label = memo(
  forwardRef<HTMLLabelElement, LabelProps>(
    (
      {
        children,
        htmlFor,
        size = LABEL_DEFAULTS.size,
        variant = LABEL_DEFAULTS.variant,
        required = LABEL_DEFAULTS.required,
        error = LABEL_DEFAULTS.error,
        success = LABEL_DEFAULTS.success,
        skeleton = LABEL_DEFAULTS.skeleton,
        description,
        className = '',
        ...props
      },
      ref
    ) => {
      // Runtime validation in development
      if (process.env.NODE_ENV === 'development') {
        validateLabelProps({
          children,
          htmlFor,
          size,
          variant,
          error,
          success,
          skeleton,
          description,
          className,
          ...props,
        } as LabelProps);
      }

      // Determine final variant based on state props (priority: error > success > variant)
      const finalVariant = error ? 'error' : success ? 'success' : variant;

      // Build CSS classes
      const labelClasses = classNames(
        styles.label,
        styles[size],
        styles[finalVariant],
        required && styles.required,
        skeleton && styles.skeletonMode,
        className
      );

      return (
        <div
          className={styles.wrapper}
          role="group"
          aria-describedby={description ? `${htmlFor}-description` : undefined}
        >
          <label
            ref={ref}
            htmlFor={htmlFor}
            className={labelClasses}
            data-required={required || undefined}
            data-error={error || undefined}
            data-success={success || undefined}
            data-size={size}
            data-variant={finalVariant}
            data-skeleton={skeleton || undefined}
            aria-busy={skeleton || undefined}
            {...props}
          >
            {skeleton ? (
              <Skeleton variant="text" className={styles.skeletonPlaceholder} />
            ) : (
              children
            )}
          </label>

          {description && (
            <Paragraph as="span" size="s" theme="muted" id={`${htmlFor}-description`}>
              {description}
            </Paragraph>
          )}
        </div>
      );
    }
  )
);

Label.displayName = 'Label';

export default Label;
