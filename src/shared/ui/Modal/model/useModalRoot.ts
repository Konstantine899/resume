import { flushSync } from 'react-dom';
import { classNames } from '@/shared/lib/utils/classNames';
import { focusTrap, getFirstFocusableElement } from '@/shared/lib/utils/focusTrap';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ModalRootProps } from './types';
import { MODAL_CONSTANTS } from './constants';
import styles from '../ui/ModalRoot/ModalRoot.module.scss';

// Global ref to track number of open modals for scroll lock
const openCountRef = { current: 0 };
// Stack of currently-open modal root elements (topmost = last). Used so only the
// topmost modal handles ESC in stacked scenarios.
const modalStack: HTMLElement[] = [];

/**
 * Reset internal modal open counter and stack.
 * @description Used for test cleanup only. Call between tests to reset scroll lock and stack state.
 * @example
 * ```tsx
 * afterEach(() => {
 *   resetOpenCount();
 *   document.body.style.overflow = '';
 * });
 * ```
 */
export function resetOpenCount(): void {
  openCountRef.current = 0;
  modalStack.length = 0;
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
    title,
    subtitle,
    ariaLabel,
    titleId: titleIdProp,
    subtitleId: subtitleIdProp,
  } = props;

  const isControlled = isOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const effectiveIsOpen = isControlled ? isOpen : internalOpen;

  const effectiveOverlay = modal && overlay;
  const effectiveTrapFocus = modal && trapFocus;
  const effectiveBlockScroll = modal && blockScroll;
  const effectiveModal = modal;

  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const prevIsOpenRef = useRef(effectiveIsOpen);
  useEffect(() => {
    if (prevIsOpenRef.current && !effectiveIsOpen && forceMount) {
      // Use flushSync to avoid cascading renders warning
      flushSync(() => {
        setIsClosing(true);
      });
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsClosing(false);
        closeTimeoutRef.current = null;
      }, MODAL_CONSTANTS.CLOSE_ANIMATION_MS);
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
  const onOpenedRef = useRef(onOpened);
  const onClosedRef = useRef(onClosed);
  // Keep latest callbacks in refs so the focus effect doesn't re-run on every render.
  useEffect(() => {
    onOpenedRef.current = onOpened;
    onClosedRef.current = onClosed;
  }, [onOpened, onClosed]);

  const generatedTitleId = useId();
  const generatedSubtitleId = useId();
  const titleId = titleIdProp ?? generatedTitleId;
  const subtitleId = subtitleIdProp ?? generatedSubtitleId;

  // Update ref in effect, not during render
  useEffect(() => {
    onPointerDownOutsideRef.current = onPointerDownOutside;
  }, [onPointerDownOutside]);

  // R3-3: scroll lock must be perfectly symmetric — lock on open, unlock on close.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!effectiveBlockScroll) return;

    let didLock = false;
    if (effectiveIsOpen) {
      openCountRef.current++;
      didLock = true;
      if (openCountRef.current === 1) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      if (didLock) {
        openCountRef.current--;
        if (openCountRef.current === 0) {
          document.body.style.overflow = '';
        }
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

      // R4-13: only the topmost modal reacts to ESC in a stacked scenario.
      if (
        effectiveModal &&
        modalStack.length > 0 &&
        modalStack[modalStack.length - 1] !== modalRef.current
      ) {
        return;
      }

      if (canCloseModal()) {
        handleClose();
      }
    },
    [canCloseModal, handleClose, onEscapeKeyDown, effectiveModal]
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

  // R4-11: keep the trap active during the forceMount close animation too.
  useEffect(() => {
    if ((!effectiveIsOpen && !isClosing) || !effectiveTrapFocus || !modalRef.current) return;

    untrapFocusRef.current = focusTrap(modalRef.current);

    return () => {
      untrapFocusRef.current?.();
      untrapFocusRef.current = null;
    };
  }, [effectiveIsOpen, isClosing, effectiveTrapFocus]);

  // R3-4/R3-5/R4-12: focus management, restore, and open-stack bookkeeping.
  useEffect(() => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    // Capture node refs once per effect run so the cleanup uses the correct node.
    const modalEl = modalRef.current;
    const finalFocusElement = finalFocusRef?.current;

    if (effectiveIsOpen) {
      wasOpenedRef.current = true;
      // Capture the trigger BEFORE we move focus (used on close).
      previousActiveElement.current = (document.activeElement as HTMLElement) ?? null;

      if (effectiveModal && modalRef.current && !modalStack.includes(modalRef.current)) {
        modalStack.push(modalRef.current);
      }

      // Use queueMicrotask instead of setTimeout(0) for better timing
      queueMicrotask(() => {
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
        } else if (effectiveModal && modalRef.current) {
          // autoFocus disabled: still move focus into the dialog for modal mode.
          modalRef.current.focus();
        }

        onOpenedRef.current?.();
      });
    }

    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }

      if (wasOpenedRef.current) {
        // R4-12: restore focus only in modal mode.
        if (effectiveModal && restoreFocus) {
          const target = finalFocusElement ?? previousActiveElement.current;
          target?.focus?.();
        }
        onClosedRef.current?.();
        wasOpenedRef.current = false;

        if (effectiveModal && modalEl) {
          const idx = modalStack.indexOf(modalEl);
          if (idx !== -1) modalStack.splice(idx, 1);
        }
      }
    };
  }, [effectiveIsOpen, effectiveModal, autoFocus, restoreFocus, initialFocusRef, finalFocusRef]);

  // R2-10: forward the REAL DOM event so consumers can preventDefault() correctly.
  const handleOverlayClick = useCallback(
    (event?: MouseEvent | PointerEvent) => {
      if (event) {
        onPointerDownOutsideRef.current?.(event as PointerEvent);
        if (event.defaultPrevented) return;
      }
      if (closeOnOverlayClick && canCloseModal()) {
        handleClose();
      }
    },
    [closeOnOverlayClick, canCloseModal, handleClose]
  );

  const modalClassName = useMemo(
    () =>
      classNames(
        styles.modal,
        styles[`modal--${size}`],
        scroll === 'body' && styles.modalBody,
        isClosing && styles.closing,
        disableAnimation && styles.noAnimation,
        className
      ),
    [size, scroll, isClosing, disableAnimation, className]
  );

  const dataState = effectiveIsOpen ? 'open' : 'closed';

  return {
    Tag,
    modalRef,
    titleId,
    subtitleId,
    title,
    subtitle,
    ariaLabel,
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
    effectiveModal,
  };
}
