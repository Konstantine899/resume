import { calculatePosition } from '@/shared/lib/utils/calculatePosition';
import type { TooltipPosition } from '@/shared/ui/Tooltip/model/types';

export interface PositionCalculation {
  top: number;
  left: number;
  adjustedPosition?: TooltipPosition;
}

interface PositionCalculationParams {
  position: TooltipPosition;
  triggerRect: DOMRect;
  tooltipRect: DOMRect;
  viewportWidth: number;
  viewportHeight: number;
  offset: number;
  autoAdjust: boolean;
}

/**
 * Вычисляет позицию тултипа с учётом границ viewport.
 *
 * Обёртка над обобщённой утилитой `calculatePosition` (shared/lib/utils) —
 * сохраняет имя `calculateTooltipPosition` для обратной совместимости,
 * но поддерживает все 12 placement вариантов (top-start, top-end, etc.).
 *
 * Pure function для лёгкого тестирования
 */
export const calculateTooltipPosition = ({
  position,
  triggerRect,
  tooltipRect,
  viewportWidth,
  viewportHeight,
  offset,
  autoAdjust,
}: PositionCalculationParams): PositionCalculation => {
  const { top, left, adjustedPlacement } = calculatePosition({
    placement: position,
    triggerRect,
    elementRect: tooltipRect,
    viewportWidth,
    viewportHeight,
    offset,
    autoAdjust,
  });

  return { top, left, adjustedPosition: adjustedPlacement };
};
