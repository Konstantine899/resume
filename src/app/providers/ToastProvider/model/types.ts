// ============================================
// Toast Provider Types
// ============================================

import { ToastType } from '@/shared/ui/Toast/model/types';

export interface ToastState {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}
