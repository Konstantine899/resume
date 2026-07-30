// src/shared/ui/Section/model/constants.ts

import type { SectionSize } from './types';

/**
 * Доступные размеры Section
 */
export const SECTION_SIZES: readonly SectionSize[] = ['sm', 'md', 'lg', 'xl', 'xxl'] as const;

/**
 * Дефолтные значения props
 */
export const SECTION_DEFAULTS = {
  size: 'md' as SectionSize,
} as const;

/**
 * Padding значения для каждого размера
 */
export const SECTION_PADDING_VALUES: Record<SectionSize, string> = {
  sm: '1.5rem',
  md: '2rem',
  lg: '3rem',
  xl: '4rem',
  xxl: '6rem',
} as const;

/**
 * Grouped constants for Section component
 */
export const SECTION_CONSTANTS = {
  sizes: SECTION_SIZES,
  defaults: SECTION_DEFAULTS,
  padding: SECTION_PADDING_VALUES,
} as const;
