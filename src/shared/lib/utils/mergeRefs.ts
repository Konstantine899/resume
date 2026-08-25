import { useCallback, type Ref, type RefObject, type MutableRefObject } from 'react';

type ReactRef<T> = Ref<T> | RefObject<T | null> | MutableRefObject<T | null>;

/**
 * Merges multiple React refs into a single callback ref.
 * Supports callback refs, RefObject, and MutableRefObject.
 *
 * @param refs - The refs to merge
 * @returns A callback ref that sets all provided refs
 *
 * @example
 * ```tsx
 * const Component = forwardRef<HTMLDivElement, Props>((props, ref) => {
 *   const internalRef = useRef<HTMLDivElement>(null);
 *   const mergedRef = mergeRefs(ref, internalRef);
 *   return <div ref={mergedRef} />;
 * });
 * ```
 */
export function mergeRefs<T>(...refs: ReactRef<T>[]): (node: T | null) => void {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if ('current' in ref) {
        // eslint-disable-next-line no-param-reassign
        (ref as MutableRefObject<T | null>).current = node;
      }
    });
  };
}

/**
 * React hook version of mergeRefs.
 * Returns a stable callback ref that updates all provided refs.
 * Wraps mergeRefs in useCallback for referential stability.
 *
 * @param refs - The refs to merge
 * @returns A stable callback ref
 */
export function useMergeRefs<T>(...refs: ReactRef<T>[]): (node: T | null) => void {
  return useCallback((node: T | null) => mergeRefs(...refs)(node), [refs]);
}
