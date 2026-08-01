import type {
  LineClamp,
  ParagraphAlign,
  ParagraphSize,
  ParagraphTheme,
  ParagraphWeight,
  ParagraphWrap,
} from './types';

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
  'tertiary',
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
 * Допустимые насыщенности шрифта
 */
export const PARAGRAPH_WEIGHTS = [
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
] as const satisfies readonly ParagraphWeight[];

/**
 * Допустимые режимы переноса текста
 */
export const PARAGRAPH_WRAPS = [
  'wrap',
  'nowrap',
  'balance',
  'pretty',
] as const satisfies readonly ParagraphWrap[];

/**
 * Проверка валидности lineClamp
 */
export const isValidLineClamp = (lineClamp: unknown): lineClamp is LineClamp => {
  return LINE_CLAMP_VALUES.includes(lineClamp as LineClamp);
};
