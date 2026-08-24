import { cn } from '@/shared/lib/utils/classNames';
import { memo } from 'react';
import { useTooltipContext } from '../../lib/context/TooltipContext';
import type { TooltipArrowComponent, TooltipArrowProps } from '../../model/types';
import styles from '../Tooltip.module.scss';

/**
 * TooltipArrow — стрелка тултипа (compound API).
 *
 * Потребляет `adjustedPosition` из TooltipProvider и позиционируется
 * согласно направлению. Рендерится внутри TooltipContent.
 *
 * @example
 * ```tsx
 * <Tooltip.Content>
 *   Подсказка
 *   <Tooltip.Arrow />
 * </Tooltip.Content>
 * ```
 */
const TooltipArrowImpl = memo((props: TooltipArrowProps) => {
  const { className } = props;
  const { adjustedPosition } = useTooltipContext();

  return (
    <span
      aria-hidden="true"
      data-tooltip-arrow
      data-position={adjustedPosition}
      className={cn(styles.arrow, className)}
    />
  );
});

TooltipArrowImpl.displayName = 'TooltipArrow';

/**
 * TooltipArrow — стрелка тултипа (compound API).
 */
export const TooltipArrow = TooltipArrowImpl as unknown as TooltipArrowComponent;
