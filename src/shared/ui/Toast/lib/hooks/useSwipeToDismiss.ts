// ============================================
// useSwipeToDismiss Hook
// ============================================

import { useCallback, useRef, useState } from 'react';
import { TOAST_CONSTANTS } from '../../model/constants';

export interface UseSwipeToDismissReturn {
  isDragging: boolean;
  dragOffset: number;
  handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerUp: () => void;
  handlePointerCancel: () => void;
}

/**
 * Hook for swipe-to-dismiss gesture handling.
 * Encapsulates all pointer event logic for toast dismissal.
 *
 * @param handleClose - Callback to trigger toast close
 * @param isClosing - Whether the toast is already closing
 *
 * @example
 * ```tsx
 * function Toast({ handleClose, isClosing }) {
 *   const {
 *     isDragging,
 *     dragOffset,
 *     handlePointerDown,
 *     handlePointerMove,
 *     handlePointerUp,
 *     handlePointerCancel,
 *   } = useSwipeToDismiss(handleClose, isClosing);
 *
 *   return (
 *     <div
 *       onPointerDown={handlePointerDown}
 *       onPointerMove={handlePointerMove}
 *       onPointerUp={handlePointerUp}
 *       onPointerCancel={handlePointerCancel}
 *       style={dragOffset !== 0 ? { transform: `translateX(${dragOffset}px)` } : undefined}
 *     >
 *       {/* toast content *}{/*}
 *     </div>
 *   );
 * }
 * ```
 */
export const useSwipeToDismiss = (
  handleClose: () => void,
  isClosing: boolean
): UseSwipeToDismissReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Swipe-to-dismiss gesture state (refs — no re-render per pointer move)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragAxisRef = useRef<'horizontal' | 'vertical' | null>(null);
  // Mirror of dragOffset so handlePointerUp reads the latest value without
  // depending on dragOffset in its deps (deps stay [handleClose]).
  const dragOffsetRef = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isClosing || e.button !== 0) return;

      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragAxisRef.current = null;
      dragOffsetRef.current = 0;
      setIsDragging(true);

      // jsdom does not implement setPointerCapture (calling it would throw a
      // TypeError); guard so tests and older environments stay safe.
      const target = e.currentTarget;
      if (typeof target.setPointerCapture === 'function' && e.pointerId !== undefined) {
        target.setPointerCapture(e.pointerId);
      }
    },
    [isClosing]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    if (dragAxisRef.current === 'vertical') return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    // First movement decides the axis: vertical scroll is never intercepted.
    if (dragAxisRef.current === null) {
      if (Math.abs(dy) > Math.abs(dx)) {
        dragAxisRef.current = 'vertical';
        dragStartRef.current = null;
        dragOffsetRef.current = 0;
        setIsDragging(false);
        setDragOffset(0);
        return;
      }
      dragAxisRef.current = 'horizontal';
    }

    // Follow the finger leftward only (rightward swipes clamp to 0 → spring back).
    const next = Math.min(0, dx);
    dragOffsetRef.current = next;
    setDragOffset(next);
  }, []);

  const handlePointerUp = useCallback(() => {
    const wasDragging = dragStartRef.current !== null;
    dragStartRef.current = null;
    dragAxisRef.current = null;

    if (!wasDragging) return;

    setIsDragging(false);
    const offset = dragOffsetRef.current;
    if (offset < -TOAST_CONSTANTS.SWIPE_THRESHOLD) {
      handleClose();
    } else {
      setDragOffset(0);
    }
  }, [handleClose]);

  const handlePointerCancel = useCallback(() => {
    dragStartRef.current = null;
    dragAxisRef.current = null;
    dragOffsetRef.current = 0;
    setIsDragging(false);
    setDragOffset(0);
  }, []);

  return {
    isDragging,
    dragOffset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
};
