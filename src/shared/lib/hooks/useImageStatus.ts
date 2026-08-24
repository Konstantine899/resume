// ============================================
// useImageStatus Hook
// ============================================

import { useCallback, useState } from 'react';

/**
 * Custom hook for managing image loading state
 *
 * @param forceLoading - Force loading state
 * @param normalizedSrc - Normalized image source
 * @param onLoad - Success callback
 * @param onError - Error callback
 * @returns Image state and handlers
 */
export const useImageStatus = (
  forceLoading: boolean,
  normalizedSrc: string | undefined,
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void,
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const showFallback = (!normalizedSrc && !forceLoading) || imageStatus === 'error';

  const handleLoadSuccess = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setImageStatus('loaded');
      onLoad?.(event);
    },
    [onLoad]
  );

  const handleLoadError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setImageStatus('error');
      onError?.(event);
    },
    [onError]
  );

  return {
    imageStatus,
    showFallback,
    handleLoadSuccess,
    handleLoadError,
  };
};
