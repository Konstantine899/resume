import type {
  ComponentPropsWithRef,
  ComponentRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react';

export type ParagraphSize = 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl';

export type ParagraphTheme =
  | 'primary'
  | 'muted'
  | 'inverted'
  | 'error'
  | 'success'
  | 'warning'
  | 'gradient'
  | 'tertiary';

export type ParagraphAlign = 'left' | 'center' | 'right';

/**
 * Допустимые значения для ограничения количества строк
 */
export type LineClamp = 2 | 3 | 4 | 5;

/**
 * HTML теги, которые изначально мог рендерить Paragraph.
 * Кепнуто для стабильности публичного API — `as` теперь принимает любой ElementType.
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

/**
 * Props, которыми владеет Paragraph (не наследуются от HTML-элемента)
 */
export interface ParagraphOwnProps {
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

/**
 * Базовые props Paragraph + полиморфный `as` prop.
 *
 * @template C - Тип элемента для рендеринга (по умолчанию 'p')
 */
export type ParagraphBaseProps<C extends ElementType = 'p'> = { as?: C } & ParagraphOwnProps;

/**
 * Generic polymorphic props для Paragraph.
 * Позволяет переопределить корневой элемент через `as` и получает
 * элемент-специфичные пропсы (например `href` при `as="a"`) с типизацией.
 *
 * `truncate` и `lineClamp` смоделированы как discriminated union (PAR-03):
 * передача `truncate` делает `lineClamp` compile-time ошибкой и наоборот —
 * одновременно их передать нельзя. Рантайм dev-warn остаётся как defense-in-depth.
 *
 * @template C - Тип элемента (по умолчанию 'p')
 */
export type ParagraphProps<C extends ElementType = 'p'> = ParagraphBaseProps<C> &
  Omit<ComponentPropsWithRef<C>, keyof ParagraphOwnProps | 'as'> &
  ({ truncate?: true; lineClamp?: never } | { truncate?: false; lineClamp?: LineClamp });

/**
 * Публичный тип компонента с резолюцией ref в зависимости от `as`.
 * `displayName` присутствует на рантайм-объекте (memo-обёртка).
 */
export type ParagraphComponent = (<C extends ElementType = 'p'>(
  props: ParagraphProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & {
  displayName?: string;
};
