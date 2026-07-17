import type { ToastType } from '@/shared/ui/Toast/model/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { extractTextFromNode } from '../utils/extractTextFromNode';

interface UseCopyCodeOptions {
  showToastOnSuccess?: boolean;
  showToastOnError?: boolean;
  addToast?: (message: string, type?: ToastType, duration?: number) => void;
  onCopy?: () => void;
  enabled?: boolean;
}

interface UseCopyCodeReturn {
  isCopied: boolean;
  isError: boolean;
  handleCopy: () => void;
  reset: () => void;
  resetError: () => void;
}

/**
 * Хук для копирования кода в буфер обмена.
 * Использует `navigator.clipboard.writeText()` синхронно в обработчике клика,
 * без async/await, чтобы не терять user gesture (transient activation).
 *
 * @param code - React-узел для извлечения текста
 * @param options - Опции: тосты, колбэки
 * @returns Объект с состояниями и обработчиками копирования
 */
export const useCopyCode = (
  code: React.ReactNode,
  options: UseCopyCodeOptions = {}
): UseCopyCodeReturn => {
  const {
    showToastOnSuccess = false,
    showToastOnError = true,
    addToast,
    onCopy,
    enabled = true,
  } = options;

  const [isCopied, setIsCopied] = useState(false);
  const [isError, setIsError] = useState(false);

  // Мемоизируем извлечение текста — избегаем повторного обхода дерева на каждый рендер
  const codeText = useMemo(() => (enabled ? extractTextFromNode(code) : ''), [code, enabled]);

  const handleCopy = useCallback(() => {
    if (!enabled) return;

    setIsError(false);

    if (!navigator.clipboard) {
      setIsError(true);

      if (showToastOnError && addToast) {
        addToast('Failed to copy code', 'error', 3000);
      }

      return;
    }

    navigator.clipboard
      .writeText(codeText)
      .then(() => {
        setIsCopied(true);

        if (showToastOnSuccess && addToast) {
          addToast('Code copied to clipboard', 'success', 2000);
        }

        onCopy?.();

        // Таймаут сброса обрабатывается в useEffect для cleanup при unmount
      })
      .catch(() => {
        setIsError(true);

        if (showToastOnError && addToast) {
          addToast('Failed to copy code', 'error', 3000);
        }
      });
  }, [codeText, showToastOnSuccess, showToastOnError, addToast, onCopy, enabled]);

  // Cleanup таймаута при размонтировании или изменении isCopied
  useEffect(() => {
    if (!isCopied || !enabled) return;

    const timeoutId = setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isCopied, enabled]);

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  const resetError = useCallback(() => {
    setIsError(false);
  }, []);

  return { isCopied, isError, handleCopy, reset, resetError };
};

export default useCopyCode;
