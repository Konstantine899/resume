// ============================================
// Textarea Component - Constants
// ============================================

export const TEXTAREA_CONSTANTS = {
  VALID_VARIANTS: ['default', 'outline', 'filled'] as const,
  VALID_SIZES: ['sm', 'md', 'lg'] as const,
  MIN_ROWS: 2,
  MAX_ROWS: 10,
  DEFAULT_ROWS: 3,
  CHAR_COUNT_WARNING_THRESHOLD: 0.9,
  CLEAR_BUTTON_LABEL: 'Clear text',
  LOADING_LABEL: 'Loading',
} as const;
