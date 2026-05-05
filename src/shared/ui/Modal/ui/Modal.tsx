// ============================================
// Modal Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { Overlay } from '@/shared/ui/Overlay';
import { Portal } from '@/shared/ui/Portal';
import { X } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';
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
    className = '',
    showCloseButton = true,
    ariaLabel = 'Modal dialog',
    disableAnimation = false,
  } = props;

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Сохраняем фокус до открытия
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Фокус на модалку для доступности
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      // Возвращаем фокус
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Обработка клика на overlay
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
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
        <Overlay onClick={handleOverlayClick} blur={false} dark={true} className={styles.overlay} />
      )}

      <div className={styles.modalContainer} role="presentation">
        <div
          ref={modalRef}
          className={modalClassName}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-label={ariaLabel}
          tabIndex={-1}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <header className={styles.header}>
              <div className={styles.headerContent}>
                {title && (
                  <h2 id="modal-title" className={styles.title}>
                    {title}
                  </h2>
                )}
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
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
