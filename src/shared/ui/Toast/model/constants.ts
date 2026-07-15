// ============================================
// Toast Constants
// ============================================

import type { ToastType } from './types';

export const TOAST_CONSTANTS = {
  DEFAULT_DURATION: 5000,
  ICON_SIZE: 20,
  CLOSE_ICON_SIZE: 16,
} as const;

export const TOAST_TYPES: readonly ToastType[] = ['success', 'error', 'info', 'warning'];

export const TOAST_ICONS = {
  success: 'CheckCircle',
  error: 'XCircle',
  info: 'Info',
  warning: 'AlertTriangle',
} as const;
