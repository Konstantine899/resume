import { flushSync } from 'react-dom';
import { classNames } from '@/shared/lib/utils/classNames';
import { focusTrap, getFirstFocusableElement } from '@/shared/lib/utils/focusTrap';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { MODAL_CLOSE_DURATION_MS, MODAL_Z_BASE } from '../../model/constants';
import {
  getLayerManagerSnapshot,
  isTopLayer,
  layerIndex,
  registerLayer,
  subscribeLayerManager,
  unregisterLayer,
} from '../layerManager';
import type { ModalRootProps } from '../../model/types';
import styles from '../../ui/ModalRoot/ModalRoot.module.scss';

// Global ref to track number of open modals for scroll lock
const openCountRef = { current: 0 };
// Original body overflow captured on FIRST lock (0→1), restored on last unlock
// (1→0). Saved at module level so stacked modals share it (M8).
const previousBodyOverflowRef = { current: '' };

/**
 * Read the current `prefers-reduced-motion` preference.
 * @description The stylesheet already neutralizes the close animation
 * (`.modal { animation: none }` in ModalRoot.module.scss), but the hook must
 * ALSO skip the JS exit delay — otherwise unmount would still be deferred by
 * `MODAL_CLOSE_DURATION_MS` while nothing is animating.
 * Evaluated once per close, not subscribed (minimal, read-only check).
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reset internal modal open counter.
 * @description Used for test cleanup only. Call between tests to reset scroll lock state.
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
  previousBodyOverflowRef.current = '';
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
  // Generation of the currently armed (or just cancelled) close. Every arm/cancel
  // increments it, so a stale timeout callback becomes a no-op (reopen race M6).
  const closeGenerationRef = useRef(0);
  // Ref-only mirror of `isClosing`: survives the effect cleanup (which clears the
  // timer) so a StrictMode re-run knows a close is still in flight and re-arms.
  const closePendingRef = useRef(false);

  const clearCloseTimer = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  /** Cancel a pending exit-delay close (reopen while `.closing` is active). */
  const cancelPendingClose = useCallback(() => {
    closeGenerationRef.current += 1; // invalidate any queued stale callback
    clearCloseTimer();
    closePendingRef.current = false;
    setIsClosing(false);
  }, [clearCloseTimer]);

  /** Arm the exit delay: `.closing` applies until the timer completes the close. */
  const armClose = useCallback(() => {
    const generation = ++closeGenerationRef.current;
    closePendingRef.current = true;
    // Use flushSync to avoid cascading renders warning
    flushSync(() => {
      setIsClosing(true);
    });
    closeTimeoutRef.current = window.setTimeout(() => {
      if (generation !== closeGenerationRef.current) return; // stale → no-op
      closeTimeoutRef.current = null;
      closePendingRef.current = false;
      setIsClosing(false);
    }, MODAL_CLOSE_DURATION_MS);
  }, []);

  const prevIsOpenRef = useRef(effectiveIsOpen);
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = effectiveIsOpen;

    if (effectiveIsOpen) {
      // Re-entered during the exit delay → cancel the pending close, otherwise
      // the reopened dialog would keep `.closing` + pointer-events:none forever.
      if (closePendingRef.current) cancelPendingClose();
    } else if (!forceMount) {
      // Node unmounts immediately without forceMount — no exit delay to track.
      if (closePendingRef.current) cancelPendingClose();
    } else if (closePendingRef.current) {
      // Close already in flight; the previous cleanup cleared its timer
      // (StrictMode double-invoke / dep change) — re-arm with a fresh generation
      // so exactly one callback can ever complete the close.
      if (closeTimeoutRef.current === null) armClose();
    } else if (wasOpen && !disableAnimation && !prefersReducedMotion()) {
      armClose(); // fresh close enters the exit delay
    }

    return () => {
      // Clears the timer on every re-run and on unmount. `closePendingRef`
      // deliberately survives, so the next setup can re-arm if needed.
      clearCloseTimer();
    };
  }, [
    effectiveIsOpen,
    forceMount,
    disableAnimation,
    cancelPendingClose,
    armClose,
    clearCloseTimer,
  ]);

  const handleClose = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    onClose();
  }, [isControlled, onClose]);

  const Tag = component || 'div';
  const modalRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const untrapFocusRef = useRef<(() => void) | null>(null);
  const wasOpenedRef = useRef<boolean>(false);
  // Whether the previous render (of the focus effect) had the dialog open.
  const prevIsOpenForFocusRef = useRef(effectiveIsOpen);
  // Generation of the pending open-focus microtask. Every open/cleanup
  // increments it, so a stale focus task becomes a no-op (M6).
  const focusGenerationRef = useRef(0);
  const onPointerDownOutsideRef = useRef(onPointerDownOutside);
  const titleId = useId();
  const subtitleId = useId();

  // Latest-callback refs: the focus/lifecycle effect depends ONLY on the
  // presence state, so a callback identity change while open must NOT fire
  // onClosed (M6), and finalFocusRef/restoreFocus are read fresh (M13).
  const onOpenedRef = useRef(onOpened);
  const onClosedRef = useRef(onClosed);
  const finalFocusRefLatest = useRef(finalFocusRef);
  const initialFocusRefLatest = useRef(initialFocusRef);
  const autoFocusRef = useRef(autoFocus);
  const restoreFocusRef = useRef(restoreFocus);

  useEffect(() => {
    onOpenedRef.current = onOpened;
    onClosedRef.current = onClosed;
    finalFocusRefLatest.current = finalFocusRef;
    initialFocusRefLatest.current = initialFocusRef;
    autoFocusRef.current = autoFocus;
    restoreFocusRef.current = restoreFocus;
  }, [onOpened, onClosed, finalFocusRef, initialFocusRef, autoFocus, restoreFocus]);

  // Update ref in effect, not during render
  useEffect(() => {
    onPointerDownOutsideRef.current = onPointerDownOutside;
  }, [onPointerDownOutside]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!effectiveBlockScroll) return;

    // Only acquire when actually open. The cleanup decrements ONLY when this
    // effect acquired — a closed-root mount must not drive the count negative
    // (M8).
    const acquired = effectiveIsOpen;

    if (acquired) {
      openCountRef.current++;
      if (openCountRef.current === 1) {
        previousBodyOverflowRef.current = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      if (!acquired) return;
      openCountRef.current--;
      if (openCountRef.current === 0) {
        document.body.style.overflow = previousBodyOverflowRef.current;
        previousBodyOverflowRef.current = '';
      }
    };
  }, [effectiveIsOpen, effectiveBlockScroll]);

  // === Layer management (M7) ===
  // Each open modal registers a layer in the shared stack. Only the TOPMOST
  // layer owns Escape/focus containment; lower layers are inert + aria-hidden
  // (ModalRoot wires that). z-index increases per layer so a newer overlay
  // never sits below an older dialog.
  //
  // `useId` provides a stable, render-safe layer key (never read via ref and
  // never setState-in-effect — satisfies react-hooks/refs + set-state rules).
  // Register/unregister are pure side effects on the module store.
  const layerId = useId();
  const layerVersion = useSyncExternalStore(subscribeLayerManager, getLayerManagerSnapshot);

  useEffect(() => {
    if (!effectiveIsOpen) {
      unregisterLayer(layerId);
      return;
    }
    registerLayer(layerId);
    return () => {
      // StrictMode double-invoke: register → cleanup → re-register. The
      // cleanup unregisters; the re-register re-adds the same stable id.
      unregisterLayer(layerId);
    };
  }, [effectiveIsOpen, layerId]);

  const myLayerIndex = layerIndex(layerId);
  const isTop = isTopLayer(layerId);
  void layerVersion; // re-render hook: topmost changes propagate to consumers
  // z-index pair for this layer: layer 0 uses CSS tokens (undefined → no
  // inline override), stacked layers get MODAL_Z_BASE + index*2 (+1 dialog).
  const overlayZIndex = myLayerIndex > 0 ? MODAL_Z_BASE + myLayerIndex * 2 : undefined;
  const modalZIndex = myLayerIndex > 0 ? MODAL_Z_BASE + myLayerIndex * 2 + 1 : undefined;

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
    // Only the TOPMOST layer may dismiss via Escape (M7) — for lower layers
    // this listener is a no-op, so stacked Escape closes only the top dialog.
    if (!effectiveIsOpen || !closeOnEsc || !isTop) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        handleEscKey(e);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [effectiveIsOpen, closeOnEsc, handleEscKey, isTop]);

  useEffect(() => {
    if (!effectiveIsOpen || !effectiveTrapFocus || !modalRef.current) return;

    // Only the TOPMOST layer owns focus containment (M7). When a layer's
    // first render is about to become top (layer effect runs after), the
    // version bump re-runs this effect.
    if (!isTop) return;

    untrapFocusRef.current = focusTrap(modalRef.current);

    return () => {
      untrapFocusRef.current?.();
      untrapFocusRef.current = null;
    };
  }, [effectiveIsOpen, effectiveTrapFocus, isTop]);

  useEffect(() => {
    if (!effectiveIsOpen) return;

    // OPEN (or re-open): capture the real previous active element here,
    // not in effect-setup of every dep change (M13).
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    wasOpenedRef.current = true;
    focusGenerationRef.current += 1;
    const generation = focusGenerationRef.current;

    // Use queueMicrotask instead of setTimeout(0) for better timing. In
    // StrictMode the first setup is cleaned up before the task runs and the
    // second setup re-arms it with a fresh generation — exactly one task
    // ever fires (M6).
    queueMicrotask(() => {
      if (generation !== focusGenerationRef.current) return; // stale
      if (!wasOpenedRef.current) return; // closed before the task ran
      if (autoFocusRef.current) {
        if (initialFocusRefLatest.current?.current) {
          initialFocusRefLatest.current.current.focus();
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

      onOpenedRef.current?.();
    });

    return () => {
      // Invalidate any pending open-focus microtask (close/unmount/StrictMode).
      focusGenerationRef.current += 1;
    };
  }, [effectiveIsOpen]);

  useEffect(() => {
    const wasOpen = prevIsOpenForFocusRef.current;
    prevIsOpenForFocusRef.current = effectiveIsOpen;

    // Only a REAL open→closed transition restores focus and fires onClosed
    // (StrictMode double-invoke and callback re-renders must not).
    if (wasOpen && !effectiveIsOpen) {
      // finalFocusRef wins even when restoreFocus is false (M13).
      const finalFocusElement = finalFocusRefLatest.current?.current;
      const previousElement = previousActiveElement.current;
      const target = finalFocusElement ?? (restoreFocusRef.current ? previousElement : null);

      if (target?.isConnected && typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
      wasOpenedRef.current = false;
      onClosedRef.current?.();
    }
  }, [effectiveIsOpen]);

  const handleOverlayPointerDown = useCallback(
    // Real pointerdown event from Overlay (M10): consumers receive the
    // ORIGINAL event with the correct target/coords — no synthetic event.
    (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDownOutsideRef.current?.(event);
      if (event.defaultPrevented) return;

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
    isClosing,
    effectiveIsOpen,
    effectiveOverlay,
    handleOverlayPointerDown,
    modalClassName,
    dataState,
    forceMount,
    effectiveModal: modal,
    isTop,
    overlayZIndex,
    modalZIndex,
  };
}
