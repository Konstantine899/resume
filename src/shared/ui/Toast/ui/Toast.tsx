// ============================================
// Toast Component (Shared Layer)
// ============================================

import { classNames } from '@/shared/lib/utils';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { memo, useEffect } from 'react';
import { TOAST_CONSTANTS, TOAST_TYPES } from '../model/constants';
import type { ToastProps, ToastType } from '../model/types';
import styles from './Toast.module.scss';

const icons: Record<ToastType, React.ComponentType<{ size?: number }>> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

/**
 * Toast notification component for displaying temporary messages
 *
 * Features:
 * - 4 types (success, error, info, warning) with distinct icons
 * - Auto-close with configurable duration
 * - Manual close button
 * - Accessible (role="alert", keyboard support)
 * - Memoized for performance
 *
 * @example
 * ```tsx
 * <Toast
 *   id="toast-1"
 *   message="File uploaded successfully!"
 *   type="success"
 *   duration={5000}
 *   onClose={(id) => removeToast(id)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Persistent toast (no auto-close)
 * <Toast
 *   id="toast-2"
 *   message="Review required"
 *   type="warning"
 *   duration={0}
 *   onClose={(id) => removeToast(id)}
 * />
 * ```
 */
export const Toast = memo((props: ToastProps) => {
  const {
    id,
    className,
    message,
    type = 'info',
    duration = TOAST_CONSTANTS.DEFAULT_DURATION,
    onClose,
  } = props;

  // Валидация type
  if (process.env.NODE_ENV === 'development' && !TOAST_TYPES.includes(type)) {
    // eslint-disable-next-line no-console
    console.warn(`Toast: невалидный тип "${type}". Доступные: ${TOAST_TYPES.join(', ')}`);
  }

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, id, onClose]);

  // Fallback to info icon for invalid types
  const Icon = icons[type] ?? icons.info;

  const mods = {
    [styles[type]]: true,
  };

  return (
    <div
      className={classNames(styles.toast, mods, [className])}
      role="alert"
      aria-live="assertive"
      data-testid="toast"
      data-type={type}
    >
      <div className={styles.icon} aria-hidden="true">
        <Icon size={TOAST_CONSTANTS.ICON_SIZE} />
      </div>
      <span className={styles.message} id={`toast-message-${id}`}>
        {message}
      </span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => onClose(id)}
        aria-label="Close notification"
        data-testid="toast-close"
      >
        <X size={TOAST_CONSTANTS.CLOSE_ICON_SIZE} />
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';
