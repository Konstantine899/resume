import { TOOLTIP_CONSTANTS } from '@/shared/ui/Tooltip/model/constants';
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
 * Вычисляет позицию тултипа с учётом границ viewport
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
  let top = 0;
  let left = 0;
  let newPosition = position;

  // Базовое позиционирование
  switch (position) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left - tooltipRect.width - offset;
      break;
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + offset;
      break;
  }

  // Auto-adjust при выходе за границы
  if (autoAdjust) {
    const adjusted = autoAdjustPosition({
      position,
      top,
      left,
      triggerRect,
      tooltipRect,
      viewportWidth,
      viewportHeight,
      offset,
    });

    top = adjusted.top;
    left = adjusted.left;
    newPosition = adjusted.position;
  }

  // Финальная коррекция границ
  left = Math.max(
    TOOLTIP_CONSTANTS.EDGE_OFFSET,
    Math.min(left, viewportWidth - tooltipRect.width - TOOLTIP_CONSTANTS.EDGE_OFFSET)
  );

  return { top, left, adjustedPosition: newPosition };
};

/**
 * Авто-коррекция позиции при выходе за границы viewport
 */
const autoAdjustPosition = ({
  position,
  top,
  left,
  triggerRect,
  tooltipRect,
  viewportWidth,
  viewportHeight,
  offset,
}: {
  position: TooltipPosition;
  top: number;
  left: number;
  triggerRect: DOMRect;
  tooltipRect: DOMRect;
  viewportWidth: number;
  viewportHeight: number;
  offset: number;
}): { top: number; left: number; position: TooltipPosition } => {
  let newPosition = position;
  let newTop = top;
  let newLeft = left;

  // Вертикальная проверка
  if (top < 0 && position === 'top') {
    newPosition = 'bottom';
    newTop = triggerRect.bottom + offset;
  } else if (top + tooltipRect.height > viewportHeight && position === 'bottom') {
    newPosition = 'top';
    newTop = triggerRect.top - tooltipRect.height - offset;
  }

  // Горизонтальная проверка
  if (left < 0 && position === 'left') {
    newPosition = 'right';
    newLeft = triggerRect.right + offset;
  } else if (left + tooltipRect.width > viewportWidth && position === 'right') {
    newPosition = 'left';
    newLeft = triggerRect.left - tooltipRect.width - offset;
  }

  return { top: newTop, left: newLeft, position: newPosition };
};
