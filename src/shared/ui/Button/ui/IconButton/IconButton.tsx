// src/shared/ui/Button/ui/IconButton/IconButton.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { Loader } from '@/shared/ui/Loader';
import { Skeleton } from '@/shared/ui/Skeleton';
import React, { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import type { ButtonSize, ButtonVariant, IconButtonProps, LoadingVariant } from '../../model/types';
import styles from './IconButton.module.scss';

// Valid values for runtime validation
const VALID_VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'danger',
  'sidebar',
];
const VALID_SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const VALID_LOADING_VARIANTS: LoadingVariant[] = ['spinner', 'skeleton'];

/**
 * Runtime validation for IconButton props (development only)
 */
const validateIconButtonProps = (props: IconButtonProps) => {
  if (process.env.NODE_ENV === 'development') {
    const { variant, size, loadingVariant } = props;

    if (variant && !VALID_VARIANTS.includes(variant)) {
      // eslint-disable-next-line no-console
      console.warn(
        `IconButton: invalid variant "${variant}". Valid values: ${VALID_VARIANTS.join(', ')}`
      );
    }

    if (size && !VALID_SIZES.includes(size)) {
      // eslint-disable-next-line no-console
      console.warn(`IconButton: invalid size "${size}". Valid values: ${VALID_SIZES.join(', ')}`);
    }

    if (loadingVariant && !VALID_LOADING_VARIANTS.includes(loadingVariant)) {
      // eslint-disable-next-line no-console
      console.warn(
        `IconButton: invalid loadingVariant "${loadingVariant}". Valid values: ${VALID_LOADING_VARIANTS.join(', ')}`
      );
    }
  }
};

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
    // Runtime validation in development mode
    useEffect(() => {
      validateIconButtonProps({
        icon,
        ariaLabel,
        variant,
        size,
        onClick,
        disabled,
        className,
        type,
        fullWidth,
        loading,
        loadingVariant,
        ...props,
      });
    }, [
      variant,
      size,
      loadingVariant,
      icon,
      ariaLabel,
      disabled,
      fullWidth,
      loading,
      type,
      onClick,
      className,
      props,
    ]);

    // Memoize className calculation to prevent recalculation on every render
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

    // Memoize click handler to prevent recreation on every render
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

    // Memoize loader component
    const loaderContent = useMemo(() => {
      if (!loading) return null;

      if (loadingVariant === 'spinner') {
        return (
          <span className={styles.loader}>
            <Loader variant="spinner" size="sm" color="secondary" label="Loading" />
          </span>
        );
      }

      if (loadingVariant === 'skeleton') {
        return (
          <span className={styles.skeleton}>
            <Skeleton width="100%" height="100%" />
          </span>
        );
      }

      return null;
    }, [loading, loadingVariant]);

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

// Memo wrapper to prevent unnecessary re-renders when props haven't changed
export const IconButton = memo(IconButtonComponent);
