// ============================================
// Card Component Constants
// ============================================

import type { CardRadius, CardSize, CardVariant } from './types';

/**
 * Valid card variants for runtime validation
 */
export const CARD_CONSTANTS = {
  VALID_VARIANTS: [
    'default',
    'project',
    'workHistory',
    'skill',
    'about',
    'codeBlock',
    'contact',
  ] as const satisfies readonly CardVariant[],
  VALID_SIZES: ['compact', 'default', 'large'] as const satisfies readonly CardSize[],
  VALID_RADIUS: ['rounded', 'roundedXl', 'rounded2xl'] as const satisfies readonly CardRadius[],
  DEFAULT_RADIUS: 'rounded' as const,
  DEFAULT_SIZE: 'default' as const,
  DEFAULT_VARIANT: 'default' as const,
  /**
   * Allow-list of hosts permitted for `ProjectCard` `backgroundImage`.
   * Empty by default (same-origin only) — see sanitizeBackgroundImage.
   */
  BACKGROUND_IMAGE_ALLOWED_HOSTS: [] as readonly string[],
} as const;
