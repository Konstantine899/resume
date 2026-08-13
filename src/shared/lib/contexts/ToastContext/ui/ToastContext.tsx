// ============================================
// Toast Context (Shared Layer)
// ============================================

import { Portal } from '@/shared/ui/Portal';
import { Toast } from '@/shared/ui/Toast';
import type { ToastPosition } from '../model/types';
import { createContext, type ReactNode } from 'react';
import { useToastLogic } from '../lib/hooks/useToastLogic';
import type { ToastContextType } from '../model/types';
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
  position?: ToastPosition;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
}) => {
  const { addToast, removeToast, clearAll, promise, toasts, isClearing } = useToastLogic();

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
    clearAll,
    promise,
  };

  const containerClassName = `${styles.container} ${styles['container--' + position]}`;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Portal>
        <div className={containerClassName} role="region" aria-label="Notifications">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
              forceClose={isClearing}
              action={toast.action}
            />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
};

export { ToastContext };
