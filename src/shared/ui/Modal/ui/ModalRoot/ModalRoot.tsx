// ============================================
// Modal Root Component (основная логика)
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { focusTrap, getFirstFocusableElement } from '@/shared/lib/utils/focusTrap';
import { Overlay } from '@/shared/ui/Overlay';
import { Portal } from '@/shared/ui/Portal';
import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react';
import type { ModalRootProps } from '../../model/types';
import styles from '../Modal/Modal.module.scss';

// Global counter for multiple modals scroll blocking (используем useRef для атомарности и SSR safety)
let openCount = 0;

/** Reset openCount — useful for test isolation to prevent state leakage between tests */
// eslint-disable-next-line react-refresh/only-export-components
export function resetOpenCount(): void {
  openCount = 0;
}

export const ModalRoot = memo((props: ModalRootProps) => {
  const {
    children,
    isOpen,
    onClose,
    size = 'md',
    overlay = true,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    blockScroll = true,
    className = '',
    subtitle,
    disableAnimation = false,
    onOpened,
    onClosed,
    canClose = true,
    autoFocus = true,
    restoreFocus = true,
    trapFocus = true,
  } = props;

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const focusTimeoutRef = useRef<number | null>(null);
  const untrapFocusRef = useRef<(() => void) | null>(null);
  const wasOpenedRef = useRef<boolean>(false);
  const titleId = useId();
  const subtitleId = useId();

  // Блокировка скролла body с поддержкой множественных модалок (SSR-safe)
  useLayoutEffect(() => {
    // SSR guard — useLayoutEffect не должен выполняться на сервере
    if (typeof window === 'undefined') return;
    if (!blockScroll) return;

    if (isOpen) {
      openCount++;
      if (openCount === 1) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      openCount--;
      if (openCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, blockScroll]);

  // Проверка canClose (useCallback для оптимизации)
  const canCloseModal = useCallback((): boolean => {
    if (typeof canClose === 'boolean') return canClose;
    return canClose();
  }, [canClose]);

  // Обработчик ESC (useCallback для оптимизации)
  const handleEscKey = useCallback(() => {
    if (canCloseModal()) {
      onClose();
    }
  }, [canCloseModal, onClose]);

  // Закрытие по ESC (с проверкой defaultPrevented)
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        handleEscKey();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, handleEscKey]);

  // Focus Trap (с проверкой modalRef.current)
  useEffect(() => {
    if (!isOpen || !trapFocus || !modalRef.current) return;

    untrapFocusRef.current = focusTrap(modalRef.current);

    return () => {
      untrapFocusRef.current?.();
      untrapFocusRef.current = null;
    };
  }, [isOpen, trapFocus]);

  // Auto-focus и управление фокусом (с очисткой таймера)
  useEffect(() => {
    // Очистка предыдущего таймера
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    if (isOpen) {
      wasOpenedRef.current = true;
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Фокус на первый интерактивный элемент или на модалку
      focusTimeoutRef.current = window.setTimeout(() => {
        if (autoFocus && modalRef.current) {
          const firstFocusable = getFirstFocusableElement(modalRef.current);
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        } else if (modalRef.current) {
          modalRef.current.focus();
        }

        // Callback после открытия
        onOpened?.();
      }, 0);
    }

    // Cleanup при закрытии или unmount
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }

      // Вызываем onClosed только если модалка была открыта
      if (wasOpenedRef.current && previousActiveElement.current) {
        if (restoreFocus) {
          previousActiveElement.current.focus();
        }
        onClosed?.();
        wasOpenedRef.current = false;
      }
    };
  }, [isOpen, autoFocus, restoreFocus, onOpened, onClosed]);

  // Обработка клика на overlay (useCallback для оптимизации)
  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick && canCloseModal()) {
      onClose();
    }
  }, [closeOnOverlayClick, canCloseModal, onClose]);

  // Вычисляем className напрямую (classNames очень быстрая)
  const modalClassName = classNames(
    styles.modal,
    styles[`modal--${size}`],
    disableAnimation && styles.noAnimation,
    className
  );

  // data-state для accessibility и тестирования
  const dataState = isOpen ? 'open' : 'closed';

  if (!isOpen) return null;

  return (
    <Portal>
      {overlay && (
        <Overlay
          onClick={handleOverlayClick}
          blur={false}
          dark={true}
          className={styles.overlay}
          aria-hidden="true"
        />
      )}

      <div className={styles.modalContainer} role="presentation">
        <div
          ref={modalRef}
          className={modalClassName}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={subtitle ? subtitleId : undefined}
          tabIndex={0}
          data-state={dataState}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

ModalRoot.displayName = 'ModalRoot';

export default ModalRoot;
