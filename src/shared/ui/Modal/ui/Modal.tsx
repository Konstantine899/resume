// ============================================
// Modal Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { focusTrap, getFirstFocusableElement } from '@/shared/lib/utils/focusTrap';
import { Overlay } from '@/shared/ui/Overlay';
import { Portal } from '@/shared/ui/Portal';
import { X } from 'lucide-react';
import { memo, useEffect, useId, useLayoutEffect, useRef } from 'react';
import type { ModalProps } from '../model/types';
import styles from './Modal.module.scss';

export const Modal = memo((props: ModalProps) => {
  const {
    children,
    isOpen,
    onClose,
    title,
    subtitle,
    footer,
    size = 'md',
    overlay = true,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    blockScroll = true,
    className = '',
    showCloseButton = true,
    ariaLabel = 'Modal dialog',
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
  const titleId = useId();
  const isOpenRef = useRef(isOpen);

  // Блокировка скролла body (useLayoutEffect для избежания мигания)
  useLayoutEffect(() => {
    if (!blockScroll || !isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, blockScroll]);

  // Проверка canClose
  const canCloseModal = (): boolean => {
    if (typeof canClose === 'boolean') return canClose;
    return canClose();
  };

  // Обработчик ESC
  const handleEscKey = () => {
    if (canCloseModal()) {
      onClose();
    }
  };

  // Закрытие по ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleEscKey();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, handleEscKey]);

  // Focus Trap
  useEffect(() => {
    if (!isOpen || !trapFocus) return;

    untrapFocusRef.current = focusTrap(modalRef.current);

    return () => {
      untrapFocusRef.current?.();
      untrapFocusRef.current = null;
    };
  }, [isOpen, trapFocus]);

  // Auto-focus и управление фокусом
  useEffect(() => {
    isOpenRef.current = isOpen;

    if (isOpen) {
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
        } else {
          modalRef.current?.focus();
        }

        // Callback после открытия
        onOpened?.();
      }, 0);
    } else {
      // Возвращаем фокус
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }

      // Callback после закрытия
      onClosed?.();
    }

    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, [isOpen, autoFocus, restoreFocus, onOpened, onClosed]);

  // Обработка клика на overlay
  const handleOverlayClick = () => {
    if (closeOnOverlayClick && canCloseModal()) {
      try {
        onClose();
      } catch (error) {
        console.error('Modal onClose error:', error);
      }
    }
  };

  // Обработка клика на кнопку закрытия
  const handleCloseClick = () => {
    if (canCloseModal()) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalClassName = classNames(
    styles.modal,
    styles[size],
    disableAnimation && styles.noAnimation,
    className
  );

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
          aria-labelledby={title ? titleId : undefined}
          aria-label={ariaLabel}
          tabIndex={-1}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <header className={styles.header}>
              {title && (
                <div className={styles.headerContent}>
                  <h2 id={titleId} className={styles.title}>
                    {title}
                  </h2>
                  {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
              )}

              {showCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={handleCloseClick}
                  aria-label="Закрыть модальное окно"
                >
                  <X size={20} />
                </button>
              )}
            </header>
          )}

          {/* Content */}
          <div className={styles.content}>{children}</div>

          {/* Footer */}
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      </div>
    </Portal>
  );
});

Modal.displayName = 'Modal';

export default Modal;
