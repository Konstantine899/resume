import { cn } from '@/shared/lib/utils/classNames';
import { memo } from 'react';
import { Portal } from '@/shared/ui/Portal';
import { Skeleton } from '@/shared/ui/Skeleton';
import { resolveCssModuleKey } from '@/shared/lib/utils/resolveCssModuleKey';
import { useTooltipContext } from '../../lib/context/TooltipContext';
import type { TooltipContentComponent, TooltipContentProps } from '../../model/types';
import styles from '../Tooltip.module.scss';

/**
 * TooltipContent — контент тултипа, рендерится в Portal вне иерархии.
 *
 * Потребляет состояние из TooltipProvider:
 * - `isVisibleEnabled` решает, рендерить ли контент (видим и не отключён)
 * - `positioned` — позиция вычислена (переход от hidden к visible без прыжка)
 * - `calculatedStyle` — вычисленная позиция (top/left/maxWidth)
 * - `adjustedPosition` — класс позиции (top/bottom/left/right)
 *
 * `overlayStyle` кастомизирует внешний вид, но никогда не перезаписывает
 * вычисленные позиционные ключи (top/left/maxWidth) — защита от случайной
 * поломки позиционирования.
 *
 * @example
 * ```tsx
 * <Tooltip.Content overlayClassName="custom" overlayStyle={{ color: 'red' }}>
 *   Подсказка
 * </Tooltip.Content>
 * ```
 */
const TooltipContentImpl = memo((props: TooltipContentProps) => {
  const { children, overlayClassName, overlayStyle } = props;

  const {
    calculatedStyle,
    adjustedPosition,
    positioned,
    tooltipRef,
    tooltipId,
    activeTrigger,
    isVisibleEnabled,
    handlers,
    color,
    arrowShadowColor,
    skeleton,
  } = useTooltipContext();

  if (!isVisibleEnabled) return null;

  // Защита позиционных ключей: overlayStyle не должен перезаписывать
  // top/left/maxWidth, вычисленные useTooltip (иначе можно сломать
  // позиционирование тултипа).
  const overlayRest = (() => {
    if (!overlayStyle) return undefined;
    return Object.fromEntries(
      Object.entries(overlayStyle).filter(
        ([key]) => key !== 'top' && key !== 'left' && key !== 'maxWidth'
      )
    );
  })();

  // color prop (AntD-style): задаёт фон тултипа через CSS-переменную, стрелка
  // (`<Tooltip.Arrow />`) наследует её автоматически (var(--tooltip-bg)).
  const colorVar = color ? ({ '--tooltip-bg': color } as React.CSSProperties) : undefined;

  // arrowShadowColor: тень стрелки через CSS-переменную.
  const arrowShadowVar = arrowShadowColor
    ? ({ '--tooltip-arrow-shadow': arrowShadowColor } as React.CSSProperties)
    : undefined;

  return (
    <Portal>
      <div
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        className={cn(
          styles.tooltip,
          styles.compound,
          resolveCssModuleKey(styles, adjustedPosition),
          // Позиция вычислена — включаем видимость и transition после top/left.
          positioned && styles.visible,
          overlayClassName
        )}
        style={{ ...calculatedStyle, ...overlayRest, ...colorVar, ...arrowShadowVar }}
        onMouseEnter={activeTrigger === 'hover' ? handlers.handleMouseEnter : undefined}
        onMouseLeave={activeTrigger === 'hover' ? handlers.handleMouseLeave : undefined}
        aria-busy={skeleton || undefined}
        {...(skeleton ? { 'data-skeleton': 'true' } : {})}
      >
        {skeleton ? <Skeleton variant="text" width="120px" lines={2} /> : children}
      </div>
    </Portal>
  );
});

TooltipContentImpl.displayName = 'TooltipContent';

/**
 * TooltipContent — контент тултипа в Portal.
 */
export const TooltipContent = TooltipContentImpl as unknown as TooltipContentComponent;
