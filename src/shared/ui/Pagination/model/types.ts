// src/shared/ui/Pagination/model/types.ts

/**
 * Props of the presentational Pagination control (plan A2).
 *
 * The component stores NOTHING: `page` (1-based) and `totalPages` are derived
 * by the consuming container, which also owns the clamp (out-of-range pages
 * never reach the component in a correct container).
 */
export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  /** Total number of pages (`<= 1` renders nothing — A3). */
  totalPages: number;
  /** Called with the 1-based target page. */
  onPageChange: (page: number) => void;
  /** Sibling pages rendered on each side of the current one.
   * @default 1 */
  siblings?: number;
  /** Extra class for the root `<nav>`. */
  className?: string;
}
