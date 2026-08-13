// ============================================
// Toast Types
// ============================================

/**
 * Type of toast notification
 * Determines icon and styling.
 * `'loading'` renders a Spinner and never auto-closes (settled via updateToast).
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

/**
 * Settled toast types — everything except the transient `loading` state.
 * Used to key TOAST_ICONS and as the settled variant's optional `type`.
 */
export type SettledToastType = Exclude<ToastType, 'loading'>;

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

/**
 * i18n message specification for toast notifications.
 * Allows passing translation keys with optional interpolation values.
 */
export interface ToastMessageI18n {
  /** Translation key (e.g., 'fileSaved', 'errorOccurred') */
  key: string;
  /** Optional interpolation values for the translation */
  values?: Record<string, string | number | boolean>;
}

/**
 * Message can be a plain string (backward compatible) or an i18n specification.
 * - Plain string: rendered as-is (existing behavior)
 * - String with `t:` prefix: `t:myKey` → translated via `t('myKey')`
 * - Object: `{ key: 'myKey', values: { name: 'John' } }` → `t('myKey', values)`
 */
export type ToastMessage = string | ToastMessageI18n;

/**
 * Options accepted by the object-form `addToast` (ToastContext).
 * Discriminated union on `type`: the settled variant keeps `type`
 * OPTIONAL (missing → `'info'` default, TOAST-01), while the loading
 * variant accepts an explicit `duration` (the promise API passes `0`
 * so the toast persists until it is settled) but no `action`.
 *
 * @example
 * ```tsx
 * addToast({ message: 'Saved', type: 'success' });
 * addToast({ message: { key: 'fileSaved', values: { filename: 'doc.pdf' } }, type: 'success' });
 * addToast({ message: 't:uploading', type: 'loading', duration: 0 });
 * ```
 */
export type ToastOptions =
  | {
      /** Message to display (string or i18n spec) */
      message: ToastMessage;
      /** Type (default: 'info') */
      type?: SettledToastType;
      /** Auto-close duration in ms (0 = no auto-close) */
      duration?: number;
      /** Optional action button */
      action?: ToastAction;
      /** Explicit id (upsert semantics) */
      id?: string;
    }
  | {
      /** Message to display (string or i18n spec) */
      message: ToastMessage;
      /** Loading toast — rendered with a Spinner, settled via the promise API */
      type: 'loading';
      /** Auto-close duration in ms (0 = no auto-close; promise API passes 0) */
      duration?: number;
      /** Explicit id (upsert semantics) */
      id?: string;
    };
