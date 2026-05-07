import type { ReactNode } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus' | 'click';

export interface TooltipProps {
  /** Контент тултипа */
  content: ReactNode;
  /** Позиция относительно триггера */
  position?: TooltipPosition;
  /** Триггер активации */
  trigger?: TooltipTrigger;
  /** Задержка показа (мс) */
  showDelay?: number;
  /** Задержка скрытия (мс) */
  hideDelay?: number;
  /** Дочерний элемент */
  children: ReactNode;
  /** Дополнительный класс */
  className?: string;
  /** Отключить тултип */
  disabled?: boolean;
  /** Максимальная ширина */
  maxWidth?: number;
  /** Accessibility description */
  ariaLabel?: string;
  /** Смещение от триггера (px) */
  offset?: number;
  /** Авто-смена позиции при выходе за границы */
  autoAdjust?: boolean;
}
