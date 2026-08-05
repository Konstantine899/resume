/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react';
import type { ComponentRef, ElementType, ForwardedRef, ReactElement } from 'react';
import { PopoverProvider } from '../lib/context/PopoverContext';
import { PopoverTrigger } from './PopoverTrigger/PopoverTrigger';
import { PopoverContent } from './PopoverContent/PopoverContent';
import { POPOVER_CONSTANTS } from '../model/constants';
import { validatePopoverProps } from '../lib/utils/validatePopoverProps';
import type { PopoverComponent, PopoverProps, PopoverTriggerProps } from '../model/types';

/**
 * Popover — всплывающее окно с контекстным контентом.
 *
 * Триггер полиморфный: по умолчанию `<span>`, `as` позволяет рендерить любой
 * элемент или компонент с типобезопасным ref (`as="a"` → `HTMLAnchorElement`).
 *
 * Композиционная обёртка над compound API (Provider + Trigger + Content):
 * НЕ дублирует логику Trigger/Content, а собирает их. Единый источник поведения —
 * usePopover + части, так что добавление пропса не требует правки двух мест.
 *
 * @example
 * ```tsx
 * <Popover content="Информация о пользователе">
 *   <button>Профиль</button>
 * </Popover>
 *
 * <Popover content={<SettingsMenu />} position="bottom" size="lg">
 *   <SettingsIcon />
 * </Popover>
 * ```
 */
function PopoverImpl<C extends ElementType = 'span'>(
  props: PopoverProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
): ReactElement {
  const {
    ref: forwardedRef,
    as = 'span',
    content,
    children,
    className,
    overlayClassName,
    overlayStyle,
    ariaLabel,
    title,
    size = POPOVER_CONSTANTS.defaults.size,
    position = POPOVER_CONSTANTS.defaults.position,
    disabled = POPOVER_CONSTANTS.defaults.disabled,
    closeOnContentClick = POPOVER_CONSTANTS.defaults.closeOnContentClick,
    closeOnClickOutside = POPOVER_CONSTANTS.defaults.closeOnClickOutside,
    closeOnEsc = POPOVER_CONSTANTS.defaults.closeOnEsc,
    offset = POPOVER_CONSTANTS.defaults.offset,
    autoAdjust = POPOVER_CONSTANTS.defaults.autoAdjust,
    ...restProps
  } = props;

  // Dev-валидация
  if (process.env.NODE_ENV === 'development') {
    validatePopoverProps({ position, size } as unknown as PopoverProps);
  }

  // Обёртка прокидывает пропсы триггера дальше: тип выводится из as,
  // поэтому объект собирается и кастуется как PopoverTriggerProps<C>
  // (generic forwarding — известное ограничение TS, см. Button/Paragraph/Tooltip).
  const triggerProps = {
    ref: forwardedRef,
    as: as as C,
    className,
    ariaLabel,
    ...restProps,
  } as unknown as PopoverTriggerProps<C>;

  return (
    <PopoverProvider
      position={position}
      offset={offset}
      autoAdjust={autoAdjust}
      disabled={disabled}
      closeOnContentClick={closeOnContentClick}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEsc={closeOnEsc}
    >
      <PopoverTrigger {...triggerProps}>{children}</PopoverTrigger>
      <PopoverContent
        overlayClassName={overlayClassName}
        overlayStyle={overlayStyle}
        // НЕ передаём position из монолита: Content читает adjustedPosition
        // из контекста (результат auto-adjust), как TooltipContent. Статичный
        // position здесь замаскировал бы флип top→bottom в data-position/классе.
        // Compound-пользователь может переопределить через <Popover.Content position=...>.
        size={size}
        title={title}
        ariaLabel={ariaLabel}
      >
        {content}
      </PopoverContent>
    </PopoverProvider>
  );
}

/**
 * React.memo не умеет generic-функции, поэтому оборачиваем через
 * промежуточный НЕ-generic каст, а generic typing применяется после memo
 * (Paragraph/Heading precedent).
 */
const PopoverMemo = memo(
  PopoverImpl as unknown as (
    props: PopoverProps<'span'> & { ref?: ForwardedRef<HTMLElement> }
  ) => ReactElement
);

PopoverMemo.displayName = 'Popover';

/**
 * Popover — полиморфное всплывающее окно.
 * Тип ref зависит от `as` (default 'span').
 *
 * Монолитный API (`<Popover content=...>`) — обёртка над compound API
 * (`Popover.Provider` + `Popover.Trigger` + `Popover.Content`).
 */
export const Popover = Object.assign(PopoverMemo as unknown as PopoverComponent, {
  Provider: PopoverProvider,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
});
