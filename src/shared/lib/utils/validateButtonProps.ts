// ============================================
// validateButtonProps Utility
// ============================================

import { BUTTON_CONSTANTS } from '@/shared/ui/Button/model/constants';
import type { ButtonSize, ButtonVariant, LoadingVariant } from '@/shared/ui/Button/model/types';

/**
 * Validate button component props in development mode
 *
 * @param componentName - Name of the component for error messages
 * @param props - Props to validate
 *
 * @example
 * ```tsx
 * validateButtonProps('Button', { variant: 'invalid', size: 'md' });
 * // Warns: Button: invalid variant "invalid"...
 * ```
 */
export const validateButtonProps = (
  componentName: string,
  props: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loadingVariant?: LoadingVariant;
  }
) => {
  if (process.env.NODE_ENV !== 'development') return;

  const { variant, size, loadingVariant } = props;

  if (variant && !BUTTON_CONSTANTS.VALID_VARIANTS.includes(variant)) {
    // eslint-disable-next-line no-console
    console.warn(
      `${componentName}: invalid variant "${variant}". Valid values: ${BUTTON_CONSTANTS.VALID_VARIANTS.join(', ')}`
    );
  }

  if (size && !BUTTON_CONSTANTS.VALID_SIZES.includes(size)) {
    // eslint-disable-next-line no-console
    console.warn(
      `${componentName}: invalid size "${size}". Valid values: ${BUTTON_CONSTANTS.VALID_SIZES.join(', ')}`
    );
  }

  if (loadingVariant && !BUTTON_CONSTANTS.VALID_LOADING_VARIANTS.includes(loadingVariant)) {
    // eslint-disable-next-line no-console
    console.warn(
      `${componentName}: invalid loadingVariant "${loadingVariant}". Valid values: ${BUTTON_CONSTANTS.VALID_LOADING_VARIANTS.join(', ')}`
    );
  }
};
