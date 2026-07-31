import type { ElementType, ComponentPropsWithRef, ReactNode } from 'react';

/**
 * Уровень заголовка (h1-h6)
 * Определяет семантику и SEO важность
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Визуальный размер заголовка
 * Не влияет на семантику, только на отображение
 * @xxl renamed from '2xl' to avoid CSS class name issues
 */
export type HeadingSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | '3xl' | '4xl' | '5xl';

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
 * Семантический HTML элемент для заголовка
 */
export type HeadingAsElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';

/**
 * Props owned by Heading (not inherited from HTML element)
 */
export interface HeadingOwnProps {
  /** Semantic HTML элемент (переопределяет корневой элемент) */
  as?: HeadingAsElement;
  /** Семантический уровень заголовка (h1–h6) */
  level?: HeadingLevel;
  /** Визуальный размер (не влияет на семантику) */
  size?: HeadingSize;
  /** Цветовая тема */
  theme?: HeadingTheme;
  /** Выравнивание текста */
  align?: HeadingAlign;
  /** Дочерние элементы */
  children?: ReactNode;
  /** Кастомный className */
  className?: string;
  /** HTML id для якорных ссылок */
  id?: string;
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA labelledby */
  'aria-labelledby'?: string;
  /** Data-testid для тестирования */
  'data-testid'?: string;
}

/**
 * Generic polymorphic props for Heading component
 * Позволяет переопределить корневой элемент через `as` prop
 *
 * @template C - Тип элемента (по умолчанию 'h2')
 */
export type HeadingProps<C extends ElementType = 'h2'> = HeadingOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof HeadingOwnProps>;

/**
 * Props для useHeading hook
 */
export interface HeadingHookProps {
  level?: HeadingLevel;
  size?: HeadingSize;
  theme?: HeadingTheme;
  align?: HeadingAlign;
  className?: string;
  /** Рендерить with gradient theme */
  isGradient?: boolean;
}

/**
 * Return type для useHeading hook
 */
export interface UseHeadingReturn {
  headingClassName: string;
  dataAttrs: Record<string, string>;
}
