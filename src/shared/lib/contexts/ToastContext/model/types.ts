// ============================================
// Toast Types (Shared Layer)
// ============================================

import type { ToastAction, ToastOptions, ToastType } from '@/shared/ui/Toast/model/types';

/**
 * Toast position in the viewport
 * @defaultValue 'top-right'
 */
export type ToastPosition = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

export interface ToastState {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  /** Optional action button (e.g., "Undo", "Retry") */
  action?: ToastAction;
}

export interface PromiseToastMessages<T> {
  /** Message shown while the promise is pending (function form receives nothing) */
  loading: string | (() => string);
  /** Message shown on resolve (receives the data). Empty string removes the toast instead */
  success: string | ((data: T) => string);
  /** Message shown on reject (receives the error) */
  error: string | ((error: Error) => string);
}

export interface ToastContextType {
  /** Object-form add: accepts options and returns the toast id (TOAST-01) */
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  /**
   * Close all toasts with exit animation
   * @description Triggers exit animation on all visible toasts, then clears state after animation completes
   */
  clearAll: () => void;
  /**
   * Track a promise with loading → success/error toast transitions.
   * The loading toast is created with `duration: 0` and upserted under
   * one id; on settle the SAME id becomes the success/error toast.
   * Returns the original promise so callers keep awaiting it.
   */
  promise: <T>(
    promise: Promise<T>,
    messages: PromiseToastMessages<T>,
    options?: { id?: string; action?: ToastAction }
  ) => Promise<T>;
}
