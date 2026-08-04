// ============================================
// calculatePosition Utility
// ============================================

/**
 * Обобщённая утилита позиционирования для tooltip-like компонентов
 * (Tooltip, Popover, Dropdown, Menu).
 *
 * Поддерживает 12 placement вариантов (MUI/AntD стандарт):
 * - Вертикальные: top-start, top, top-end, bottom-start, bottom, bottom-end
 * - Горизонтальные: left-start, left, left-end, right-start, right, right-end
 *
 * `-start` / `-end` управляют выравниванием вдоль оси триггера:
 * - для top/bottom: start = левый край, end = правый край
 * - для left/right: start = верхний край, end = нижний край
 */

export type Placement =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'left-start'
  | 'left'
  | 'left-end'
  | 'right-start'
  | 'right'
  | 'right-end';

export interface PositionParams {
  placement: Placement;
  triggerRect: DOMRect;
  elementRect: DOMRect;
  viewportWidth: number;
  viewportHeight: number;
  /** Смещение от триггера (px) */
  offset: number;
  /** Авто-смена placement при выходе за границы */
  autoAdjust: boolean;
  /** Минимальный отступ от края viewport (px) */
  edgeOffset?: number;
}

export interface PositionResult {
  top: number;
  left: number;
  adjustedPlacement: Placement;
}

/** Основное направление placement (top/bottom/left/right) */
type Axis = 'top' | 'bottom' | 'left' | 'right';

/** Отделяет направление от align: 'top-start' → { axis: 'top', align: 'start' } */
const parsePlacement = (
  placement: Placement
): { axis: Axis; align: 'start' | 'center' | 'end' } => {
  const [axis, align] = placement.split('-') as [Axis, 'start' | 'center' | 'end' | undefined];
  return { axis, align: align ?? 'center' };
};

/** Собирает placement из направления и align */
const buildPlacement = (axis: Axis, align: 'start' | 'center' | 'end'): Placement => {
  if (align === 'center') return axis as Placement;
  return `${axis}-${align}` as Placement;
};

/**
 * Вычисляет позицию элемента относительно триггера с учётом границ viewport.
 *
 * Pure function для лёгкого тестирования и переиспользования.
 *
 * @param params - Параметры расчёта
 * @returns top/left координаты + скорректированный placement
 *
 * @example
 * ```tsx
 * const { top, left } = calculatePosition({
 *   placement: 'top-start',
 *   triggerRect: trigger.getBoundingClientRect(),
 *   elementRect: tooltip.getBoundingClientRect(),
 *   viewportWidth: window.innerWidth,
 *   viewportHeight: window.innerHeight,
 *   offset: 8,
 *   autoAdjust: true,
 * });
 * ```
 */
export const calculatePosition = ({
  placement,
  triggerRect,
  elementRect,
  viewportWidth,
  viewportHeight,
  offset,
  autoAdjust,
  edgeOffset = 8,
}: PositionParams): PositionResult => {
  const { axis, align } = parsePlacement(placement);

  const base = getBasePosition(axis, align, triggerRect, elementRect, offset);

  if (autoAdjust) {
    const adjusted = autoAdjustPlacement(
      axis,
      align,
      base.top,
      base.left,
      triggerRect,
      elementRect,
      viewportWidth,
      viewportHeight,
      offset
    );
    return {
      top: clampToViewport(adjusted.top, elementRect, viewportHeight, edgeOffset),
      left: clampToViewportX(adjusted.left, elementRect, viewportWidth, edgeOffset),
      adjustedPlacement: buildPlacement(adjusted.axis, adjusted.align),
    };
  }

  return {
    top: clampToViewport(base.top, elementRect, viewportHeight, edgeOffset),
    left: clampToViewportX(base.left, elementRect, viewportWidth, edgeOffset),
    adjustedPlacement: placement,
  };
};

/** Базовая позиция без учёта границ viewport */
const getBasePosition = (
  axis: Axis,
  align: 'start' | 'center' | 'end',
  triggerRect: DOMRect,
  elementRect: DOMRect,
  offset: number
): { top: number; left: number } => {
  let top = 0;
  let left = 0;

  switch (axis) {
    case 'top':
      top = triggerRect.top - elementRect.height - offset;
      left = alignX(align, triggerRect, elementRect);
      break;
    case 'bottom':
      top = triggerRect.bottom + offset;
      left = alignX(align, triggerRect, elementRect);
      break;
    case 'left':
      top = alignY(align, triggerRect, elementRect);
      left = triggerRect.left - elementRect.width - offset;
      break;
    case 'right':
      top = alignY(align, triggerRect, elementRect);
      left = triggerRect.right + offset;
      break;
  }

  return { top, left };
};

/** Горизонтальное выравнивание для top/bottom */
const alignX = (
  align: 'start' | 'center' | 'end',
  triggerRect: DOMRect,
  elementRect: DOMRect
): number => {
  switch (align) {
    case 'start':
      return triggerRect.left;
    case 'end':
      return triggerRect.right - elementRect.width;
    case 'center':
    default:
      return triggerRect.left + (triggerRect.width - elementRect.width) / 2;
  }
};

/** Вертикальное выравнивание для left/right */
const alignY = (
  align: 'start' | 'center' | 'end',
  triggerRect: DOMRect,
  elementRect: DOMRect
): number => {
  switch (align) {
    case 'start':
      return triggerRect.top;
    case 'end':
      return triggerRect.bottom - elementRect.height;
    case 'center':
    default:
      return triggerRect.top + (triggerRect.height - elementRect.height) / 2;
  }
};

/**
 * Авто-коррекция: flip направления при выходе за границы viewport.
 * Выравнивание (align) сохраняется.
 */
const autoAdjustPlacement = (
  axis: Axis,
  align: 'start' | 'center' | 'end',
  top: number,
  left: number,
  triggerRect: DOMRect,
  elementRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  offset: number
): { top: number; left: number; axis: Axis; align: 'start' | 'center' | 'end' } => {
  let newAxis = axis;
  let newTop = top;
  let newLeft = left;

  // Вертикальные flip
  if (axis === 'top' && top < 0) {
    newAxis = 'bottom';
    newTop = triggerRect.bottom + offset;
  } else if (axis === 'bottom' && top + elementRect.height > viewportHeight) {
    newAxis = 'top';
    newTop = triggerRect.top - elementRect.height - offset;
  }

  // Горизонтальные flip
  if (axis === 'left' && left < 0) {
    newAxis = 'right';
    newLeft = triggerRect.right + offset;
  } else if (axis === 'right' && left + elementRect.width > viewportWidth) {
    newAxis = 'left';
    newLeft = triggerRect.left - elementRect.width - offset;
  }

  return { top: newTop, left: newLeft, axis: newAxis, align };
};

/** Ограничение по вертикали (не даём выйти за границы viewport) */
const clampToViewport = (
  top: number,
  elementRect: DOMRect,
  viewportHeight: number,
  edgeOffset: number
): number => {
  const min = edgeOffset;
  const max = viewportHeight - elementRect.height - edgeOffset;
  if (max < min) return min;
  return Math.max(min, Math.min(top, max));
};

/** Ограничение по горизонтали */
const clampToViewportX = (
  left: number,
  elementRect: DOMRect,
  viewportWidth: number,
  edgeOffset: number
): number => {
  const min = edgeOffset;
  const max = viewportWidth - elementRect.width - edgeOffset;
  if (max < min) return min;
  return Math.max(min, Math.min(left, max));
};

export default calculatePosition;
