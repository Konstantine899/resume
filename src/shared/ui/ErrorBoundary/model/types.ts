import type { ErrorInfo, ReactNode } from 'react';

/**
 * Props контракт ErrorBoundary (ERB-03)
 * @description Class-based boundary: catches render-phase crashes in its children
 * subtree and replaces them with the fallback, keeping the rest of the app mounted.
 */
export interface ErrorBoundaryProps {
  /**
   * Контент замены при пойманной ошибке.
   * ReactNode — статичный узел; функция — получает (error, errorInfo) и возвращает узел.
   * @default null (минимальный статичный узел — ничего не рендерит, не может бросить снова)
   */
  fallback?: ReactNode | ((error: Error, errorInfo?: ErrorInfo) => ReactNode);
  /**
   * Колбэк при срабатывании границы (componentDidCatch).
   * Полезен для отправки ошибки в аналитику/телеметрию.
   */
  onError?: (error: Error, errorInfo?: ErrorInfo) => void;
  /** Дерево, защищаемое границей. */
  children: ReactNode;
}

/**
 * Внутреннее состояние границы (ERB-03)
 * @description getDerivedStateFromError сохраняет error; componentDidCatch — errorInfo.
 */
export interface ErrorBoundaryState {
  /** Была ли поймана ошибка рендера в children */
  hasError: boolean;
  /** Пойманная ошибка рендера */
  error?: Error;
  /** Component stack / информация об ошибке от React */
  errorInfo?: ErrorInfo;
}
