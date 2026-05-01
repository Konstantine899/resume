// ============================================
// Toast Provider Types
// ============================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

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
