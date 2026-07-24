// ============================================
// Modal Root Component (основная логика)
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { focusTrap, getFirstFocusableElement } from '@/shared/lib/utils/focusTrap';
import { Overlay } from '@/shared/ui/Overlay';
import { Portal } from '@/shared/ui/Portal';
import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ModalRootProps } from '../../model/types';
import styles from './ModalRoot.module.scss';

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
    scroll = 'paper',
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
    onEscapeKeyDown,
    onPointerDownOutside,
    finalFocusRef,
    defaultOpen,
    forceMount,
    modal = true,
  } = props;

  // Controlled vs uncontrolled mode
  const isControlled = isOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const effectiveIsOpen = isControlled ? isOpen : internalOpen;

  // Non-modal mode отключает overlay, focus trap и scroll lock
  const effectiveOverlay = modal && overlay;
  const effectiveTrapFocus = modal && trapFocus;
  const effectiveBlockScroll = modal && blockScroll;

  // ForceMount: isClosing state for exit animation
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  // When effectiveIsOpen transitions from true → false and forceMount is true,
  // keep mounted to play close animation, then unmount after duration
  const prevIsOpenRef = useRef(effectiveIsOpen);
  useEffect(() => {
    if (prevIsOpenRef.current && !effectiveIsOpen && forceMount) {
      setIsClosing(true);
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsClosing(false);
        closeTimeoutRef.current = null;
      }, 700); // matches $animation-duration (0.7s)
    }
    prevIsOpenRef.current = effectiveIsOpen;

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [effectiveIsOpen, forceMount]);

  const handleClose = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    onClose();
  }, [isControlled, onClose]);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const focusTimeoutRef = useRef<number | null>(null);
  const untrapFocusRef = useRef<(() => void) | null>(null);
  const wasOpenedRef = useRef<boolean>(false);
  const onPointerDownOutsideRef = useRef(onPointerDownOutside);
  onPointerDownOutsideRef.current = onPointerDownOutside;
  const titleId = useId();
  const subtitleId = useId();

  // Блокировка скролла body с поддержкой множественных модалок (SSR-safe)
  useLayoutEffect(() => {
    // SSR guard — useLayoutEffect не должен выполняться на сервере
    if (typeof window === 'undefined') return;
    if (!effectiveBlockScroll) return;

    if (effectiveIsOpen) {
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
  }, [effectiveIsOpen, effectiveBlockScroll]);

  // Проверка canClose (useCallback для оптимизации)
  const canCloseModal = useCallback((): boolean => {
    if (typeof canClose === 'boolean') return canClose;
    return canClose();
  }, [canClose]);

  // Обработчик ESC с onEscapeKeyDown и handleClose (useCallback для оптимизации)
  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      // Call onEscapeKeyDown — user может вызвать preventDefault чтобы заблокировать закрытие
      onEscapeKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (canCloseModal()) {
        handleClose();
      }
    },
    [canCloseModal, handleClose, onEscapeKeyDown]
  );

  // Закрытие по ESC (с проверкой defaultPrevented)
  useEffect(() => {
    if (!effectiveIsOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        handleEscKey(e);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [effectiveIsOpen, closeOnEsc, handleEscKey]);

  // Focus Trap (с проверкой modalRef.current)
  useEffect(() => {
    if (!effectiveIsOpen || !effectiveTrapFocus || !modalRef.current) return;

    untrapFocusRef.current = focusTrap(modalRef.current);

    return () => {
      untrapFocusRef.current?.();
      untrapFocusRef.current = null;
    };
  }, [effectiveIsOpen, effectiveTrapFocus]);

  // Auto-focus и управление фокусом (с очисткой таймера)
  useEffect(() => {
    // Очистка предыдущего таймера
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    // Capture ref values for safe access in cleanup closure
    const previousElement = previousActiveElement.current;
    const finalFocusElement = finalFocusRef?.current;

    if (effectiveIsOpen) {
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
      if (wasOpenedRef.current) {
        if (restoreFocus) {
          if (finalFocusElement) {
            // finalFocusRef переопределяет стандартный restoreFocus
            finalFocusElement.focus();
          } else if (previousElement) {
            previousElement.focus();
          }
        }
        onClosed?.();
        wasOpenedRef.current = false;
      }
    };
  }, [effectiveIsOpen, autoFocus, restoreFocus, onOpened, onClosed, finalFocusRef]);

  // Обработка клика на overlay с onPointerDownOutside (useCallback для оптимизации)
  const handleOverlayClick = useCallback(() => {
    // Создаём событие для onPointerDownOutside
    const event = new PointerEvent('pointerdown', { cancelable: true });
    onPointerDownOutsideRef.current?.(event);
    if (event.defaultPrevented) return;

    if (closeOnOverlayClick && canCloseModal()) {
      handleClose();
    }
  }, [closeOnOverlayClick, canCloseModal, handleClose]);

  // Вычисляем className напрямую (classNames очень быстрая)
  const modalClassName = classNames(
    styles.modal,
    styles[`modal--${size}`],
    scroll === 'body' && styles.modalBody,
    isClosing && styles.closing,
    disableAnimation && styles.noAnimation,
    className
  );

  // data-state для accessibility и тестирования
  const dataState = effectiveIsOpen ? 'open' : 'closed';

  // forceMount: при закрытии модалка остаётся в DOM для exit animation
  if (!effectiveIsOpen && !(isClosing && forceMount)) return null;

  return (
    <Portal>
      {effectiveOverlay && (
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
          aria-modal={modal ? 'true' : 'false'}
          aria-labelledby={titleId}
          aria-describedby={subtitle ? subtitleId : undefined}
          tabIndex={0}
          data-state={dataState}
          {...(scroll === 'body' ? { 'data-scroll-body': '' } : {})}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

ModalRoot.displayName = 'ModalRoot';

export default ModalRoot;
