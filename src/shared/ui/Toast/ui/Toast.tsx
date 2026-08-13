// ============================================
// Toast Component (Shared Layer - Senior+ 2026)
// ============================================

import { classNames } from '@/shared/lib/utils';
import { X, Pause } from 'lucide-react';
import { memo, useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Icon } from '@/shared/ui/Icon';
import { Spinner } from '@/shared/ui/Spinner';
import { TOAST_CONSTANTS, TOAST_TYPES, TOAST_ICONS } from '../model/constants';
import type { SettledToastType, ToastProps } from '../model/types';
import { useSwipeToDismiss } from '../lib/hooks/useSwipeToDismiss';
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
 * - Focus management: autofocus close button (never steals focus), restore on unmount
 * - Escape-key dismissal
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
    action,
    forceClose = false,
    onClose,
  } = props;

  const [isClosing, setIsClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Guard against double onClose: setTimeout (testability/SSR) and onAnimationEnd (production)
  // both race to close; whichever fires first wins, the other is ignored.
  const closeTriggeredRef = useRef(false);
  // ============================================
  // A11y — focus management (TOAST-09)
  // ============================================
  const toastRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Element focused before this toast took focus (document.body when nothing was focused).
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Fallback to setTimeout for environments where animationEnd might not fire (tests, SSR)
    setTimeout(() => {
      if (!closeTriggeredRef.current) {
        closeTriggeredRef.current = true;
        onClose(id);
      }
    }, TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
  }, [id, onClose]);

  // Swipe-to-dismiss gesture handling (extracted to hook)
  const {
    isDragging,
    dragOffset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useSwipeToDismiss(handleClose, isClosing);

  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      // In production browsers, this provides more reliable timing than setTimeout
      if (e.animationName.includes('slideOutRight') && isClosing && !closeTriggeredRef.current) {
        closeTriggeredRef.current = true;
        onClose(id);
      }
    },
    [isClosing, id, onClose]
  );

  // Trigger exit animation when forceClose is set
  useEffect(() => {
    if (forceClose && !isClosing) {
      // Управляемый ответ на проп; handleClose идемпотентен (guards: isClosing + closeTriggeredRef)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleClose();
    }
  }, [forceClose, isClosing, handleClose]);

  // ============================================
  // A11y — autofocus + focus restore (TOAST-09)
  // ============================================

  // Autofocus the close button on mount, but ONLY when nothing else has focus —
  // a toast must never steal focus from the user's active context.
  useLayoutEffect(() => {
    if (document.activeElement === document.body) {
      previousFocusRef.current = document.body;
      closeButtonRef.current?.focus();
    }
  }, []);

  // Restore focus on unmount only if focus is still inside the toast. If the user
  // moved focus elsewhere during auto-close, the previous element is left untouched.
  useLayoutEffect(() => {
    const toastNode = toastRef.current;
    return () => {
      if (previousFocusRef.current && toastNode?.contains(document.activeElement)) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Document-level Escape dismisses the toast (idempotent once closing has started).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isClosing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isClosing, handleClose]);

  // Loading toast uses Spinner instead of icon, no close button, no progress bar.
  const isLoading = type === 'loading';
  const settledType: SettledToastType = isLoading ? 'info' : (type ?? 'info');

  // Валидация type
  if (process.env.NODE_ENV === 'development' && !TOAST_TYPES.includes(settledType)) {
    // eslint-disable-next-line no-console
    console.warn(`Toast: невалидный тип "${type}". Доступные: ${TOAST_TYPES.join(', ')}`);
  }

  // Timer logic with pause support
  const startTimer = useCallback(() => {
    if (duration <= 0) return;

    timerRef.current = setTimeout(() => {
      setIsClosing(true);
      // Use setTimeout for auto-close to match test expectations
      // onAnimationEnd is used for manual close only
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
  }, [duration, startTimer, forceClose]);

  // Fallback to info icon for invalid types
  const TypeIcon = TOAST_ICONS[settledType] ?? TOAST_ICONS.info;

  const mods = {
    [styles[type]]: true,
    [styles.closing]: isClosing,
    [styles.dragging]: isDragging,
  };

  const showProgress = duration > 0 && !isClosing;

  return (
    <div
      ref={toastRef}
      className={classNames(styles.toast, mods, [className])}
      role="alert"
      aria-live="assertive"
      data-testid="toast"
      data-type={type}
      onMouseEnter={duration > 0 ? pauseTimer : undefined}
      onMouseLeave={duration > 0 ? resumeTimer : undefined}
      onAnimationEnd={handleAnimationEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      // style is omitted entirely at 0 → byte-identical DOM when not dragging
      style={dragOffset !== 0 ? { transform: `translateX(${dragOffset}px)` } : undefined}
    >
      {isLoading ? (
        <>
          <div className={styles.icon} aria-hidden="true">
            <Spinner label={message} />
          </div>
          <Paragraph as="span" id={`toast-message-${id}`}>
            {message}
          </Paragraph>
        </>
      ) : (
        <>
          <div className={styles.icon} aria-hidden="true">
            <Icon name={TypeIcon} size={TOAST_CONSTANTS.ICON_SIZE} color="inherit" decorative />
          </div>
          <Paragraph as="span" id={`toast-message-${id}`}>
            {message}
          </Paragraph>
        </>
      )}

      {/* Action Button */}
      {action && !isLoading && (
        <button
          type="button"
          className={classNames(styles.action, styles[action.variant ?? 'secondary'])}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}

      {/* Close button — hidden for loading toasts */}
      {!isLoading && (
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close notification"
          data-testid="toast-close"
        >
          <Icon name={X} size={TOAST_CONSTANTS.CLOSE_ICON_SIZE} color="inherit" decorative />
        </button>
      )}

      {/* Progress Bar — hidden for loading toasts */}
      {showProgress && !isLoading && (
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
          <Icon name={Pause} size={12} color="inherit" decorative />
        </div>
      )}
    </div>
  );
});

Toast.displayName = 'Toast';
