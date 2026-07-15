// ============================================
// Toast Component (Shared Layer - Senior+ 2026)
// ============================================

import { classNames } from '@/shared/lib/utils';
import { AlertTriangle, CheckCircle, Info, Pause, X, XCircle } from 'lucide-react';
import { memo, useEffect, useState, useCallback, useRef } from 'react';
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
 * - Progress bar visualization
 * - Pause on hover
 * - Exit animation
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

  const [isClosing, setIsClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Валидация type
  if (process.env.NODE_ENV === 'development' && !TOAST_TYPES.includes(type)) {
    // eslint-disable-next-line no-console
    console.warn(`Toast: невалидный тип "${type}". Доступные: ${TOAST_TYPES.join(', ')}`);
  }

  // Timer logic with pause support
  const startTimer = useCallback(() => {
    if (duration <= 0 || isPaused) return;

    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onClose(id), 300); // Wait for exit animation
    }, remainingTime);
  }, [duration, isPaused, remainingTime, id, onClose]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      setRemainingTime((prev) => Math.max(0, prev - elapsed));
      startTimeRef.current = null;
    }

    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    if (remainingTime > 0 && duration > 0) {
      setIsPaused(false);
      startTimer();
    }
  }, [remainingTime, duration, startTimer]);

  useEffect(() => {
    if (duration > 0) {
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [duration, startTimer]);

  // Handle close with exit animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  }, [id, onClose]);

  // Fallback to info icon for invalid types
  const Icon = icons[type] ?? icons.info;

  const mods = {
    [styles[type]]: true,
    [styles.closing]: isClosing,
  };

  const hasProgress = duration > 0;

  return (
    <div
      className={classNames(styles.toast, mods, [className])}
      role="alert"
      aria-live="assertive"
      data-testid="toast"
      data-type={type}
      onMouseEnter={hasProgress ? pauseTimer : undefined}
      onMouseLeave={hasProgress ? resumeTimer : undefined}
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
        onClick={handleClose}
        aria-label="Close notification"
        data-testid="toast-close"
      >
        <X size={TOAST_CONSTANTS.CLOSE_ICON_SIZE} />
      </button>

      {/* Progress Bar */}
      {hasProgress && !isClosing && (
        <div
          className={styles.progressBar}
          style={{
            animationDuration: `${remainingTime}ms`,
            opacity: isPaused ? 0.5 : 0.3,
          }}
          data-testid="toast-progress"
        />
      )}

      {/* Pause Indicator */}
      {hasProgress && isPaused && (
        <div className={styles.pauseIndicator} aria-hidden="true">
          <Pause size={12} />
        </div>
      )}
    </div>
  );
});

Toast.displayName = 'Toast';
