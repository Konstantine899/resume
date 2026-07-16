// ============================================
// IconButton Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { Spinner } from '@/shared/ui/Spinner';
import { Skeleton } from '@/shared/ui/Skeleton';
import { validateButtonProps } from '@/shared/lib/utils/validateButtonProps';
import { BUTTON_CONSTANTS } from '@/shared/ui/Button/model/constants';
import React, { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import type { IconButtonProps } from '../../model/types';
import styles from './IconButton.module.scss';

/**
 * IconButton Component — кнопка только с иконкой
 *
 * @example
 * // Basic usage
 * ```tsx
 * <IconButton icon={<Mail size={20} />} ariaLabel="Отправить письмо" variant="ghost" />
 * ```
 *
 * @example
 * // Menu button
 * ```tsx
 * <IconButton icon={<Menu size={24} />} ariaLabel="Открыть меню" size="lg" />
 * ```
 *
 * @example
 * // Loading state
 * ```tsx
 * <IconButton icon={<Edit size={20} />} ariaLabel="Edit" loading />
 * ```
 */
const IconButtonComponent = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      ariaLabel,
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
      validateButtonProps('IconButton', { variant, size, loadingVariant });
    }, [variant, size, loadingVariant]);

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

    // Simplified loader rendering (removed useMemo)
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
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        data-state={loading ? 'loading' : 'idle'}
        data-testid="icon-button"
        {...props}
      >
        {loaderContent}
        <span className={contentClassName}>{icon}</span>
      </button>
    );
  }
);

IconButtonComponent.displayName = 'IconButton';

// Memo wrapper with displayName
export const IconButton = memo(IconButtonComponent);
IconButton.displayName = 'IconButton';
