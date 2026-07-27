// src/shared/ui/Container/model/utils/validateContainerProps.ts

/* eslint-disable no-console */
import { CONTAINER_CONSTANTS } from '../constants';
import type { ContainerSize, ContainerPadding } from '../types';

/**
 * Validates Container size and padding props in development mode.
 * Logs warnings for invalid values but does not throw errors.
 *
 * @param size - The size prop to validate
 * @param padding - The padding prop to validate
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
