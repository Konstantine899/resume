import type { LineClamp, ParagraphAlign, ParagraphSize, ParagraphTheme } from './types';

/**
 * Допустимые размеры параграфа
 */
export const PARAGRAPH_SIZES = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  '2xl',
] as const satisfies readonly ParagraphSize[];

/**
 * Допустимые темы параграфа
 */
export const PARAGRAPH_THEMES = [
  'primary',
  'muted',
  'inverted',
  'error',
  'success',
  'warning',
  'gradient',
] as const satisfies readonly ParagraphTheme[];

/**
 * Допустимые выравнивания параграфа
 */
export const PARAGRAPH_ALIGNS = [
  'left',
  'center',
  'right',
] as const satisfies readonly ParagraphAlign[];

/**
 * Допустимые значения lineClamp
 */
export const LINE_CLAMP_VALUES = [2, 3, 4, 5] as const satisfies readonly LineClamp[];

/**
 * Проверка валидности размера параграфа
 */
export const isValidParagraphSize = (size: unknown): size is ParagraphSize => {
  return PARAGRAPH_SIZES.includes(size as ParagraphSize);
};

/**
 * Проверка валидности темы параграфа
 */
export const isValidParagraphTheme = (theme: unknown): theme is ParagraphTheme => {
  return PARAGRAPH_THEMES.includes(theme as ParagraphTheme);
};

/**
 * Проверка валидности выравнивания параграфа
 */
export const isValidParagraphAlign = (align: unknown): align is ParagraphAlign => {
  return PARAGRAPH_ALIGNS.includes(align as ParagraphAlign);
};

/**
 * Проверка валидности lineClamp
 */
export const isValidLineClamp = (lineClamp: unknown): lineClamp is LineClamp => {
  return LINE_CLAMP_VALUES.includes(lineClamp as LineClamp);
};
