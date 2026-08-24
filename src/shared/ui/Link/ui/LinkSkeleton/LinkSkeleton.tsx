// src/shared/ui/Link/ui/LinkSkeleton/LinkSkeleton.tsx

import { Skeleton } from '@/shared/ui/Skeleton';
import styles from '../Link.module.scss';

/**
 * Props for the LinkSkeleton component.
 */
export interface LinkSkeletonProps {
  /** Computed link className (includes the `skeleton` modifier) */
  className: string;
}

/**
 * LinkSkeleton Component — renders the loading placeholder for Link.
 *
 * @description
 * Isolates the skeleton markup from the anchor path (ButtonLoader precedent).
 * Renders a `<span>` carrying `aria-disabled` and `data-skeleton`, wrapping a
 * `Skeleton variant="text"`. The main Link delegates to this component when
 * `skeleton` is true, so no anchor element is present in the DOM.
 *
 * @example
 * ```tsx
 * <LinkSkeleton className={linkClassName} />
 * // Renders: <span aria-disabled="true" data-skeleton="true"><Skeleton variant="text" /></span>
 * ```
 */
export const LinkSkeleton = ({ className }: LinkSkeletonProps) => (
  <span className={className} aria-disabled="true" data-skeleton="true">
    <Skeleton variant="text" className={styles.skeletonPlaceholder} />
  </span>
);
