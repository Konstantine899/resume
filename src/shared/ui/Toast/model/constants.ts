// ============================================
// Toast Constants
// ============================================

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ToastType } from './types';

export const TOAST_CONSTANTS = {
  DEFAULT_DURATION: 5000,
  EXIT_ANIMATION_DURATION: 300,
  ICON_SIZE: 20,
  CLOSE_ICON_SIZE: 16,
} as const;

export const TOAST_TYPES: readonly ToastType[] = ['success', 'error', 'info', 'warning'];

export const TOAST_ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};
