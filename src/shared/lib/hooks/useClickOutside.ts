// ============================================
// useClickOutside Hook
// ============================================

import { useCallback, useEffect, useRef, type RefObject } from 'react';

export type ClickOutsideEvent = 'pointerdown' | 'mousedown' | 'click';

export interface UseClickOutsideOptions {
  /** Слушать события только когда true (default: true) */
  enabled?: boolean;
  /** Тип события: pointerdown (default), mousedown, click */
  event?: ClickOutsideEvent;
  /** Дополнительные элементы, клик по которым НЕ считается внешним */
  excludeRefs?: RefObject<HTMLElement | null>[];
}

export interface UseClickOutsideReturn {
  /** Ref для элемента, вне которого клик детектируется */
  ref: RefObject<HTMLElement | null>;
}

/**
 * Хук для детекции клика вне указанного элемента.
 *
 * Подписывается на document-level событие (pointerdown по умолчанию) и
 * вызывает callback, когда цель события не находится внутри elementRef
 * и ни одного из excludeRefs.
 *
 * @param callback - Вызывается при клике вне элемента
 * @param options - Настройки (enabled, event, excludeRefs)
 * @returns Объект с ref для привязки к элементу
 *
 * @example
 * ```tsx
 * const { ref } = useClickOutside(() => setIsOpen(false));
 * return <div ref={ref}>...</div>;
 * ```
 *
 * @example
 * ```tsx
 * // Не закрывать при клике на триггер или сам тултип
 * const { ref } = useClickOutside(close, {
 *   excludeRefs: [triggerRef, tooltipRef],
 * });
 * ```
 */
export const useClickOutside = (
  callback: () => void,
  { enabled = true, event = 'pointerdown', excludeRefs = [] }: UseClickOutsideOptions = {}
): UseClickOutsideReturn => {
  const elementRef = useRef<HTMLElement | null>(null);

  // Ref для колбэка — избегаем пересоздания подписки на каждый рендер,
  // если callback пересоздаётся (паттерн hasAnimatedRef из useScrollAnimation).
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // excludeRefs меняются редко, но сравнение по содержимому массива
  // невозможно — храним ссылку, обновляем эффект по идентичности.
  const excludeRefsRef = useRef(excludeRefs);
  useEffect(() => {
    excludeRefsRef.current = excludeRefs;
  }, [excludeRefs]);

  const handleEvent = useCallback((event: Event) => {
    const target = event.target as Node | null;
    if (!target) return;

    if (elementRef.current?.contains(target)) return;

    const excluded = excludeRefsRef.current.some((excludeRef) =>
      excludeRef.current?.contains(target)
    );
    if (excluded) return;

    callbackRef.current();
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    document.addEventListener(event, handleEvent, true);
    return () => {
      document.removeEventListener(event, handleEvent, true);
    };
  }, [enabled, event, handleEvent]);

  return { ref: elementRef };
};

export default useClickOutside;
