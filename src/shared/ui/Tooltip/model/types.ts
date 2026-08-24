import type {
  ComponentPropsWithRef,
  ComponentRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react';
import type { Placement } from '@/shared/lib/utils/calculatePosition';

/**
 * Позиция тултипа — алиас на общий `Placement` (shared/lib/utils/calculatePosition).
 * Единый источник 12 placement вариантов: не дублировать union в 5 файлах.
 */
export type TooltipPosition = Placement;
export type TooltipTriggerType = 'hover' | 'focus' | 'click';

/**
 * Тип контента тултипа — строже, чем `ReactNode`:
 * строка, ReactElement или null (план ui-kit-improvement-tooltip #9).
 * Числа, булевы значения и фрагменты исключены — контент тултипа
 * не должен быть пустым/невидимым.
 */
export type TooltipContentValue = string | ReactElement | null;

/**
 * Конфигурация состояния тултипа — общая для монолита (TooltipOwnProps)
 * и Provider (TooltipProviderOwnProps). Единый источник, чтобы добавление
 * пропса не требовало правки двух интерфейсов.
 */
export interface TooltipConfig {
  /** Позиция относительно триггера */
  position?: TooltipPosition;
  /** Триггер активации */
  trigger?: TooltipTriggerType;
  /** Задержка показа (мс) */
  showDelay?: number;
  /** Задержка скрытия (мс) */
  hideDelay?: number;
  /** Отключить тултип */
  disabled?: boolean;
  /** Скелетон (показывает только children) */
  skeleton?: boolean;
  /** Смещение от триггера (px) */
  offset?: number;
  /** Максимальная ширина */
  maxWidth?: number;
  /** Авто-смена позиции при выходе за границы */
  autoAdjust?: boolean;
  /** Цвет фона тултипа (AntD-style). Стрелка наследует цвет автоматически. */
  color?: string;
  /** Цвет тени стрелки (drop-shadow). По умолчанию — как у тултипа. */
  arrowShadowColor?: string;
}

/**
 * Props, которыми владеет монолитный Tooltip (не наследуются от HTML-элемента триггера).
 */
export interface TooltipOwnProps extends TooltipConfig {
  /** Контент тултипа (строка, ReactElement или null) */
  content: TooltipContentValue;
  /** Дочерний элемент (триггер) */
  children: ReactNode;
  /** Дополнительный класс на триггере */
  className?: string;
  /** Дополнительный класс на контенте тултипа (overlay) */
  overlayClassName?: string;
  /** Инлайн-стили на контенте тултипа (overlay) */
  overlayStyle?: React.CSSProperties;
  /** Accessibility description */
  ariaLabel?: string;
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
  Provider: TooltipProviderComponent;
  Trigger: TooltipTriggerComponent;
  Content: TooltipContentComponent;
  Arrow: TooltipArrowComponent;
};

/**
 * Пропсы TooltipProvider — конфигурация состояния тултипа + children
 * (содержит Trigger + Content).
 */
export interface TooltipProviderOwnProps extends TooltipConfig {
  children: ReactNode;
}

export type TooltipProviderProps = TooltipProviderOwnProps;

/**
 * Тип компонента TooltipProvider (контекст-провайдер состояния).
 */
export type TooltipProviderComponent = (props: TooltipProviderProps) => ReactElement;

/**
 * Пропсы TooltipTrigger — полиморфный триггер с asChild поддержкой.
 * Потребляет состояние из TooltipProvider.
 */
export type TooltipTriggerOwnProps = {
  /** Рендерить child element как триггер (Radix Slot pattern) */
  asChild?: boolean;
  /** Дополнительный класс на триггере */
  className?: string;
  /** Accessibility description */
  ariaLabel?: string;
};

export type TooltipTriggerProps<C extends ElementType = 'span'> = TooltipTriggerOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof TooltipTriggerOwnProps | 'as'> & {
    as?: C;
  };

/**
 * Тип полиморфного компонента TooltipTrigger (ref резолвится по `as`).
 */
export type TooltipTriggerComponent = <C extends ElementType = 'span'>(
  props: TooltipTriggerProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement;

/**
 * Пропсы TooltipContent — контент тултипа в Portal.
 * Потребляет состояние из TooltipProvider.
 */
export interface TooltipContentProps {
  children: ReactNode;
  /** Дополнительный класс на контенте тултипа (overlay) */
  overlayClassName?: string;
  /** Инлайн-стили на контенте тултипа (overlay) */
  overlayStyle?: React.CSSProperties;
}

/**
 * Тип компонента TooltipContent.
 */
export type TooltipContentComponent = (props: TooltipContentProps) => ReactElement;

/**
 * Пропсы TooltipArrow — стрелка тултипа.
 * Потребляет состояние из TooltipProvider (adjustedPosition).
 */
export interface TooltipArrowProps {
  className?: string;
}

/**
 * Тип компонента TooltipArrow.
 */
export type TooltipArrowComponent = (props: TooltipArrowProps) => ReactElement;

/**
 * Значение TooltipContext, предоставляемое TooltipProvider.
 */
export interface TooltipContextValue {
  isVisible: boolean;
  calculatedStyle: React.CSSProperties;
  adjustedPosition: TooltipPosition;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  tooltipId: string;
  activeTrigger: TooltipTriggerType;
  disabled: boolean;
  skeleton: boolean;
  /** Позиция уже вычислена (тултип можно показывать с transition) */
  positioned: boolean;
  /** Цвет фона тултипа (CSS var --tooltip-bg) */
  color?: string;
  /** Цвет тени стрелки (CSS var --tooltip-arrow-shadow) */
  arrowShadowColor?: string;
  handlers: {
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    handleFocus: () => void;
    handleBlur: () => void;
    handleClick: (e: React.MouseEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** Рендерить контент: видим и не отключён */
  isVisibleEnabled: boolean;
}
