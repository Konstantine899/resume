// ============================================
// useButton Hook
// ============================================

import { useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { ButtonLoader } from '../../ui/ButtonLoader';
import { validateButtonProps } from '../utils/validateButtonProps';
import type { ButtonVariant, ButtonSize, LoadingVariant } from '../../model/types';
import buttonStyles from '../../ui/Button/Button.module.scss';

/**
 * Options for configuring the useButton hook.
 * @description Extracted to consolidate shared button logic across all three Button components.
 */
export interface UseButtonOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  loading: boolean;
  loadingVariant: LoadingVariant;
  fullWidth: boolean;
  disabled: boolean;
  className: string;
  onClick?: React.MouseEventHandler;
  /**
   * Optional SCSS module styles override.
   * @description When provided, the hook uses these styles instead of the default Button styles.
   * Allows IconButton and ButtonWithIcon to reuse the hook with their own CSS modules.
   */
  styles?: Record<string, string>;
}

/**
 * Return value from the useButton hook.
 */
export interface UseButtonReturn {
  /** Computed className for the root button element */
  buttonClassName: string;
  /** Computed className for the content wrapper element */
  contentClassName: string;
  /** Guarded click handler that prevents interaction when disabled or loading */
  handleClick: React.MouseEventHandler;
  /** Loader element (Spinner/Skeleton) or null when not loading */
  loader: ReactNode | null;
}

/**
 * Shared hook that consolidates Button logic duplicated across Button, ButtonWithIcon, and IconButton.
 *
 * @remarks
 * Handles className computation, guarded click handling, runtime validation, and loader rendering.
 * All three button components use this hook internally.
 *
 * @param options - Configuration matching the common button props
 * @returns Computed class names, event handler, and loader element
 */
export const useButton = ({
  variant,
  size,
  loading,
  loadingVariant,
  fullWidth,
  disabled,
  className,
  onClick,
  styles: customStyles,
}: UseButtonOptions): UseButtonReturn => {
  // Use custom styles (for IconButton/ButtonWithIcon) or default to Button styles
  const s = customStyles ?? buttonStyles;
  // Runtime validation in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const warnings = validateButtonProps(variant, size, loadingVariant, loading);
      warnings.forEach((w) => {
        // eslint-disable-next-line no-console
        console.warn(w.message);
      });
    }
  }, [variant, size, loadingVariant, loading]);

  // Memoize className calculation
  const buttonClassName = useMemo(
    () =>
      classNames(
        s.button,
        s[variant],
        s[size],
        loading && s.loading,
        fullWidth && s.fullWidth,
        className
      ),
    [variant, size, loading, fullWidth, className, s]
  );

  // Memoize content className
  const contentClassName = useMemo(() => classNames(s.content, loading && s.hidden), [loading, s]);

  // Memoize guarded click handler
  const handleClick = useCallback(
    (event: React.MouseEvent): void => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    [disabled, loading, onClick]
  );

  // Conditionally render loader via ButtonLoader component
  const loader: ReactNode | null = loading ? (
    <ButtonLoader
      loading={loading}
      loadingVariant={loadingVariant}
      className={loadingVariant === 'spinner' ? s.loader : s.skeleton}
    />
  ) : null;

  return {
    buttonClassName,
    contentClassName,
    handleClick,
    loader,
  };
};
