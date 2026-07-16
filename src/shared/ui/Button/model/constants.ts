// ============================================
// Button Component Constants
// ============================================

import type { ButtonSize, ButtonVariant, LoadingVariant } from './types';

/**
 * Valid button variants for runtime validation
 */
export const BUTTON_CONSTANTS = {
  VALID_VARIANTS: [
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'sidebar',
  ] as const satisfies readonly ButtonVariant[],
  VALID_SIZES: ['sm', 'md', 'lg'] as const satisfies readonly ButtonSize[],
  VALID_LOADING_VARIANTS: ['spinner', 'skeleton'] as const satisfies readonly LoadingVariant[],
  DEFAULT_SPINNER_LABEL: 'Loading',
} as const;
