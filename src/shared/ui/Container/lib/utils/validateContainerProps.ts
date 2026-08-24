/* eslint-disable no-console */
import { CONTAINER_CONSTANTS } from '../../model/constants';
import type { ContainerSize, ContainerPadding } from '../../model/types';

/**
 * Validates Container size and padding props in development mode.
 *
 * @remarks
 * - Runs ONLY when `process.env.NODE_ENV === 'development'`
 * - Uses `console.warn` (does NOT throw errors)
 * - Zero production overhead: function body is effectively a no-op in production
 * - Warning messages include valid values for quick debugging
 *
 * @param size - The size prop to validate (expected: 'sm' | 'md' | 'lg' | 'xl' | 'full')
 * @param padding - The padding prop to validate (expected: 'none' | 'sm' | 'md' | 'lg' | 'xl')
 *
 * @example
 * ```typescript
 * // Development mode: logs warning
 * validateContainerProps('invalid', 'md')
 * // → console.warn: "Container: invalid size \"invalid\". Valid sizes: sm, md, lg, xl, full"
 *
 * // Production mode: no-op
 * validateContainerProps('invalid', 'md')
 * // → nothing happens
 * ```
 */
export const validateContainerProps = (size: ContainerSize, padding: ContainerPadding): void => {
  if (process.env.NODE_ENV === 'development') {
    if (!CONTAINER_CONSTANTS.VALID_SIZES.includes(size)) {
      console.warn(
        `Container: invalid size "${size}". Valid sizes: ${CONTAINER_CONSTANTS.VALID_SIZES.join(', ')}`
      );
    }

    if (!CONTAINER_CONSTANTS.VALID_PADDING.includes(padding)) {
      console.warn(
        `Container: invalid padding "${padding}". Valid values: ${CONTAINER_CONSTANTS.VALID_PADDING.join(', ')}`
      );
    }
  }
};
/* eslint-enable no-console */
