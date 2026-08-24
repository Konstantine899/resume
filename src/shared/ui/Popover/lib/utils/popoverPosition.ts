import { calculatePosition, type Placement } from '@/shared/lib/utils/calculatePosition';
import type { PopoverPosition } from '../../model/types';

export interface PositionResult {
  top: number;
  left: number;
  adjustedPosition?: PopoverPosition;
}

interface CalculatePositionParams {
  position: PopoverPosition;
  triggerRect: DOMRect;
  popoverRect: DOMRect;
  viewportWidth: number;
  viewportHeight: number;
  offset: number;
  autoAdjust: boolean;
}

/**
 * Вычислить позицию попапа относительно триггера.
 *
 * Обёртка над обобщённой утилитой `calculatePosition` (shared/lib/utils) —
 * направления top/bottom/left/right делегируются туда (единый источник
 * позиционирования для Tooltip/Popover/Dropdown/Menu).
 *
 * `center` — уникальная фича Popover (центрирование поверх триггера),
 * отсутствует в shared Placement, поэтому обрабатывается локально и
 * исключается из auto-adjust (как было до объединения).
 */
export const calculatePopoverPosition = ({
  position,
  triggerRect,
  popoverRect,
  viewportWidth,
  viewportHeight,
  offset,
  autoAdjust,
}: CalculatePositionParams): PositionResult => {
  if (position === 'center') {
    return {
      top: triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2,
      left: triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2,
    };
  }

  const { top, left, adjustedPlacement } = calculatePosition({
    placement: position as Placement,
    triggerRect,
    elementRect: popoverRect,
    viewportWidth,
    viewportHeight,
    offset,
    autoAdjust,
  });

  // Popover никогда не передаёт `-start`/`-end`, а auto-adjust flip сохраняет
  // align (center), поэтому adjustedPlacement всегда базовое направление.
  return {
    top,
    left,
    adjustedPosition: adjustedPlacement as PopoverPosition,
  };
};
