// ============================================
// Toast Context (Shared Layer)
// ============================================

import { Portal } from '@/shared/ui/Portal';
import { Toast } from '@/shared/ui/Toast';
import { TOAST_CONSTANTS } from '@/shared/ui/Toast/model/constants';
import type { ToastType } from '@/shared/ui/Toast/model/types';
import { createContext, useCallback, useState, type ReactNode } from 'react';
import type { ToastContextType, ToastState } from '../model/types';
import styles from './ToastContext.module.scss';

// ============================================
// Context
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isClearing, setIsClearing] = useState(false);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration: number = TOAST_CONSTANTS.DEFAULT_DURATION
    ) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if (toasts.length === 0) return;

    // Set clearing flag to trigger exit animation on all toasts
    setIsClearing(true);

    // Clear state after exit animation completes
    setTimeout(() => {
      setToasts([]);
      setIsClearing(false);
    }, TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
  }, [toasts.length]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAll }}>
      {children}

      <Portal>
        <div className={styles.container} role="region" aria-label="Notifications">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
              forceClose={isClearing}
            />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
};

export { ToastContext };
