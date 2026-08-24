// src/shared/ui/Label/model/constants.ts

import { LabelSize, LabelVariant } from './types';

/**
 * Доступные размеры Label
 * @description Константы для валидации size prop
 */
export const LABEL_SIZES: readonly LabelSize[] = ['sm', 'md', 'lg'] as const;

/**
 * Доступные варианты Label
 * @description Константы для валидации variant prop
 */
export const LABEL_VARIANTS: readonly LabelVariant[] = [
  'default',
  'error',
  'success',
  'warning',
] as const;

/**
 * Дефолтные значения props
 * @description Используется для нормализации props
 */
export const LABEL_DEFAULTS = {
  size: 'md' as LabelSize,
  variant: 'default' as LabelVariant,
  required: false,
  error: false,
  success: false,
  skeleton: false,
} as const;

/**
 * Grouped constants for Label component
 * @description Single namespace providing access to all Label constants
 */
export const LABEL_CONSTANTS = {
  sizes: LABEL_SIZES,
  variants: LABEL_VARIANTS,
  defaults: LABEL_DEFAULTS,
} as const;
