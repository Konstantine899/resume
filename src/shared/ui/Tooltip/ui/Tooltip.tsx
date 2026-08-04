/* eslint-disable react-refresh/only-export-components */
import { cn } from '@/shared/lib/utils/classNames';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { resolveCssModuleKey } from '@/shared/lib/utils/resolveCssModuleKey';
import { Portal } from '@/shared/ui/Portal';
import { Skeleton } from '@/shared/ui/Skeleton';
import { memo } from 'react';
import type {
  ComponentRef,
  ElementType,
  ForwardedRef,
  MouseEvent,
  KeyboardEvent,
  ReactElement,
  Ref,
} from 'react';
import { useTooltip } from '../lib/hooks/useTooltip';
import { TooltipProvider } from '../lib/context/TooltipContext';
import { TooltipTrigger } from './TooltipTrigger/TooltipTrigger';
import { TooltipContent } from './TooltipContent/TooltipContent';
import { TooltipArrow } from './TooltipArrow/TooltipArrow';
import type { TooltipComponent, TooltipProps } from '../model/types';
import styles from './Tooltip.module.scss';

/**
 * Tooltip — всплывающая подсказка для предоставления дополнительной информации
 * при наведении, фокусе или клике.
 *
 * Триггер полиморфный: по умолчанию `<span>`, `as` позволяет рендерить любой
 * элемент или компонент с типобезопасным ref (`as="a"` → `HTMLAnchorElement`).
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
    as: Component = 'span',
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
    role: roleProp,
    onMouseEnter: userOnMouseEnter,
    onMouseLeave: userOnMouseLeave,
    onFocus: userOnFocus,
    onBlur: userOnBlur,
    onClick: userOnClick,
    onKeyDown: userOnKeyDown,
    ...restProps
  } = props;

  const {
    isVisible,
    calculatedStyle,
    adjustedPosition,
    triggerRef,
    tooltipRef,
    handlers,
    shouldRender,
    tooltipId,
  } = useTooltip({
    position,
    trigger,
    showDelay,
    hideDelay,
    disabled,
    offset,
    maxWidth,
    autoAdjust,
  });

  const triggerRefCallback = useMergeRefs(forwardedRef as Ref<HTMLElement>, triggerRef);
  const Tag = Component as ElementType;

  const activeTrigger = trigger ?? 'hover';

  // overlayStyle позволяет кастомизировать внешний вид, но никогда не должен
  // перезаписывать вычисленные позиционные ключи (top/left/maxWidth) — иначе
  // пользователь может случайно сломать позиционирование тултипа.
  const overlayRest = (() => {
    if (!overlayStyle) return undefined;
    return Object.fromEntries(
      Object.entries(overlayStyle).filter(
        ([key]) => key !== 'top' && key !== 'left' && key !== 'maxWidth'
      )
    );
  })();

  // color prop (AntD-style): задаёт фон тултипа через CSS-переменную, стрелка
  // (`::after`/`.arrow`) наследует её автоматически (var(--tooltip-bg)).
  const colorVar = color ? ({ '--tooltip-bg': color } as React.CSSProperties) : undefined;

  // arrowShadowColor: тень стрелки через CSS-переменную.
  const arrowShadowVar = arrowShadowColor
    ? ({ '--tooltip-arrow-shadow': arrowShadowColor } as React.CSSProperties)
    : undefined;

  return (
    <>
      <Tag
        {...restProps}
        ref={triggerRefCallback}
        className={cn(styles.trigger, className)}
        onMouseEnter={(e: MouseEvent<HTMLElement>) => {
          userOnMouseEnter?.(e);
          handlers.handleMouseEnter();
        }}
        onMouseLeave={(e: MouseEvent<HTMLElement>) => {
          userOnMouseLeave?.(e);
          handlers.handleMouseLeave();
        }}
        onFocus={(e: React.FocusEvent<HTMLElement>) => {
          userOnFocus?.(e);
          handlers.handleFocus();
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          userOnBlur?.(e);
          handlers.handleBlur();
        }}
        onClick={(e: MouseEvent<HTMLElement>) => {
          userOnClick?.(e);
          handlers.handleClick(e);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
          userOnKeyDown?.(e);
          handlers.handleKeyDown(e);
        }}
        tabIndex={activeTrigger === 'click' || activeTrigger === 'focus' ? 0 : undefined}
        aria-describedby={isVisible ? tooltipId : undefined}
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        role={
          roleProp ??
          (activeTrigger === 'click' || activeTrigger === 'focus' ? 'button' : undefined)
        }
        data-tooltip-visible={isVisible}
        data-tooltip-position={adjustedPosition}
        data-tooltip-trigger={activeTrigger}
        data-tooltip-disabled={Boolean(disabled)}
        {...(skeleton ? { 'data-skeleton': 'true' } : {})}
      >
        {children}
      </Tag>

      {shouldRender && (
        <Portal>
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={cn(
              styles.tooltip,
              resolveCssModuleKey(styles, adjustedPosition),
              styles.visible,
              overlayClassName
            )}
            style={{ ...calculatedStyle, ...overlayRest, ...colorVar, ...arrowShadowVar }}
            onMouseEnter={activeTrigger === 'hover' ? handlers.handleMouseEnter : undefined}
            onMouseLeave={activeTrigger === 'hover' ? handlers.handleMouseLeave : undefined}
            {...(skeleton ? { 'data-skeleton': 'true' } : {})}
          >
            {skeleton ? <Skeleton variant="text" width="120px" lines={2} /> : content}
          </div>
        </Portal>
      )}
    </>
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
