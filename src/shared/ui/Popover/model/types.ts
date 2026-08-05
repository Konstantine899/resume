import type {
  ComponentPropsWithRef,
  ComponentRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react';

/**
 * Позиция поповера. Уникальный `center` — только у Popover (нет в общем
 * `Placement` shared/lib/utils/calculatePosition), поэтому собственный union.
 */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type PopoverSize = 'sm' | 'md' | 'lg' | 'auto';

/**
 * Конфигурация состояния поповер — общая для монолита (PopoverOwnProps)
 * и Provider (PopoverProviderOwnProps). Единый источник, чтобы добавление
 * пропса не требовало правки двух интерфейсов.
 */
export interface PopoverConfig {
  /** Позиция относительно триггера */
  position?: PopoverPosition;
  /** Отключить попап */
  disabled?: boolean;
  /** Закрывать при клике на контент */
  closeOnContentClick?: boolean;
  /** Закрывать при клике вне */
  closeOnClickOutside?: boolean;
  /** Закрывать по ESC */
  closeOnEsc?: boolean;
  /** Смещение от триггера (px) */
  offset?: number;
  /** Auto-adjust позиции при выходе за viewport */
  autoAdjust?: boolean;
}

/**
 * Props, которыми владеет монолитный Popover (не наследуются от HTML-элемента триггера).
 */
export interface PopoverOwnProps extends PopoverConfig {
  /** Контент попапа */
  content: ReactNode;
  /** Дочерний элемент (триггер) */
  children: ReactNode;
  /** Дополнительный класс на триггере */
  className?: string;
  /** Дополнительный класс на поповере (overlay) */
  overlayClassName?: string;
  /** Инлайн-стили на поповере (overlay) */
  overlayStyle?: React.CSSProperties;
  /** Размер попапа */
  size?: PopoverSize;
  /** Заголовок попапа */
  title?: ReactNode;
  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * Базовые props + полиморфный `as` prop для триггера.
 *
 * @template C - Тип элемента триггера (по умолчанию 'span')
 */
export type PopoverBaseProps<C extends ElementType = 'span'> = { as?: C } & PopoverOwnProps;

/**
 * Generic polymorphic props для Popover.
 * `C` выводится из `as`, элемент-специфичные пропсы триггера типизируются
 * (например `href` при `as="a"`).
 */
export type PopoverProps<C extends ElementType = 'span'> = PopoverBaseProps<C> &
  Omit<ComponentPropsWithRef<C>, keyof PopoverOwnProps | 'as' | 'ref'>;

/**
 * Публичный тип компонента с резолюцией ref в зависимости от `as`.
 * `displayName` присутствует на рантайм-объекте (memo-обёртка).
 */
export type PopoverComponent = (<C extends ElementType = 'span'>(
  props: PopoverProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & {
  displayName?: string;
  Provider: PopoverProviderComponent;
  Trigger: PopoverTriggerComponent;
  Content: PopoverContentComponent;
};

/**
 * Пропсы PopoverProvider — конфигурация состояния + children.
 */
export interface PopoverProviderOwnProps extends PopoverConfig {
  children: ReactNode;
}

export type PopoverProviderProps = PopoverProviderOwnProps;

/**
 * Тип компонента PopoverProvider (контекст-провайдер состояния).
 */
export type PopoverProviderComponent = (props: PopoverProviderProps) => ReactElement;

/**
 * Пропсы PopoverTrigger — полиморфный триггер. Потребляет состояние
 * из PopoverProvider и подключает к триггеру обработчики/ref/aria/data-*.
 */
export type PopoverTriggerOwnProps = {
  /** Дополнительный класс на триггере */
  className?: string;
  /** Accessibility label */
  ariaLabel?: string;
};

export type PopoverTriggerProps<C extends ElementType = 'span'> = PopoverTriggerOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof PopoverTriggerOwnProps | 'as'> & {
    as?: C;
  };

/**
 * Тип полиморфного компонента PopoverTrigger (ref резолвится по `as`).
 */
export type PopoverTriggerComponent = <C extends ElementType = 'span'>(
  props: PopoverTriggerProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement;

/**
 * Пропсы PopoverContent — попап в Portal. Потребляет состояние
 * из PopoverProvider (calculatedStyle/adjustedPosition/isVisible).
 */
export interface PopoverContentProps {
  children: ReactNode;
  /** Дополнительный класс на поповере (overlay) */
  overlayClassName?: string;
  /** Инлайн-стили на поповере (overlay) */
  overlayStyle?: React.CSSProperties;
  /** Дополнительный класс на контенте */
  className?: string;
  /** Позиция класса (top/bottom/left/right/center) */
  position?: PopoverPosition;
  /** Размер попапа */
  size?: PopoverSize;
  /** Title */
  title?: ReactNode;
  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * Тип компонента PopoverContent.
 */
export type PopoverContentComponent = (props: PopoverContentProps) => ReactElement;

/**
 * Значение PopoverContext, предоставляемое PopoverProvider.
 */
export interface PopoverContextValue {
  isVisible: boolean;
  calculatedStyle: React.CSSProperties;
  adjustedPosition: PopoverPosition;
  triggerRef: React.RefObject<HTMLElement | null>;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  handlers: {
    handleClick: (e: React.MouseEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleContentClick: () => void;
  };
  /** Рендерить контент: видим и не отключён */
  shouldRender: boolean;
  open: () => void;
  close: () => void;
  /** Разрешён ли попап (не disabled) */
  enabled: boolean;
  /** Отключён ли попап */
  disabled: boolean;
}
