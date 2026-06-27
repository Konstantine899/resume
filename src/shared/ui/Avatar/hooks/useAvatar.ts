/**
 * Custom hook for avatar image loading state management.
 *
 * @param src - Image URL to load
 * @param forceLoading - Force loading state (useful for skeleton demonstrations)
 * @returns Object with loading state, error state, and handlers:
 *   - isLoading: boolean - true while the image is loading
 *   - hasError: boolean - true if the image failed to load
 *   - handleError: () => void - called internally when the image fails
 *   - handleLoad: () => void - called internally when the image loads
 *   - reset: () => void - reset loading state
 */
import { useEffect, useState, useCallback } from 'react';

export const useAvatar = (src?: string, forceLoading?: boolean) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (forceLoading) {
      return;
    }

    if (!src) {
      // Используем queueMicrotask для синхронного обновления состояния
      // без ожидания следующего рендера
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    const img = new Image();
    img.src = src;

    const cleanup = () => {
      img.src = '';
      img.onload = null;
      img.onerror = null;
    };

    if (img.complete) {
      queueMicrotask(() => setIsLoading(false));
    } else {
      img.onload = () => cleanup();
      img.onerror = () => cleanup();
    }

    return cleanup;
  }, [src, forceLoading]);

  const handleError = useCallback(() => {
    if (!forceLoading) {
      setIsLoading(false);
      setHasError(true);
    }
  }, [forceLoading]);

  const handleLoad = useCallback(() => {
    if (!forceLoading) {
      setIsLoading(false);
      setHasError(false);
    }
  }, [forceLoading]);

  const reset = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  return {
    isLoading,
    hasError,
    handleError,
    handleLoad,
    reset,
  };
};
