// ============================================
// useToastLogic Hook
// ============================================

import { useCallback, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TOAST_CONSTANTS } from '@/shared/ui/Toast/model/constants';
import type { ToastOptions, SettledToastType, ToastAction } from '@/shared/ui/Toast/model/types';
import type { ToastContextType, ToastState, PromiseToastMessages } from '../../model/types';
import { validateToastProps } from '../utils/validateToastProps';

/**
 * Hook encapsulating all ToastProvider logic.
 * Returns toast management functions and state.
 *
 * @example
 * ```tsx
 * function ToastProvider({ children }) {
 *   const { addToast, removeToast, clearAll, promise, toasts, isClearing } = useToastLogic();
 *   return (
 *     <ToastContext.Provider value={{ addToast, removeToast, clearAll, promise }}>
 *       {children}
 *       <Portal>
 *         <div role="region" aria-label="Notifications">
 *           {toasts.map(toast => (
 *             <Toast key={toast.id} {...toast} onClose={removeToast} />
 *           ))}
 *         </div>
 *       </Portal>
 *     </ToastContext.Provider>
 *   );
 * }
 * ```
 */
export const useToastLogic = (): Pick<
  ToastContextType,
  'addToast' | 'removeToast' | 'clearAll' | 'promise'
> & {
  toasts: ToastState[];
  isClearing: boolean;
} => {
  const { t } = useTranslation();
  const [toasts, dispatch] = useReducer(
    (state: ToastState[], action: ToastReducerAction): ToastState[] => {
      switch (action.type) {
        case 'ADD': {
          const existingIndex = state.findIndex((toast) => toast.id === action.payload.id);
          if (existingIndex >= 0) {
            const newState = [...state];
            newState[existingIndex] = action.payload;
            return newState;
          }
          return [...state, action.payload];
        }
        case 'REMOVE':
          return state.filter((toast) => toast.id !== action.id);
        case 'UPDATE':
          return state.map((toast) =>
            toast.id === action.id ? { ...toast, ...action.payload } : toast
          );
        case 'CLEAR_ALL':
          return [];
        case 'DISMISS_OLDEST':
          return state.slice(1);
        default:
          return state;
      }
    },
    []
  );
  const [isClearing, setIsClearing] = useState(false);

  const countDuplicateToasts = useCallback(
    (message: string, type: SettledToastType): number => {
      return toasts.filter((toast) => toast.message === message && toast.type === type).length;
    },
    [toasts]
  );

  const addToast = useCallback(
    (options: ToastOptions): string => {
      const message = options.message;
      const type = options.type ?? 'info';
      const duration = options.duration ?? TOAST_CONSTANTS.DEFAULT_DURATION;
      const id = options.id;
      const action = 'action' in options ? options.action : undefined;

      // Dev-only validation
      validateToastProps({ message, type, duration, id });

      const resolvedMessage = resolveToastMessage(message, t);

      const duplicateCount = type !== 'loading' ? countDuplicateToasts(resolvedMessage, type) : 0;
      const finalMessage =
        duplicateCount >= 2 ? `${resolvedMessage} (${duplicateCount + 1})` : resolvedMessage;

      const toastId = id ?? crypto.randomUUID();

      if (toasts.length >= TOAST_CONSTANTS.MAX_QUEUE_SIZE && !id) {
        dispatch({ type: 'DISMISS_OLDEST' });
      }

      dispatch({
        type: 'ADD',
        payload: { id: toastId, message: finalMessage, type, duration, action },
      });

      return toastId;
    },
    [t, countDuplicateToasts, toasts.length]
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const clearAll = useCallback(() => {
    if (toasts.length === 0) return;
    setIsClearing(true);
    setTimeout(() => {
      dispatch({ type: 'CLEAR_ALL' });
      setIsClearing(false);
    }, TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
  }, [toasts.length]);

  const promise = useCallback(
    <T>(
      promise: Promise<T>,
      messages: PromiseToastMessages<T>,
      options?: { id?: string; action?: ToastAction }
    ): Promise<T> => {
      const toastId = options?.id ?? crypto.randomUUID();
      const loadingMessage =
        typeof messages.loading === 'function' ? messages.loading() : messages.loading;

      dispatch({
        type: 'ADD',
        payload: {
          id: toastId,
          message: resolveToastMessage(loadingMessage, t),
          type: 'loading',
          duration: 0,
          action: options?.action,
        },
      });

      const settledPromise = promise
        .then((data) => {
          const successMessage =
            typeof messages.success === 'function' ? messages.success(data) : messages.success;

          if (successMessage === '') {
            dispatch({ type: 'REMOVE', id: toastId });
          } else {
            dispatch({
              type: 'UPDATE',
              id: toastId,
              payload: {
                type: 'success',
                message: resolveToastMessage(successMessage, t),
                duration: TOAST_CONSTANTS.DEFAULT_DURATION,
              },
            });
          }
          return data;
        })
        .catch((error: Error) => {
          const errorMessage =
            typeof messages.error === 'function' ? messages.error(error) : messages.error;

          dispatch({
            type: 'UPDATE',
            id: toastId,
            payload: {
              type: 'error',
              message: resolveToastMessage(errorMessage, t),
              duration: TOAST_CONSTANTS.DEFAULT_DURATION,
            },
          });

          throw error;
        });

      return settledPromise;
    },
    [t]
  );

  return {
    addToast,
    removeToast,
    clearAll,
    promise,
    toasts,
    isClearing,
  };
};

// ============================================
// Internal Types
// ============================================

type ToastReducerAction =
  | { type: 'ADD'; payload: ToastState }
  | { type: 'REMOVE'; id: string }
  | { type: 'UPDATE'; id: string; payload: Partial<ToastState> }
  | { type: 'CLEAR_ALL' }
  | { type: 'DISMISS_OLDEST' };

// ============================================
// i18n Resolution Helper
// ============================================

function resolveToastMessage(
  message: string | { key: string; values?: Record<string, string | number | boolean> },
  t: (key: string, values?: Record<string, string | number | boolean>) => string
): string {
  if (typeof message === 'string') {
    if (message.startsWith('t:')) {
      const key = message.slice(2);
      return t(key);
    }
    return message;
  }
  return t(message.key, message.values);
}
