import { useCallback, useEffect, useMemo, useState } from 'react';
import { extractTextFromNode } from '../utils/extractTextFromNode';

interface UseCopyCodeOptions {
  /** Результат копирования: true — успех, false — ошибка. Тост/уведомление решает consumer (IoC) */
  onCopyResult?: (success: boolean) => void;
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
 * Хук НЕ зависит от UI/Toast — результат копирования сообщается через `onCopyResult`,
 * а отображение тоста (или иное поведение) решает вызывающая сторона.
 *
 * @param code - React-узел для извлечения текста
 * @param options - Опции: колбэк результата, колбэк копирования
 * @returns Объект с состояниями и обработчиками копирования
 */
export const useCopyCode = (
  code: React.ReactNode,
  options: UseCopyCodeOptions = {}
): UseCopyCodeReturn => {
  const { onCopyResult, onCopy, enabled = true } = options;

  const [isCopied, setIsCopied] = useState(false);
  const [isError, setIsError] = useState(false);

  // Мемоизируем извлечение текста — избегаем повторного обхода дерева на каждый рендер
  const codeText = useMemo(() => (enabled ? extractTextFromNode(code) : ''), [code, enabled]);

  const handleCopy = useCallback(() => {
    if (!enabled) return;

    setIsError(false);

    if (!navigator.clipboard) {
      setIsError(true);
      onCopyResult?.(false);
      return;
    }

    navigator.clipboard
      .writeText(codeText)
      .then(() => {
        setIsCopied(true);
        onCopyResult?.(true);
        onCopy?.();
      })
      .catch(() => {
        setIsError(true);
        onCopyResult?.(false);
      });
  }, [codeText, onCopyResult, onCopy, enabled]);

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
