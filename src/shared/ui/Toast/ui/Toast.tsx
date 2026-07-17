// ============================================
// Toast Component (Shared Layer - Senior+ 2026)
// ============================================

import { classNames } from '@/shared/lib/utils';
import { X, Pause } from 'lucide-react';
import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { TOAST_CONSTANTS, TOAST_TYPES, TOAST_ICONS } from '../model/constants';
import type { ToastProps } from '../model/types';
import styles from './Toast.module.scss';

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Валидация type
  if (process.env.NODE_ENV === 'development' && !TOAST_TYPES.includes(type)) {
    // eslint-disable-next-line no-console
    console.warn(`Toast: невалидный тип "${type}". Доступные: ${TOAST_TYPES.join(', ')}`);
  }

  // Timer logic with pause support
  const startTimer = useCallback(() => {
    if (duration <= 0) return;

    timerRef.current = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onClose(id), TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
    }, duration);
  }, [duration, id, onClose]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current && duration > 0) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setIsPaused(true);
    }
  }, [duration]);

  const resumeTimer = useCallback(() => {
    if (duration > 0) {
      setIsPaused(false);
      startTimer();
    }
  }, [duration, startTimer]);

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
    setTimeout(() => onClose(id), TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
  }, [id, onClose]);

  // Fallback to info icon for invalid types
  const Icon = TOAST_ICONS[type] ?? TOAST_ICONS.info;

  const mods = {
    [styles[type]]: true,
    [styles.closing]: isClosing,
  };

  const showProgress = duration > 0 && !isClosing;

  return (
    <div
      className={classNames(styles.toast, mods, [className])}
      role="alert"
      aria-live="assertive"
      data-testid="toast"
      data-type={type}
      onMouseEnter={duration > 0 ? pauseTimer : undefined}
      onMouseLeave={duration > 0 ? resumeTimer : undefined}
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
      {showProgress && (
        <div
          className={styles.progressBar}
          style={{
            animationDuration: `${duration}ms`,
            opacity: isPaused ? 0.5 : 0.3,
          }}
          data-testid="toast-progress"
        />
      )}

      {/* Pause Indicator */}
      {isPaused && (
        <div className={styles.pauseIndicator} aria-hidden="true">
          <Pause size={12} />
        </div>
      )}
    </div>
  );
});

Toast.displayName = 'Toast';
