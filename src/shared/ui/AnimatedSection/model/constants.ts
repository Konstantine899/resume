// ============================================
// AnimatedSection Component Constants
// ============================================

/**
 * Animation configuration constants
 */
export const ANIMATION_CONSTANTS = {
  DEFAULT_DURATION: 700,
  DEFAULT_DELAY: 0,
  DEFAULT_THRESHOLD: 0.1,
  DEFAULT_ROOT_MARGIN: '0px 0px -50px 0px',
  OFFSET_SM: 20,
  OFFSET_LG: 100,
  MIN_DURATION: 100,
  MAX_DURATION: 2000,
  MIN_DELAY: 0,
  MAX_DELAY: 2000,
} as const;

/**
 * Available animation types
 */
export const ANIMATION_TYPES = [
  'fadeIn',
  'fadeUp',
  'fadeDown',
  'slideInLeft',
  'slideInRight',
  'scaleIn',
  'none',
] as const;

/**
 * Available trigger types
 */
export const TRIGGER_TYPES = ['onMount', 'onScroll', 'onHover', 'manual'] as const;
