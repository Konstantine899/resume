// ============================================
// useButton Hook
// ============================================

import { useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { resolveCssModuleKey } from '@/shared/lib/utils/resolveCssModuleKey';
import { ButtonLoader } from '../../ui/ButtonLoader';
import { resolveButtonAppearance } from '../utils/resolveButtonAppearance';
import { validateButtonProps } from '../utils/validateButtonProps';
import type {
  ButtonColorScheme,
  ButtonVariant,
  ButtonSize,
  LoadingVariant,
} from '../../model/types';
import buttonStyles from '../../ui/Button/Button.module.scss';

/**
 * Options for configuring the useButton hook.
 * @description Extracted to consolidate shared button logic across all three Button components.
 */
export interface UseButtonOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  colorScheme?: ButtonColorScheme;
  loading: boolean;
  loadingVariant: LoadingVariant;
  fullWidth: boolean;
  disabled: boolean;
  className: string;
  onClick?: React.MouseEventHandler;
  /**
   * Caller-provided keydown handler.
   * @description Composed into the returned `handleKeyDown` so user handlers are
   * never silently dropped when the components attach keyboard activation.
   */
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  /**
   * Optional SCSS module styles override.
   * @description When provided, the hook uses these styles instead of the default Button styles.
   * Allows IconButton and ButtonWithIcon to reuse the hook with their own CSS modules.
   * Named `cssModule` (not `styles`) so it never collides with the local `styles`
   * import inside the components.
   */
  cssModule?: Record<string, string>;
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
  /**
   * Enter/Space activation handler for elements without native button behaviour.
   * @description Prevents the default action (Space scrolling, native activation),
   * runs the caller's `onKeyDown`, then dispatches a single native `click()` so
   * keyboard and pointer input share exactly one guarded code path.
   */
  handleKeyDown: React.KeyboardEventHandler<HTMLElement>;
  /** Loader element (Spinner/Skeleton) or null when not loading */
  loader: ReactNode | null;
}

/**
 * Shared hook that consolidates Button logic duplicated across Button, ButtonWithIcon, and IconButton.
 *
 * @remarks
 * Handles className computation, guarded click/keyboard handling, runtime validation,
 * and loader rendering. All three button components use this hook internally.
 *
 * @param options - Configuration matching the common button props
 * @returns Computed class names, event handlers, and loader element
 */
export const useButton = ({
  variant,
  size,
  colorScheme,
  loading,
  loadingVariant,
  fullWidth,
  disabled,
  className,
  onClick,
  onKeyDown,
  cssModule,
}: UseButtonOptions): UseButtonReturn => {
  // Use custom styles (for IconButton/ButtonWithIcon) or default to Button styles
  const s = cssModule ?? buttonStyles;

  // Single source of truth for the `variant="danger"` → primary + colorScheme mapping.
  // Components already resolve at their call site; re-resolving here is idempotent and
  // keeps direct hook consumers on the same mapping.
  const appearance = resolveButtonAppearance(variant, colorScheme);
  const { variant: resolvedVariant, colorScheme: resolvedColorScheme } = appearance;

  // Runtime validation in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const warnings = validateButtonProps(
        resolvedVariant,
        size,
        loadingVariant,
        loading,
        resolvedColorScheme
      );
      warnings.forEach((w) => {
        // eslint-disable-next-line no-console
        console.warn(w.message);
      });
    }
  }, [resolvedVariant, size, loadingVariant, loading, resolvedColorScheme]);

  // Memoize className calculation
  const buttonClassName = useMemo(
    () =>
      classNames(
        s.button,
        s[resolvedVariant],
        s[size],
        resolvedColorScheme && resolveCssModuleKey(s, `color-scheme-${resolvedColorScheme}`),
        loading && s.loading,
        fullWidth && s.fullWidth,
        className
      ),
    [resolvedVariant, size, resolvedColorScheme, loading, fullWidth, className, s]
  );

  // Memoize content className.
  // Note: content hiding while loading is handled by the `button-loading` mixin on the
  // root element — there is no `.hidden` class in any Button SCSS module.
  const contentClassName = useMemo(() => classNames(s.content), [s]);

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

  // Guarded keyboard activation for elements without native button behaviour
  // (`component="div"`, `component="a"`, `asChild` on a non-interactive child).
  const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLElement>>(
    (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      // Cancel native activation/scroll, then go through the single guarded click path:
      // a disabled/loading button blocks inside handleClick (no onClick, no navigation).
      event.preventDefault();
      event.currentTarget.click();
    },
    [onKeyDown]
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
    handleKeyDown,
    loader,
  };
};
