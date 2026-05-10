// ============================================
// useToast Hook (Shared Layer)
// ============================================

import { useContext } from 'react';
import { ToastContextType } from '../../model/types';
import { ToastContext } from '../../ui/ToastContext';

/**
 * Хук для работы с Toast уведомлениями
 *
 * @example
 * ```tsx
 * const { addToast, removeToast } = useToast();
 *
 * addToast('Success!', 'success');
 * ```
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default useToast;
