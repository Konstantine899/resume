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

/**
 * Маппинг размеров для Heading компонента
 * Алиас на общую утилиту mapSizeToClass
 *
 * @example
 * ```ts
 * mapHeadingSize('xs')    // 'xs'
 * mapHeadingSize('2xl')   // 'size-2xl'
 * mapHeadingSize('5xl')   // 'size-5xl'
 * ```
 */
export const mapHeadingSize = (size: string): string => {
  if (/^\d/.test(size)) {
    return `size-${size}`;
  }
  return size;
};

/**
 * Алиас для mapHeadingSize (для совместимости)
 */
export const mapSizeToClass = mapHeadingSize;

/**
 * Константы для компонента Heading
 */
export const HEADING_CONSTANTS = {
  /** Допустимые уровни заголовков */
  VALID_LEVELS: [1, 2, 3, 4, 5, 6] as const,
  /** Допустимые размеры */
  VALID_SIZES: ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'] as const,
  /** Допустимые темы */
  VALID_THEMES: ['primary', 'muted', 'inverted', 'error', 'gradient'] as const,
  /** Допустимые выравнивания */
  VALID_ALIGNS: ['left', 'center', 'right'] as const,
  /** Уровень по умолчанию */
  DEFAULT_LEVEL: 2,
  /** Размер по умолчанию */
  DEFAULT_SIZE: 'm',
  /** Тема по умолчанию */
  DEFAULT_THEME: 'primary',
  /** Выравнивание по умолчанию */
  DEFAULT_ALIGN: 'left',
} as const;
