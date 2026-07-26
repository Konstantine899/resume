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

/**
 * Maps ButtonSize to icon pixel size for auto-inference.
 * @description Used by IconButton and ButtonWithIcon when icon has no explicit size prop.
 *
 * @example
 * ```ts
 * ICON_SIZE_MAP['sm'] // 16
 * ICON_SIZE_MAP['md'] // 20
 * ICON_SIZE_MAP['lg'] // 24
 * ```
 */
export const ICON_SIZE_MAP: Record<ButtonSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;
