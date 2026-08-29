// ============================================
// ButtonLoader Component
// ============================================

import React from 'react';
import { Spinner } from '@/shared/ui/Spinner';
import { Skeleton } from '@/shared/ui/Skeleton';
import { BUTTON_CONSTANTS } from '../../model/constants';
import type { LoadingVariant } from '../../model/types';

/**
 * Props for the ButtonLoader component.
 */
export interface ButtonLoaderProps {
  /** Whether to show the loader */
  loading: boolean;
  /** Which loader variant to render */
  loadingVariant?: LoadingVariant;
  /** Additional class name for the wrapper span */
  className?: string;
}

/**
 * ButtonLoader Component — renders Spinner or Skeleton based on loading state.
 *
 * @description Isolates loader rendering logic extracted from Button components.
 * Returns null when loading is false.
 *
 * @example
 * ```tsx
 * <ButtonLoader loading={true} loadingVariant="spinner" />
 * // Renders: <span><Spinner label="Loading" /></span>
 * ```
 */
export const ButtonLoader = React.memo(
  ({ loading, loadingVariant = 'spinner', className = '' }: ButtonLoaderProps) => {
    if (!loading) {
      return null;
    }

    return loadingVariant === 'spinner' ? (
      <span className={className}>
        <Spinner
          size={BUTTON_CONSTANTS.LOADER_SPINNER_SIZE}
          color={BUTTON_CONSTANTS.LOADER_SPINNER_COLOR}
          label={BUTTON_CONSTANTS.DEFAULT_SPINNER_LABEL}
        />
      </span>
    ) : (
      <span className={className}>
        <Skeleton width="100%" height="100%" />
      </span>
    );
  }
);

ButtonLoader.displayName = 'ButtonLoader';
