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

/**
 * HTML теги, которые может рендерить Paragraph
 */
export type ParagraphElement = 'p' | 'span' | 'div' | 'label';

/**
 * Насыщенность шрифта
 */
export type ParagraphWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Режим переноса текста
 */
export type ParagraphWrap = 'wrap' | 'nowrap' | 'balance' | 'pretty';

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
   * ID элемента для ARIA связывания
   */
  id?: string;

  /**
   * Максимальное количество строк (обрежет текст с многоточием)
   * @default undefined
   */
  lineClamp?: LineClamp;

  /**
   * HTML тег для рендеринга
   * @default 'p'
   */
  as?: ParagraphElement;

  /**
   * Насыщенность шрифта
   * @default 'normal'
   */
  weight?: ParagraphWeight;

  /**
   * Обрезать текст с многоточием (одна строка).
   * Не может быть использован одновременно с lineClamp.
   * @default false
   */
  truncate?: boolean;

  /**
   * Режим переноса текста
   * @default 'wrap'
   */
  wrap?: ParagraphWrap;

  /**
   * Использовать Slot для рендеринга — компонент не создаёт свой DOM-узел,
   * а прокидывает className, id, data-testid и ref в единственного дочернего ReactElement.
   * @default false
   */
  asChild?: boolean;
}
