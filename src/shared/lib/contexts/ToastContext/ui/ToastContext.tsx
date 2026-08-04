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

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
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
            />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
};

export { ToastContext };
