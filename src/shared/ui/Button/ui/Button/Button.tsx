// src/shared/ui/Button/ui/Button/Button.tsx

import { Skeleton } from '@/shared/ui/Skeleton';
import { Loader } from '@/shared/ui/Loader';
import { classNames } from '@/shared/lib/utils/classNames';
import React, { forwardRef } from 'react';
import type { ButtonProps } from '../../model/types';
import styles from './Button.module.scss';

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
    const buttonClassName = classNames(
      styles.button,
      styles[variant],
      styles[size],
      loading && styles.loading,
      fullWidth && styles.fullWidth,
      className
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        className={buttonClassName}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        data-testid="button"
        {...props}
      >
        {loading && loadingVariant === 'spinner' && (
          <span className={styles.loader}>
            <Loader variant="spinner" size="sm" color="secondary" label="Loading" />
          </span>
        )}

        {loading && loadingVariant === 'skeleton' && (
          <span className={styles.skeleton}>
            <Skeleton width="100%" height="100%" />
          </span>
        )}

        <span className={classNames(styles.content, loading && styles.hidden)}>{children}</span>
      </button>
    );
  }
);

ButtonComponent.displayName = 'Button';

export const Button = ButtonComponent;
