// ============================================
// Button Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { Spinner } from '@/shared/ui/Spinner';
import { Skeleton } from '@/shared/ui/Skeleton';
import { BUTTON_CONSTANTS } from '../../model/constants';
import { validateButtonProps } from '../../lib/validateButtonProps';
import React, { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import type { ButtonProps } from '../../model/types';
import styles from './Button.module.scss';

/**
 * Button Component — базовая текстовая кнопка
 *
 * @example
 * // Basic usage
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleSubmit}>
 *   Отправить
 * </Button>
 * ```
 *
 * @example
 * // Loading state
 * ```tsx
 * <Button loading>Loading...</Button>
 * ```
 *
 * @example
 * // Disabled state
 * ```tsx
 * <Button disabled>Disabled</Button>
 * ```
 */
const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      onClick,
      disabled = false,
      className = '',
      type = 'button',
      fullWidth = false,
      loading = false,
      loadingVariant = 'spinner',
      ...props
    },
    ref
  ) => {
    // Runtime validation in development mode (optimized deps)
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        const warnings = validateButtonProps(variant, size, loadingVariant, loading);
        warnings.forEach((w) => {
          // eslint-disable-next-line no-console
          console.warn(w.message);
        });
      }
    }, [variant, size, loadingVariant, loading]);

    // Memoize className calculation (only essential memoization)
    const buttonClassName = useMemo(
      () =>
        classNames(
          styles.button,
          styles[variant],
          styles[size],
          loading && styles.loading,
          fullWidth && styles.fullWidth,
          className
        ),
      [variant, size, loading, fullWidth, className]
    );

    // Memoize content className
    const contentClassName = useMemo(
      () => classNames(styles.content, loading && styles.hidden),
      [loading]
    );

    // Memoize click handler
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      [disabled, loading, onClick]
    );

    // Simplified loader rendering (removed useMemo for simple conditional)
    const loaderContent = loading ? (
      loadingVariant === 'spinner' ? (
        <span className={styles.loader}>
          <Spinner size="sm" color="secondary" label={BUTTON_CONSTANTS.DEFAULT_SPINNER_LABEL} />
        </span>
      ) : (
        <span className={styles.skeleton}>
          <Skeleton width="100%" height="100%" />
        </span>
      )
    ) : null;

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        className={buttonClassName}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        data-state={loading ? 'loading' : 'idle'}
        data-testid="button"
        {...props}
      >
        {loaderContent}
        <span className={contentClassName}>{children}</span>
      </button>
    );
  }
);

ButtonComponent.displayName = 'Button';

// Memo wrapper with displayName
export const Button = memo(ButtonComponent);
Button.displayName = 'Button';
