import { Skeleton } from '@/shared/ui/Skeleton';

export interface ImageSkeletonProps {
  className?: string;
}

/**
 * ImageSkeleton Component — renders the placeholder for Image loading state.
 *
 * @description
 * Isolates the skeleton markup from the Image component (LinkSkeleton/ButtonLoader precedent).
 * Renders a `<div>` carrying `aria-hidden="true"`, wrapping a
 * `Skeleton variant="rectangular" width="100%" height="100%"`. The Image component delegates to this component when
 * `showPlaceholder && placeholder === 'skeleton'`, so the DOM is byte-identical to the inline branch.
 *
 * @example
 * ```tsx
 * <ImageSkeleton className={placeholderClasses} />
 * // Renders: <div aria-hidden="true" class="..."><Skeleton variant="rectangular" width="100%" height="100%" /></div>
 * ```
 */
export const ImageSkeleton = ({ className }: ImageSkeletonProps) => (
  <div aria-hidden="true" className={className}>
    <Skeleton variant="rectangular" width="100%" height="100%" />
  </div>
);
