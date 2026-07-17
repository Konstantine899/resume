// ============================================
// ButtonWithIcon Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { Spinner } from '@/shared/ui/Spinner';
import { Skeleton } from '@/shared/ui/Skeleton';
import { validateButtonProps } from '../../lib/validateButtonProps';
import { BUTTON_CONSTANTS } from '../../model/constants';
import React, { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import type { ButtonWithIconProps } from '../../model/types';
import styles from './ButtonWithIcon.module.scss';

/**
 * ButtonWithIcon Component — кнопка с иконкой (слева или справа)
 *
 * @example
 * // Left icon
 * ```tsx
 * <ButtonWithIcon leftIcon={<Download size={18} />} onClick={handleDownload}>
 *   Скачать
 * </ButtonWithIcon>
 * ```
 *
 * @example
 * // Right icon
 * ```tsx
 * <ButtonWithIcon rightIcon={<ArrowRight size={18} />} onClick={handleNext}>
 *   Далее
 * </ButtonWithIcon>
 * ```
 *
 * @example
 * // Both icons
 * ```tsx
 * <ButtonWithIcon
 *   leftIcon={<ArrowLeft size={18} />}
 *   rightIcon={<ArrowRight size={18} />}
 * >
 *   Навигация
 * </ButtonWithIcon>
 * ```
 */
const ButtonWithIconComponent = forwardRef<HTMLButtonElement, ButtonWithIconProps>(
  (
    {
      children,
      leftIcon,
      rightIcon,
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

    // Simplified icon rendering (removed useMemo)
    const iconContent = (
      <>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <span className={styles.text}>{children}</span>
        {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </>
    );

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
        data-testid="button-with-icon"
        {...props}
      >
        {loaderContent}
        <span className={contentClassName}>{iconContent}</span>
      </button>
    );
  }
);

ButtonWithIconComponent.displayName = 'ButtonWithIcon';

// Memo wrapper with displayName
export const ButtonWithIcon = memo(ButtonWithIconComponent);
ButtonWithIcon.displayName = 'ButtonWithIcon';
