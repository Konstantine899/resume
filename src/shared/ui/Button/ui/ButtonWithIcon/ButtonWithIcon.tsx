// src/shared/ui/Button/ui/ButtonWithIcon/ButtonWithIcon.tsx

import { Skeleton } from '@/shared/ui/Skeleton';
import { Loader } from '@/shared/ui/Loader';
import { classNames } from '@/shared/lib/utils/classNames';
import React, { forwardRef } from 'react';
import type { ButtonWithIconProps } from '../../model/types';
import styles from './ButtonWithIcon.module.scss';

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
        data-testid="button-with-icon"
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

        <span className={classNames(styles.content, loading && styles.hidden)}>
          {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
          <span className={styles.text}>{children}</span>
          {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

ButtonWithIconComponent.displayName = 'ButtonWithIcon';

export const ButtonWithIcon = ButtonWithIconComponent;
