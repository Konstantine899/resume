/* eslint-disable react-refresh/only-export-components */
import { createContext, memo, useContext, useMemo } from 'react';
import type { TooltipContextValue, TooltipProviderProps } from '../../model/types';
import { useTooltip } from '../hooks/useTooltip';

/**
 * React context, который связывает TooltipProvider (состояние) с compound
 * частями: TooltipTrigger, TooltipContent, TooltipArrow.
 *
 * Паттерн: Radix/shadcn compound — Provider владеет состоянием через useTooltip,
 * части потребляют его. Монолитный Tooltip — обёртка над этим же API.
 */
export const TooltipContext = createContext<TooltipContextValue | null>(null);

/**
 * TooltipProvider — владеет состоянием тултипа (useTooltip) и предоставляет
 * его через контекст compound частям.
 *
 * @example
 * ```tsx
 * <Tooltip.Provider position="top">
 *   <Tooltip.Trigger asChild>
 *     <button>Hover</button>
 *   </Tooltip.Trigger>
 *   <Tooltip.Content>
 *     Подсказка
 *     <Tooltip.Arrow />
 *   </Tooltip.Content>
 * </Tooltip.Provider>
 * ```
 */
export const TooltipProvider = memo((props: TooltipProviderProps) => {
  const {
    children,
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
  } = props;

  const state = useTooltip({
    position,
    trigger,
    showDelay,
    hideDelay,
    disabled,
    offset,
    maxWidth,
    autoAdjust,
    color,
    arrowShadowColor,
  });

  const activeTrigger = trigger ?? 'hover';

  const value = useMemo<TooltipContextValue>(
    () => ({
      ...state,
      activeTrigger,
      disabled: Boolean(disabled),
      skeleton: Boolean(skeleton),
      color,
      arrowShadowColor,
    }),
    [state, activeTrigger, disabled, skeleton, color, arrowShadowColor]
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
});

TooltipProvider.displayName = 'TooltipProvider';

/**
 * Noop-значение для частей, отрендерированных вне Provider:
 * Trigger рендерится без поведения, Content рендерит null.
 * Это позволяет безопасно использовать части вне Provider (Storybook,
 * изоляция компонентов) без падения.
 *
 * Замемоизирован — один и тот же объект на все вызовы, чтобы избежать
 * лишних ре-рендеров и сохранять стабильные refs.
 */
const createNoopContext = (): TooltipContextValue => ({
  isVisible: false,
  calculatedStyle: {},
  adjustedPosition: 'top',
  positioned: false,
  triggerRef: { current: null },
  tooltipRef: { current: null },
  tooltipId: '',
  activeTrigger: 'hover',
  disabled: false,
  skeleton: false,
  color: undefined,
  arrowShadowColor: undefined,
  handlers: {
    handleMouseEnter: () => undefined,
    handleMouseLeave: () => undefined,
    handleFocus: () => undefined,
    handleBlur: () => undefined,
    handleClick: () => undefined,
    handleKeyDown: () => undefined,
  },
  isVisibleEnabled: false,
});

/**
 * Замемоизированный noop контекст — один и тот же объект на все вызовы.
 */
const noopContext = (() => createNoopContext())();

/**
 * Хук доступа к состоянию Tooltip. Должен вызываться внутри TooltipProvider.
 * Вне Provider возвращает noop-значение (компоненты не падают).
 */
export const useTooltipContext = (): TooltipContextValue => {
  const ctx = useContext(TooltipContext);
  return ctx ?? noopContext;
};
