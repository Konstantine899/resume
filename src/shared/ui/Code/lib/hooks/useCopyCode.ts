import type { ToastType } from '@/shared/ui/Toast/model/types';
import { useCallback, useState } from 'react';

interface UseCopyCodeOptions {
  showToastOnSuccess?: boolean;
  showToastOnError?: boolean;
  addToast?: (message: string, type?: ToastType, duration?: number) => void;
  onCopy?: () => void;
}

interface UseCopyCodeReturn {
  isCopied: boolean;
  isError: boolean;
  handleCopy: () => Promise<void>;
  reset: () => void;
  resetError: () => void;
}

/**
 * Хук для копирования кода в буфер обмена
 * С интеграцией Toast уведомлений
 */
export const useCopyCode = (code: string, options: UseCopyCodeOptions = {}): UseCopyCodeReturn => {
  const { showToastOnSuccess = false, showToastOnError = true, addToast, onCopy } = options;

  const [isCopied, setIsCopied] = useState(false);
  const [isError, setIsError] = useState(false);

  const copyWithFallback = useCallback((text: string): boolean => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }, []);

  const handleCopy = useCallback(async () => {
    setIsError(false);

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        const success = copyWithFallback(code);
        if (!success) throw new Error('Copy failed');
      }

      setIsCopied(true);

      if (showToastOnSuccess && addToast) {
        addToast('Code copied to clipboard', 'success', 2000);
      }

      onCopy?.();

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      const success = copyWithFallback(code);

      if (success) {
        setIsCopied(true);

        if (showToastOnSuccess && addToast) {
          addToast('Code copied (fallback)', 'info', 2000);
        }

        onCopy?.();

        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } else {
        setIsError(true);

        if (showToastOnError && addToast) {
          addToast('Failed to copy code', 'error', 3000);
        }
      }
    }
  }, [code, showToastOnSuccess, showToastOnError, addToast, onCopy, copyWithFallback]);

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  const resetError = useCallback(() => {
    setIsError(false);
  }, []);

  return { isCopied, isError, handleCopy, reset, resetError };
};

export default useCopyCode;
