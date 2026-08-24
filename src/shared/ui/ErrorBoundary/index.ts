/**
 * ErrorBoundary Component
 * @module @/shared/ui/ErrorBoundary
 * @description Class-based boundary: catches render-phase crashes in its children
 * subtree and swaps in the fallback, keeping the rest of the app mounted.
 * Named-only exports (repo rule).
 */

export { ErrorBoundary, DEFAULT_BOUNDARY_FALLBACK } from './ui/ErrorBoundary';
export type { ErrorBoundaryProps, ErrorBoundaryState } from './model/types';
