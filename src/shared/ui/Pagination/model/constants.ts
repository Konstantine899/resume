// src/shared/ui/Pagination/model/constants.ts

/**
 * Configuration constants for the Pagination component.
 */
export const PAGINATION_CONSTANTS = {
  /** Default number of sibling pages around the current one (OPEN-3). */
  DEFAULT_SIBLINGS: 1,
  /**
   * Minimum interactive size in CSS px (WCAG 2.2 SC 2.5.8 target size).
   * Enforced by `Pagination.module.scss` on every control of the component.
   */
  MIN_TAP_TARGET_PX: 24,
} as const;
