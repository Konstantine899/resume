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
