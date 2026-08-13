// src/shared/ui/Skeleton/model/constants.ts

import type { SkeletonVariant } from './types';

/**
 * Доступные варианты Skeleton
 */
export const SKELETON_VARIANTS: readonly SkeletonVariant[] = [
  'text',
  'circular',
  'rectangular',
] as const;

/**
 * Дефолтные значения props
 */
export const SKELETON_DEFAULTS = {
  variant: 'text' as SkeletonVariant,
  lines: 1,
  delay: 0,
  duration: 1.5,
} as const;

/**
 * Default aspect ratio fallback — used when ratio prop is invalid/absent at runtime
 */
export const DEFAULT_RATIO = '16/9' as const;

/**
 * Константы для компонента Skeleton
 */
export const SKELETON_CONSTANTS = {
  /** Допустимые варианты скелетона */
  VALID_VARIANTS: SKELETON_VARIANTS,
  variants: SKELETON_VARIANTS,

  /** Минимальное количество строк */
  MIN_LINES: 1,

  /** Максимальное количество строк */
  MAX_LINES: 10,

  /** Задержка по умолчанию (сек) */
  DEFAULT_DELAY: SKELETON_DEFAULTS.delay,

  /** Длительность анимации по умолчанию (сек) */
  DEFAULT_DURATION: SKELETON_DEFAULTS.duration,

  /** Дефолтное значение ratio */
  DEFAULT_RATIO,

  /** Дефолтные значения */
  defaults: SKELETON_DEFAULTS,

  /** CSS-переменные для анимации */
  cssVariables: {
    duration: '--skeleton-duration',
    delay: '--skeleton-delay',
  } as const,
} as const;
