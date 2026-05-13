import { type ReactNode } from 'react';

export type ParagraphSize = 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl';

export type ParagraphTheme =
  | 'primary'
  | 'muted'
  | 'inverted'
  | 'error'
  | 'success'
  | 'warning'
  | 'gradient';

export type ParagraphAlign = 'left' | 'center' | 'right';

/**
 * Допустимые значения для ограничения количества строк
 */
export type LineClamp = 2 | 3 | 4 | 5;

export interface ParagraphProps {
  /**
   * Размер текста
   * @default 'm'
   */
  size?: ParagraphSize;

  /**
   * Цветовая тема
   * @default 'primary'
   */
  theme?: ParagraphTheme;

  /**
   * Выравнивание текста
   * @default 'left'
   */
  align?: ParagraphAlign;

  /**
   * Дочерние элементы (текст или JSX)
   */
  children: ReactNode;

  /**
   * Дополнительные CSS классы
   */
  className?: string;

  /**
   * Data-testid для тестирования
   */
  'data-testid'?: string;

  /**
   * Максимальное количество строк (обрежет текст с многоточием)
   * @default undefined
   */
  lineClamp?: LineClamp;
}
