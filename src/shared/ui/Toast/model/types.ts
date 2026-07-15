// ============================================
// Toast Types
// ============================================

/**
 * Type of toast notification
 * Determines icon and styling
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification props
 *
 * @example
 * ```tsx
 * <Toast
 *   id="unique-id"
 *   message="Operation completed!"
 *   type="success"
 *   duration={5000}
 *   onClose={(id) => removeToast(id)}
 * />
 * ```
 */
export interface ToastProps {
  /** Unique identifier for the toast */
  id: string;
  /** Additional CSS class */
  className?: string;
  /** Message to display */
  message: string;
  /** Type of notification (affects icon and colors) */
  type?: ToastType;
  /** Auto-close duration in milliseconds (0 = no auto-close) */
  duration?: number;
  /** Callback when toast is closed */
  onClose: (id: string) => void;
}
