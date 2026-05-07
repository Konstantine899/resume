import type { PopoverPosition } from '../../model/types';

interface PositionResult {
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
 * Вычислить позицию попапа относительно триггера
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
  let top = 0;
  let left = 0;
  let adjustedPosition: PopoverPosition | undefined;

  // Центрирование по умолчанию
  const centerAlign = () => {
    top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
    left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
  };

  switch (position) {
    case 'top':
      top = triggerRect.top - popoverRect.height - offset;
      left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
      break;

    case 'bottom':
      top = triggerRect.bottom + offset;
      left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
      break;

    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
      left = triggerRect.left - popoverRect.width - offset;
      break;

    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
      left = triggerRect.right + offset;
      break;

    case 'center':
      centerAlign();
      break;
  }

  // Auto-adjust при выходе за границы (кроме center)
  if (autoAdjust && position !== 'center') {
    // Проверка выхода за верхнюю границу
    if (top < 0 && position === 'top') {
      top = triggerRect.bottom + offset;
      adjustedPosition = 'bottom';
    }

    // Проверка выхода за нижнюю границу
    if (top + popoverRect.height > viewportHeight && position === 'bottom') {
      top = triggerRect.top - popoverRect.height - offset;
      adjustedPosition = 'top';
    }

    // Проверка выхода за левую границу
    if (left < 0 && position === 'left') {
      left = triggerRect.right + offset;
      adjustedPosition = 'right';
    }

    // Проверка выхода за правую границу
    if (left + popoverRect.width > viewportWidth && position === 'right') {
      left = triggerRect.left - popoverRect.width - offset;
      adjustedPosition = 'left';
    }

    // Центрирование если всё равно выходит за границы
    if (top < 0) {
      top = offset;
    }
    if (left < 0) {
      left = offset;
    }
    if (top + popoverRect.height > viewportHeight) {
      top = viewportHeight - popoverRect.height - offset;
    }
    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - offset;
    }
  }

  return {
    top,
    left,
    adjustedPosition,
  };
};
