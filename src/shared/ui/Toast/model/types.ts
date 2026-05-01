// ============================================
// Toast Types
// ============================================

import { ToastType } from '@/app/providers/ToastProvider';

export interface ToastProps {
  id: string;
  className?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}
