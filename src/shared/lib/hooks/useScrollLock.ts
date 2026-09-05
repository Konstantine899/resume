import { useSyncExternalStore, useEffect, useRef, useCallback } from 'react';

/**
 * useSyncExternalStore-compatible scroll lock store.
 * Provides SSR-safe scroll locking with global counter.
 */
interface ScrollLockStore {
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
  subscribe: (callback: () => void) => () => void;
  lock: () => void;
  unlock: () => void;
}

// Global state
let lockCount = 0;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

const scrollLockStore: ScrollLockStore = {
  getSnapshot: () => lockCount > 0,
  getServerSnapshot: () => false,
  subscribe: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  lock: () => {
    if (typeof window === 'undefined') return;
    if (lockCount === 0) {
      document.body.style.overflow = 'hidden';
    }
    lockCount++;
    notifyListeners();
  },
  unlock: () => {
    if (typeof window === 'undefined') return;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = '';
    }
    notifyListeners();
  },
};

/**
 * SSR-safe scroll lock hook using useSyncExternalStore.
 * Manages global body overflow with a lock counter.
 *
 * @param shouldLock - Whether to lock scroll
 * @returns Whether scroll is currently locked
 *
 * @example
 * ```tsx
 * const isLocked = useScrollLock(isOpen);
 * // or manual control
 * const { lock, unlock, isLocked } = useScrollLock(false);
 * ```
 */
export function useScrollLock(shouldLock: boolean): boolean {
  const isLocked = useSyncExternalStore(
    scrollLockStore.subscribe,
    scrollLockStore.getSnapshot,
    scrollLockStore.getServerSnapshot
  );

  const prevShouldLock = useRef(shouldLock);

  useEffect(() => {
    if (shouldLock && !prevShouldLock.current) {
      scrollLockStore.lock();
    } else if (!shouldLock && prevShouldLock.current) {
      scrollLockStore.unlock();
    }
    prevShouldLock.current = shouldLock;

    return () => {
      if (prevShouldLock.current) {
        scrollLockStore.unlock();
      }
    };
  }, [shouldLock]);

  return isLocked;
}

/**
 * Manual scroll lock control (for advanced use cases).
 * Returns lock/unlock functions and current lock state.
 */
export function useScrollLockControl() {
  const isLocked = useSyncExternalStore(
    scrollLockStore.subscribe,
    scrollLockStore.getSnapshot,
    scrollLockStore.getServerSnapshot
  );

  const lock = useCallback(() => scrollLockStore.lock(), []);
  const unlock = useCallback(() => scrollLockStore.unlock(), []);

  return { isLocked, lock, unlock };
}
