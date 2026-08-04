import type {
  ComponentPropsWithRef,
  ComponentRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus' | 'click';

/**
 * Props, которыми владеет Tooltip (не наследуются от HTML-элемента триггера).
 */
export interface TooltipOwnProps {
  /** Контент тултипа */
  content: ReactNode;
  /** Позиция относительно триггера */
  position?: TooltipPosition;
  /** Триггер активации */
  trigger?: TooltipTrigger;
  /** Задержка показа (мс) */
  showDelay?: number;
  /** Задержка скрытия (мс) */
  hideDelay?: number;
  /** Дочерний элемент (триггер) */
  children: ReactNode;
  /** Дополнительный класс на триггере */
  className?: string;
  /** Дополнительный класс на контенте тултипа (overlay) */
  overlayClassName?: string;
  /** Инлайн-стили на контенте тултипа (overlay) */
  overlayStyle?: React.CSSProperties;
  /** Отключить тултип */
  disabled?: boolean;
  /** Максимальная ширина */
  maxWidth?: number;
  /** Accessibility description */
  ariaLabel?: string;
  /** Скелетон (показывает только children) */
  skeleton?: boolean;
  /** Смещение от триггера (px) */
  offset?: number;
  /** Авто-смена позиции при выходе за границы */
  autoAdjust?: boolean;
}

/**
 * Базовые props + полиморфный `as` prop для триггера.
 *
 * @template C - Тип элемента триггера (по умолчанию 'span')
 */
export type TooltipBaseProps<C extends ElementType = 'span'> = { as?: C } & TooltipOwnProps;

/**
 * Generic polymorphic props для Tooltip.
 * `C` выводится из `as`, элемент-специфичные пропсы триггера типизируются
 * (например `href` при `as="a"`).
 *
 * @template C - Тип элемента триггера (по умолчанию 'span')
 */
export type TooltipProps<C extends ElementType = 'span'> = TooltipBaseProps<C> &
  Omit<ComponentPropsWithRef<C>, keyof TooltipOwnProps | 'as' | 'ref'>;

/**
 * Публичный тип компонента с резолюцией ref в зависимости от `as`.
 * `displayName` присутствует на рантайм-объекте (memo-обёртка).
 */
export type TooltipComponent = (<C extends ElementType = 'span'>(
  props: TooltipProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & {
  displayName?: string;
};
