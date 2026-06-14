import { useEffect, useState } from 'react';

export const useAvatar = (src?: string, forceLoading?: boolean) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (forceLoading) {
      return;
    }

    if (!src) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    const img = new Image();
    img.src = src;

    if (img.complete) {
      queueMicrotask(() => setIsLoading(false));
    }
  }, [src, forceLoading]);

  const handleError = () => {
    if (!forceLoading) {
      setIsLoading(false);
      setHasError(true);
    }
  };

  const handleLoad = () => {
    if (!forceLoading) {
      setIsLoading(false);
      setHasError(false);
    }
  };

  const reset = () => {
    setIsLoading(true);
    setHasError(false);
  };

  return {
    isLoading,
    hasError,
    handleError,
    handleLoad,
    reset,
  };
};
