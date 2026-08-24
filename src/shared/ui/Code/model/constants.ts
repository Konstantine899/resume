// src/shared/ui/Code/model/constants.ts

import type { CodeSize, CodeVariant, CodeLanguage } from './types';

/**
 * Доступные размеры Code
 */
export const CODE_SIZES: readonly CodeSize[] = ['sm', 'md', 'lg'] as const;

/**
 * Доступные варианты Code
 */
export const CODE_VARIANTS: readonly CodeVariant[] = ['inline', 'block'] as const;

/**
 * Дефолтные значения props
 */
export const CODE_DEFAULTS = {
  variant: 'inline' as CodeVariant,
  size: 'md' as CodeSize,
  language: 'typescript' as CodeLanguage,
  showLineNumbers: false,
  copyable: false,
  disabled: false,
} as const;

/**
 * Константы для компонента Code
 */
export const CODE_CONSTANTS = {
  variants: CODE_VARIANTS,
  sizes: CODE_SIZES,
  defaults: CODE_DEFAULTS,
} as const;
