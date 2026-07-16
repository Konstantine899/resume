// ============================================
// validateDividerProps Utility
// ============================================

import { DIVIDER_CONSTANTS } from '@/shared/ui/Divider/model/constants';
import type { DividerOrientation, DividerVariant } from '@/shared/ui/Divider/model/types';

/**
 * Validate divider component props in development mode
 *
 * @param orientation - Divider orientation to validate
 * @param variant - Divider variant to validate
 * @param thickness - Divider thickness to validate
 *
 * @example
 * ```tsx
 * validateDividerProps('vertical', 'solid', 2);
 * // No warning — all valid
 * ```
 *
 * @example
 * ```tsx
 * validateDividerProps('diagonal', 'solid', 2);
 * // Warns: Divider: invalid orientation "diagonal"...
 * ```
 */
export const validateDividerProps = (
  orientation?: DividerOrientation,
  variant?: DividerVariant,
  thickness?: number
) => {
  if (process.env.NODE_ENV !== 'development') return;

  const { VALID_ORIENTATIONS, VALID_VARIANTS, MIN_THICKNESS, MAX_THICKNESS } = DIVIDER_CONSTANTS;

  if (orientation && !VALID_ORIENTATIONS.includes(orientation)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Divider: invalid orientation "${orientation}". Valid values: ${VALID_ORIENTATIONS.join(', ')}`
    );
  }

  if (variant && !VALID_VARIANTS.includes(variant)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Divider: invalid variant "${variant}". Valid values: ${VALID_VARIANTS.join(', ')}`
    );
  }

  if (thickness !== undefined && (thickness < MIN_THICKNESS || thickness > MAX_THICKNESS)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Divider: invalid thickness "${thickness}". Valid range: ${MIN_THICKNESS}-${MAX_THICKNESS}px`
    );
  }
};
