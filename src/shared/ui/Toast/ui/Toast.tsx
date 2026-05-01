// ============================================
// Toast Component (Shared Layer)
// ============================================

import { classNames } from '@/shared/lib/utils';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { memo, useEffect } from 'react';
import { ToastType } from '../model/types';
import styles from './Toast.module.scss';

const icons: Record<ToastType, React.ComponentType<{ size?: number }>> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export interface ToastProps {
  id: string;
  className?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast = memo((props: ToastProps) => {
  const { id, className, message, type = 'info', duration = 5000, onClose } = props;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, id, onClose]);

  const Icon = icons[type];

  const mods = {
    [styles[type]]: true,
  };

  return (
    <div className={classNames(styles.toast, mods, [className])} role="alert" aria-live="polite">
      <div className={styles.icon}>
        <Icon size={20} />
      </div>
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';
