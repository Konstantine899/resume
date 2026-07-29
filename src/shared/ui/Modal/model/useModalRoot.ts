import { classNames } from '@/shared/lib/utils/classNames';
import { focusTrap, getFirstFocusableElement } from '@/shared/lib/utils/focusTrap';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ModalRootProps } from './types';
import styles from '../ui/ModalRoot/ModalRoot.module.scss';

let openCount = 0;

export function resetOpenCount(): void {
  openCount = 0;
}

export function useModalRoot(props: ModalRootProps) {
  const {
    component,
    isOpen,
    onClose,
    size = 'md',
    scroll = 'paper',
    overlay = true,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    blockScroll = true,
    className = '',
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
    initialFocusRef,
    defaultOpen,
    forceMount,
    modal = true,
  } = props;

  const isControlled = isOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const effectiveIsOpen = isControlled ? isOpen : internalOpen;

  const effectiveOverlay = modal && overlay;
  const effectiveTrapFocus = modal && trapFocus;
  const effectiveBlockScroll = modal && blockScroll;

  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const prevIsOpenRef = useRef(effectiveIsOpen);
  useEffect(() => {
    if (prevIsOpenRef.current && !effectiveIsOpen && forceMount) {
      setIsClosing(true);
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsClosing(false);
        closeTimeoutRef.current = null;
      }, 700);
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

  const Tag = component || 'div';
  const modalRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const focusTimeoutRef = useRef<number | null>(null);
  const untrapFocusRef = useRef<(() => void) | null>(null);
  const wasOpenedRef = useRef<boolean>(false);
  const onPointerDownOutsideRef = useRef(onPointerDownOutside);
  onPointerDownOutsideRef.current = onPointerDownOutside;
  const titleId = useId();
  const subtitleId = useId();

  useLayoutEffect(() => {
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

  const canCloseModal = useCallback((): boolean => {
    if (typeof canClose === 'boolean') return canClose;
    return canClose();
  }, [canClose]);

  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      onEscapeKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (canCloseModal()) {
        handleClose();
      }
    },
    [canCloseModal, handleClose, onEscapeKeyDown]
  );

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

  useEffect(() => {
    if (!effectiveIsOpen || !effectiveTrapFocus || !modalRef.current) return;

    untrapFocusRef.current = focusTrap(modalRef.current);

    return () => {
      untrapFocusRef.current?.();
      untrapFocusRef.current = null;
    };
  }, [effectiveIsOpen, effectiveTrapFocus]);

  useEffect(() => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    const previousElement = previousActiveElement.current;
    const finalFocusElement = finalFocusRef?.current;

    if (effectiveIsOpen) {
      wasOpenedRef.current = true;
      previousActiveElement.current = document.activeElement as HTMLElement;

      focusTimeoutRef.current = window.setTimeout(() => {
        if (autoFocus) {
          if (initialFocusRef?.current) {
            initialFocusRef.current.focus();
          } else if (modalRef.current) {
            const firstFocusable = getFirstFocusableElement(modalRef.current);
            if (firstFocusable) {
              firstFocusable.focus();
            } else {
              modalRef.current.focus();
            }
          }
        } else if (modalRef.current) {
          modalRef.current.focus();
        }

        onOpened?.();
      }, 0);
    }

    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }

      if (wasOpenedRef.current) {
        if (restoreFocus) {
          if (finalFocusElement) {
            finalFocusElement.focus();
          } else if (previousElement) {
            previousElement.focus();
          }
        }
        onClosed?.();
        wasOpenedRef.current = false;
      }
    };
  }, [
    effectiveIsOpen,
    autoFocus,
    restoreFocus,
    onOpened,
    onClosed,
    finalFocusRef,
    initialFocusRef,
  ]);

  const handleOverlayClick = useCallback(() => {
    const event = new PointerEvent('pointerdown', { cancelable: true });
    onPointerDownOutsideRef.current?.(event);
    if (event.defaultPrevented) return;

    if (closeOnOverlayClick && canCloseModal()) {
      handleClose();
    }
  }, [closeOnOverlayClick, canCloseModal, handleClose]);

  const modalClassName = classNames(
    styles.modal,
    styles[`modal--${size}`],
    scroll === 'body' && styles.modalBody,
    isClosing && styles.closing,
    disableAnimation && styles.noAnimation,
    className
  );

  const dataState = effectiveIsOpen ? 'open' : 'closed';

  return {
    Tag,
    modalRef,
    titleId,
    subtitleId,
    isClosing,
    effectiveIsOpen,
    effectiveOverlay,
    effectiveTrapFocus,
    effectiveBlockScroll,
    handleClose,
    handleOverlayClick,
    handleEscKey,
    canCloseModal,
    modalClassName,
    dataState,
    forceMount,
    effectiveModal: modal,
  };
}
