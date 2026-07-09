// src/shared/ui/Skeleton/model/constants.ts

/**
 * Константы для компонента Skeleton
 */
export const SKELETON_CONSTANTS = {
  /** Допустимые варианты скелетона */
  VALID_VARIANTS: ['text', 'circular', 'rectangular'] as const,

  /** Минимальное количество строк */
  MIN_LINES: 1,

  /** Максимальное количество строк */
  MAX_LINES: 10,

  /** Задержка по умолчанию (сек) */
  DEFAULT_DELAY: 0,

  /** Длительность анимации по умолчанию (сек) */
  DEFAULT_DURATION: 1.5,
} as const;
