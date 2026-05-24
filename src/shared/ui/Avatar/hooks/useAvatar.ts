import { useState } from 'react';

export const useAvatar = () => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const handleLoad = () => {
    setHasError(false);
  };

  const reset = () => {
    setHasError(false);
  };

  return {
    hasError,
    handleError,
    handleLoad,
    reset,
  };
};
