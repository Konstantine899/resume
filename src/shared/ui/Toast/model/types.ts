// ============================================
// Toast Types
// ============================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  className?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}
