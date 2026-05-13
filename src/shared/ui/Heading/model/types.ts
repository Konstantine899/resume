import { type ReactNode } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingSize = 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

export type HeadingTheme = 'primary' | 'muted' | 'inverted' | 'error' | 'gradient';

export type HeadingAlign = 'left' | 'center' | 'right';

export interface HeadingProps {
  /**
   * Уровень заголовка (h1-h6). Влияет на семантику и SEO
   * @default 2
   */
  level?: HeadingLevel;

  /**
   * Визуальный размер заголовка
   * @default 'm'
   */
  size?: HeadingSize;

  /**
   * Цветовая тема
   * @default 'primary'
   */
  theme?: HeadingTheme;

  /**
   * Выравнивание текста
   * @default 'left'
   */
  align?: HeadingAlign;

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
}
