// ============================================
// mergeRefs — combine multiple refs into one callback ref
// ============================================

import type { MutableRefObject, Ref, RefCallback } from 'react';

/**
 * Merges multiple refs (callback or object) into a single callback ref.
 *
 * @param refs - Refs to combine (undefined entries are ignored)
 * @returns A callback ref that assigns the value to every provided ref
 *
 * @example
 * ```ts
 * const merged = mergeRefs(externalRef, internalRef);
 * <div ref={merged} />
 * ```
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        (ref as RefCallback<T>)(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    }
  };
}
