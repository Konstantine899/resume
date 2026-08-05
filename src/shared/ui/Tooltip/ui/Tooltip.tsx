/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react';
import type { ComponentRef, ElementType, ForwardedRef, ReactElement } from 'react';
import { TooltipProvider } from '../lib/context/TooltipContext';
import { TooltipTrigger } from './TooltipTrigger/TooltipTrigger';
import { TooltipContent } from './TooltipContent/TooltipContent';
import { TooltipArrow } from './TooltipArrow/TooltipArrow';
import type { TooltipComponent, TooltipProps, TooltipTriggerProps } from '../model/types';

/**
 * Tooltip — всплывающая подсказка для предоставления дополнительной информации
 * при наведении, фокусе или клике.
 *
 * Триггер полиморфный: по умолчанию `<span>`, `as` позволяет рендерить любой
 * элемент или компонент с типобезопасным ref (`as="a"` → `HTMLAnchorElement`).
 *
 * Композиционная обёртка над compound API (Provider + Trigger + Content):
 * НЕ дублирует логику Trigger/Content, а собирает их. Единый источник поведения —
 * useTooltip + части, так что добавление пропса не требует правки двух мест.
 *
 * @example
 * ```tsx
 * <Tooltip content="Подсказка" position="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * <Tooltip content="Открыть профиль" as="a" href="/profile">
 *   <Avatar src="/avatar.jpg" />
 * </Tooltip>
 * ```
 */
function TooltipImpl<C extends ElementType = 'span'>(
  props: TooltipProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
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
    position,
    trigger,
    showDelay,
    hideDelay,
    disabled,
    skeleton,
    offset,
    maxWidth,
    autoAdjust,
    color,
    arrowShadowColor,
    role,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
    ...restProps
  } = props;

  // Обёртка прокидывает пропсы триггера дальше: тип выводится из as,
  // поэтому объект собирается и кастуется как TooltipTriggerProps<C>
  // (generic forwarding — известное ограничение TS, см. Button/Paragraph).
  const triggerProps = {
    ref: forwardedRef,
    as: as as C,
    className,
    ariaLabel,
    role,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
    ...restProps,
  } as unknown as TooltipTriggerProps<C>;

  return (
    <TooltipProvider
      position={position}
      trigger={trigger}
      showDelay={showDelay}
      hideDelay={hideDelay}
      disabled={disabled}
      skeleton={skeleton}
      offset={offset}
      maxWidth={maxWidth}
      autoAdjust={autoAdjust}
      color={color}
      arrowShadowColor={arrowShadowColor}
    >
      <TooltipTrigger {...triggerProps}>{children}</TooltipTrigger>
      <TooltipContent overlayClassName={overlayClassName} overlayStyle={overlayStyle}>
        {content}
      </TooltipContent>
    </TooltipProvider>
  );
}

/**
 * React.memo не умеет generic-функции, поэтому оборачиваем через
 * промежуточный НЕ-generic каст, а generic typing применяется после memo
 * (Paragraph/Heading precedent).
 */
const TooltipMemo = memo(
  TooltipImpl as unknown as (
    props: TooltipProps<'span'> & { ref?: ForwardedRef<HTMLElement> }
  ) => ReactElement
);

TooltipMemo.displayName = 'Tooltip';

/**
 * Tooltip — полиморфная всплывающая подсказка.
 * Тип ref зависит от `as` (default 'span').
 *
 * Монолитный API (`<Tooltip content=...>`) — обёртка над compound API
 * (`Tooltip.Provider` + `Tooltip.Trigger` + `Tooltip.Content`).
 */
export const Tooltip = Object.assign(TooltipMemo as unknown as TooltipComponent, {
  Provider: TooltipProvider,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
});
