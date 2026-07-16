// ============================================
// validateContainerProps Utility
// ============================================

import { CONTAINER_CONSTANTS } from '@/shared/ui/Container/model/constants';
import type { ContainerSize } from '@/shared/ui/Container/model/types';

/**
 * Validate container component props in development mode
 *
 * @param size - Container size to validate
 * @param padding - Container padding to validate
 *
 * @example
 * ```tsx
 * validateContainerProps('invalid', 'md');
 * // Warns: Container: invalid size "invalid"...
 * ```
 */
export const validateContainerProps = (
  size?: ContainerSize,
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
) => {
  if (process.env.NODE_ENV !== 'development') return;

  const { VALID_SIZES, VALID_PADDING } = CONTAINER_CONSTANTS;

  if (size && !VALID_SIZES.includes(size)) {
    // eslint-disable-next-line no-console
    console.warn(`Container: invalid size "${size}". Valid values: ${VALID_SIZES.join(', ')}`);
  }

  if (padding && !VALID_PADDING.includes(padding)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Container: invalid padding "${padding}". Valid values: ${VALID_PADDING.join(', ')}`
    );
  }
};
