import type { HeadingAlign, HeadingLevel, HeadingSize, HeadingTheme } from './types';

/**
 * Допустимые уровни заголовков
 */
export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const satisfies readonly HeadingLevel[];

/**
 * Допустимые размеры заголовков
 */
export const HEADING_SIZES = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  '2xl',
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

/**
 * Проверка валидности уровня заголовка
 */
export const isValidHeadingLevel = (level: unknown): level is HeadingLevel => {
  return HEADING_LEVELS.includes(level as HeadingLevel);
};

/**
 * Проверка валидности размера заголовка
 */
export const isValidHeadingSize = (size: unknown): size is HeadingSize => {
  return HEADING_SIZES.includes(size as HeadingSize);
};

/**
 * Проверка валидности темы заголовка
 */
export const isValidHeadingTheme = (theme: unknown): theme is HeadingTheme => {
  return HEADING_THEMES.includes(theme as HeadingTheme);
};

/**
 * Проверка валидности выравнивания заголовка
 */
export const isValidHeadingAlign = (align: unknown): align is HeadingAlign => {
  return HEADING_ALIGNS.includes(align as HeadingAlign);
};
