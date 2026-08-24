// src/shared/ui/Label/ui/Label.tsx

// ============================================
// Label Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { memo, forwardRef, useId, type Ref } from 'react';
import { Paragraph } from '@/shared/ui/Paragraph';
import type { LabelProps } from '../model/types';
import { LABEL_DEFAULTS } from '../model/constants';
import { validateLabelProps } from '../lib/utils/validateLabelProps';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Slot } from '@/shared/ui/Slot';
import styles from './Label.module.scss';

/**
 * Label Component
 *
 * Accessible label component with proper htmlFor association.
 * Supports required indicator, error/success/warning states, descriptions,
 * skeleton loading mode, inline rendering (no wrapper), asChild polymorphism
 * and a floating variant.
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
 *
 * @example
 * ```tsx
 * // Polymorphic render via asChild
 * <Label asChild htmlFor="email">
 *   <a href="#email">Email Address</a>
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
        floating = false,
        asChild = false,
        inline = false,
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
          asChild,
          inline,
          floating,
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
        floating && styles.floating,
        className
      );

      const reactId = useId();
      const descriptionId = description
        ? htmlFor
          ? `${htmlFor}-description`
          : reactId
        : undefined;

      const labelContent = skeleton ? (
        <Skeleton variant="text" className={styles.skeletonPlaceholder} />
      ) : (
        children
      );

      // asChild: delegate rendering to the single child element via Slot
      if (asChild) {
        return (
          <Slot
            ref={ref as Ref<HTMLElement>}
            className={labelClasses}
            dataAttrs={{
              ...(required ? { 'data-required': '' } : {}),
              ...(error ? { 'data-error': '' } : {}),
              ...(success ? { 'data-success': '' } : {}),
              'data-size': size,
              'data-variant': finalVariant,
              ...(skeleton ? { 'data-skeleton': '', 'aria-busy': 'true' } : {}),
            }}
          >
            {children}
          </Slot>
        );
      }

      const labelElement = (
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
          aria-describedby={descriptionId}
          {...props}
        >
          {labelContent}
        </label>
      );

      const descriptionElement = description ? (
        <Paragraph as="span" size="s" theme="muted" id={descriptionId}>
          {description}
        </Paragraph>
      ) : null;

      // inline: render label without wrapper div
      if (inline) {
        return (
          <>
            {labelElement}
            {descriptionElement}
          </>
        );
      }

      // default: wrapper + description
      return (
        <div className={styles.wrapper} role="group">
          {labelElement}
          {descriptionElement}
        </div>
      );
    }
  )
);

Label.displayName = 'Label';
