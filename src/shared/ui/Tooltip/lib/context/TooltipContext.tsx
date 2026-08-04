/* eslint-disable react-refresh/only-export-components */
import { createContext, memo, useContext } from 'react';
import type { TooltipContextValue, TooltipProviderProps } from '../../model/types';
import { useTooltip } from '../hooks/useTooltip';

/**
 * React context, который связывает TooltipProvider (состояние) с compound
 * частями: TooltipTrigger, TooltipContent, TooltipArrow.
 *
 * Паттерн: Radix/shadcn compound — Provider владеет состоянием через useTooltip,
 * части потребляют его. Монолитный Tooltip — удобная обёртка над этим же API.
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
  });

  const activeTrigger = trigger ?? 'hover';

  const value: TooltipContextValue = {
    ...state,
    activeTrigger,
    disabled: Boolean(disabled),
    skeleton: Boolean(skeleton),
    color,
    arrowShadowColor,
  };

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
});

TooltipProvider.displayName = 'TooltipProvider';

/**
 * Значение по умолчанию для частей, отрендеренных вне Provider:
 * noop-состояние — Trigger рендерится без поведения, Content рендерит null.
 * Это позволяет безопасно использовать части вне Provider (Storybook,
 * изоляция компонентов) без падения.
 */
const NOOP_CONTEXT: TooltipContextValue = {
  isVisible: false,
  calculatedStyle: {},
  adjustedPosition: 'top',
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
  shouldRender: false,
};

/**
 * Хук доступа к состоянию Tooltip. Должен вызываться внутри TooltipProvider.
 * Вне Provider возвращает noop-значение (компоненты не падают).
 */
export const useTooltipContext = (): TooltipContextValue => {
  const ctx = useContext(TooltipContext);
  return ctx ?? NOOP_CONTEXT;
};
