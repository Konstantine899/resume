import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from '../model/types';

/**
 * Минимальный статичный fallback по умолчанию (ERB-04, решение 5).
 * @description Статический `null` — не содержит ни Image, ни сетевых/событийных узлов,
 * поэтому не может бросить повторно при собственном рендере → нет рекурсии.
 */
export const DEFAULT_BOUNDARY_FALLBACK: ReactNode = null;

/**
 * Класс-граница ошибок (ERB-03)
 * @description Ловит render-phase краши в children и заменяет их fallback'ом.
 * Не может поймать DOM-события (например, onError нативного `<img>`) — это зона
 * ответственности оркестрации Image (useImageLoading / renderFallback).
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={DEFAULT_BOUNDARY_FALLBACK}>
 *   <renderFallback />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { fallback } = this.props;
    if (typeof fallback === 'function') {
      return fallback(this.state.error ?? new Error('Unknown'), this.state.errorInfo);
    }
    return fallback ?? DEFAULT_BOUNDARY_FALLBACK;
  }
}
