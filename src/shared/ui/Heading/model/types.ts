/**
 * Уровень заголовка (h1-h6)
 * Определяет семантику и SEO важность
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Визуальный размер заголовка
 * Не влияет на семантику, только на отображение
 */
export type HeadingSize = 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

/**
 * Цветовая тема заголовка
 * Определяет цвет текста через CSS переменные
 */
export type HeadingTheme = 'primary' | 'muted' | 'inverted' | 'error' | 'gradient';

/**
 * Выравнивание текста заголовка
 */
export type HeadingAlign = 'left' | 'center' | 'right';

/**
 * Props для компонента Heading
 */
export interface HeadingProps {
  /**
   * Уровень заголовка (h1-h6). Влияет на семантику и SEO
   * @default 2
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements
   */
  readonly level?: HeadingLevel;

  /**
   * Визуальный размер заголовка
   * @default 'm'
   */
  readonly size?: HeadingSize;

  /**
   * Цветовая тема
   * @default 'primary'
   */
  readonly theme?: HeadingTheme;

  /**
   * Выравнивание текста
   * @default 'left'
   */
  readonly align?: HeadingAlign;

  /**
   * Дочерние элементы (текст или JSX)
   * @required
   */
  readonly children: React.ReactNode;

  /**
   * Дополнительные CSS классы
   */
  readonly className?: string;

  /**
   * HTML id для якорных ссылок
   * @example id="section-title"
   */
  readonly id?: string;

  /**
   * ARIA label для доступности
   * @example aria-label="Projects Section"
   */
  readonly 'aria-label'?: string;

  /**
   * ARIA labelledby для связи с другим элементом
   * @example aria-labelledby="title-id"
   */
  readonly 'aria-labelledby'?: string;

  /**
   * Data-testid для тестирования
   * @default 'Heading'
   */
  readonly 'data-testid'?: string;
}
