// ============================================
// validateCardProps Utility
// ============================================

import { CARD_CONSTANTS } from '@/shared/ui/Card/model/constants';
import type { CardRadius, CardSize, CardVariant } from '@/shared/ui/Card/model/types';

/**
 * Validate card component props in development mode
 *
 * @param componentName - Name of the component for error messages
 * @param props - Props to validate
 *
 * @example
 * ```tsx
 * validateCardProps('Card', { variant: 'invalid', size: 'large' });
 * // Warns: Card: invalid variant "invalid"...
 * ```
 */
export const validateCardProps = (
  componentName: string,
  props: {
    variant?: CardVariant;
    size?: CardSize;
    radius?: CardRadius;
  }
) => {
  if (process.env.NODE_ENV !== 'development') return;

  const { variant, size, radius } = props;

  if (variant && !CARD_CONSTANTS.VALID_VARIANTS.includes(variant)) {
    // eslint-disable-next-line no-console
    console.warn(
      `${componentName}: invalid variant "${variant}". Valid values: ${CARD_CONSTANTS.VALID_VARIANTS.join(', ')}`
    );
  }

  if (size && !CARD_CONSTANTS.VALID_SIZES.includes(size)) {
    // eslint-disable-next-line no-console
    console.warn(
      `${componentName}: invalid size "${size}". Valid values: ${CARD_CONSTANTS.VALID_SIZES.join(', ')}`
    );
  }

  if (radius && !CARD_CONSTANTS.VALID_RADIUS.includes(radius)) {
    // eslint-disable-next-line no-console
    console.warn(
      `${componentName}: invalid radius "${radius}". Valid values: ${CARD_CONSTANTS.VALID_RADIUS.join(', ')}`
    );
  }
};
