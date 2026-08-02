// src/shared/ui/Divider/model/types.ts

import type {
  ComponentPropsWithRef,
  ComponentRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react';

/**
 * Orientation of the divider line.
 * @horizontal - horizontal line (default)
 * @vertical - vertical line
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Style of the divider line.
 * @solid - solid line
 * @dashed - dashed line
 * @dotted - dotted line
 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

/**
 * Props, owned by Divider (не наследуются от HTML-элемента).
 */
export interface DividerOwnProps {
  /** Ориентация div ider */
  orientation?: DividerOrientation;
  /** Стиль линии */
  variant?: DividerVariant;
  /** Толщина линии (в пикселях) */
  thickness?: number;
  /** Кастомный класс */
  className?: string;
  /** Текстовая подпись для text divider (только horizontal) */
  children?: ReactNode;
}

/**
 * Базовые props Divider + полиморфный `as` prop.
 *
 * `as` привязан к дженерику `C`, поэтому TypeScript выводит тип элемента
 * из переданного значения и сужает элемент-специфичные props (например
 * `href` при `as="a"`) и тип ref. Паттерн совпадает с Paragraph/Heading.
 *
 * @template C - Тип элемента (по умолчанию 'div')
 */
export type DividerBaseProps<C extends ElementType = 'div'> = { as?: C } & DividerOwnProps;

/**
 * Generic polymorphic props для Divider.
 * Позволяет переопределить корневой элемент через `as` и получает
 * элемент-специфичные проксы с типизацией.
 *
 * @template C - Тип элемента (по умолчанию 'div')
 */
export type DividerProps<C extends ElementType = 'div'> = DividerBaseProps<C> &
  Omit<ComponentPropsWithRef<C>, keyof DividerOwnProps | 'as' | 'ref'>;

/**
 * Публичный тип компонента с резолюцией ref в зависимости от `as`.
 * `displayName` присутствует на рантайм-объекте (memo-обёртка).
 */
export type DividerComponent = (<C extends ElementType = 'div'>(
  props: DividerProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & {
  displayName?: string;
};
