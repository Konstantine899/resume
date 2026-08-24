// src/shared/ui/Divider/model/constants.ts

/**
 * Константы для компонента Divider
 */
export const DIVIDER_CONSTANTS = {
  /** Допустимые ориентации */
  VALID_ORIENTATIONS: ['horizontal', 'vertical'] as const,

  /** Допустимые варианты стилей */
  VALID_VARIANTS: ['solid', 'dashed', 'dotted'] as const,

  /** Минимальная толщина (px) */
  MIN_THICKNESS: 1,

  /** Максимальная толщина (px) */
  MAX_THICKNESS: 10,

  /** Толщина по умолчанию (px) */
  DEFAULT_THICKNESS: 1,
} as const;
