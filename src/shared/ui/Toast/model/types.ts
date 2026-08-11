// ============================================
// Toast Types
// ============================================

/**
 * Type of toast notification
 * Determines icon and styling
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Action button configuration for toast
 * @description Optional action button (e.g., "Undo", "Retry", "View")
 * @example
 * ```typescript
 * action: {
 *   label: 'Undo',
 *   onClick: () => restoreDeletedItem(),
 *   variant: 'primary'
 * }
 * ```
 */
export interface ToastAction {
  /** Button label text */
  label: string;
  /** Click handler — does NOT auto-close toast */
  onClick: () => void;
  /** Visual variant (default: 'secondary') */
  variant?: 'primary' | 'secondary';
}

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
 *
 * @example
 * ```tsx
 * // With action button
 * <Toast
 *   id="file-deleted"
 *   message="File deleted"
 *   type="warning"
 *   action={{ label: 'Undo', onClick: restoreFile }}
 *   onClose={(id) => removeToast(id)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With forceClose (for clearAll)
 * <Toast
 *   id="toast-1"
 *   message="Closing..."
 *   forceClose
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
  /** Optional action button (e.g., "Undo", "Retry") */
  action?: ToastAction;
  /** Force close trigger for clearAll (internal use) */
  forceClose?: boolean;
  /** Callback when toast is closed */
  onClose: (id: string) => void;
}
