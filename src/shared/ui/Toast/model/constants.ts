// ============================================
// Toast Constants
// ============================================

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SettledToastType } from './types';

export const TOAST_CONSTANTS = {
  DEFAULT_DURATION: 5000,
  EXIT_ANIMATION_DURATION: 300,
  ICON_SIZE: 20,
  CLOSE_ICON_SIZE: 16,
  // Swipe-to-dismiss: horizontal drag distance (px) past which the toast closes.
  SWIPE_THRESHOLD: 80,
  // Queue guard: maximum number of toasts in the queue before oldest is dismissed.
  MAX_QUEUE_SIZE: 10,
} as const;

export const TOAST_TYPES: readonly SettledToastType[] = ['success', 'error', 'info', 'warning'];

export const TOAST_ICONS: Record<SettledToastType, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};
