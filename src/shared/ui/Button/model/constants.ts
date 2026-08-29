// ============================================
// Button Component Constants
// ============================================

import type { ButtonColorScheme, ButtonSize, ButtonVariant, LoadingVariant } from './types';

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
  VALID_SIZES: ['xs', 'sm', 'md', 'lg', 'xl'] as const satisfies readonly ButtonSize[],
  VALID_COLOR_SCHEMES: [
    'brand',
    'neutral',
    'success',
    'warning',
    'danger',
  ] as const satisfies readonly ButtonColorScheme[],
  VALID_LOADING_VARIANTS: ['spinner', 'skeleton'] as const satisfies readonly LoadingVariant[],
  DEFAULT_SPINNER_LABEL: 'Loading',
  LOADER_SPINNER_SIZE: 'sm',
  LOADER_SPINNER_COLOR: 'secondary',
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
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;
