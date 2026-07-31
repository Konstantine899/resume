import type { HeadingAlign, HeadingLevel, HeadingSize, HeadingTheme } from './types';

/**
 * Допустимые уровни заголовков
 */
export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const satisfies readonly HeadingLevel[];

/**
 * Допустимые размеры заголовков
 * @xxl renamed from 2xl to avoid CSS class name issues
 */
export const HEADING_SIZES = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  'xxl',
  '3xl',
  '4xl',
  '5xl',
] as const satisfies readonly HeadingSize[];

/**
 * Допустимые темы заголовков
 */
export const HEADING_THEMES = [
  'primary',
  'muted',
  'inverted',
  'error',
  'gradient',
] as const satisfies readonly HeadingTheme[];

/**
 * Допустимые выравнивания заголовков
 */
export const HEADING_ALIGNS = [
  'left',
  'center',
  'right',
] as const satisfies readonly HeadingAlign[];
