// src/shared/ui/Skeleton/model/constants.ts

import type { SkeletonVariant } from './types';

/**
 * Доступные варианты Skeleton
 */
export const SKELETON_VARIANTS: readonly SkeletonVariant[] = [
  'text',
  'circular',
  'rectangular',
  'rounded',
] as const;

/**
 * Дефолтные значения props
 */
export const SKELETON_DEFAULTS = {
  variant: 'text' as SkeletonVariant,
  lines: 1,
  delay: 0,
  duration: 1.5,
  staggerStep: 0.1,
} as const;

/**
 * Default aspect ratio fallback — used when ratio prop is invalid/absent at runtime
 */
export const DEFAULT_RATIO = '16/9' as const;
