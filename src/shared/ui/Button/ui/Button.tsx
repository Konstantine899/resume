// src/shared/ui/Button/ui/Button.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { Loader } from '@/shared/ui/Loader';
import React, { forwardRef, useCallback, useMemo, useEffect } from 'react';
import type { ButtonProps } from '../model/types';
import styles from './Button.module.scss';

// ============================================
// Component implementation с forwardRef
// ============================================
const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      icon,
      variant = 'primary',
      size = 'md',
      iconPosition = 'left',
      rotation = 0,
      onClick,
      disabled = false,
      className = '',
      type = 'button',
      fullWidth = false,
      loading = false,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const isIconOnly = !!icon && !children;
    const hasIcon = !!icon;
    const hasText = !!children;

    useEffect(() => {
      if (isIconOnly && !ariaLabel) {
        console.error(
          'Button: ariaLabel is required for icon-only buttons for accessibility. ' +
            'Example: <Button icon={<Icon />} ariaLabel="Submit form" />'
        );
      }
    }, [isIconOnly, ariaLabel]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const buttonClassName = useMemo(
      () =>
        classNames(
          styles.button,
          styles[variant],
          styles[size],
          isIconOnly && styles.iconOnly,
          loading && styles.loading,
          fullWidth && styles.fullWidth,
          className
        ),
      [variant, size, isIconOnly, loading, fullWidth, className]
    );

    const iconStyle = useMemo(
      () => (rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : undefined),
      [rotation]
    );

    const renderIcon = useCallback(
      (position: 'left' | 'right') => {
        if (!hasIcon || iconPosition !== position) return null;

        return (
          <span className={styles.icon} style={iconStyle}>
            {icon}
          </span>
        );
      },
      [hasIcon, iconPosition, iconStyle, icon]
    );

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        className={buttonClassName}
        aria-label={isIconOnly ? ariaLabel : undefined}
        aria-disabled={disabled || loading}
        data-testid="button"
        {...props}
      >
        <span className={styles.inner}>
          {renderIcon('left')}
          {hasText && <span className={styles.text}>{children}</span>}
          {renderIcon('right')}
        </span>

        {loading && (
          <div className={styles.loaderWrapper}>
            <Loader variant="spinner" size="sm" color="secondary" label="Loading" />
          </div>
        )}
      </button>
    );
  }
);

ButtonComponent.displayName = 'Button';

// ============================================
// Type-safe overloads через interface merging
// ============================================
type ButtonComponentType = React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;

export const Button = ButtonComponent as ButtonComponentType;

export default Button;
