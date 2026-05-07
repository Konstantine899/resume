import type { ReactNode } from 'react';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type PopoverSize = 'sm' | 'md' | 'lg' | 'auto';

export interface PopoverProps {
  /** Контент попапа */
  content: ReactNode;
  /** Позиция относительно триггера */
  position?: PopoverPosition;
  /** Размер попапа */
  size?: PopoverSize;
  /** Дочерний элемент (триггер) */
  children: ReactNode;
  /** Дополнительный класс */
  className?: string;
  /** Отключить попап */
  disabled?: boolean;
  /** Закрывать при клике на контент */
  closeOnContentClick?: boolean;
  /** Закрывать при клике вне */
  closeOnClickOutside?: boolean;
  /** Закрывать по ESC */
  closeOnEsc?: boolean;
  /** Смещение от триггера (px) */
  offset?: number;
  /** Auto-adjust позиции */
  autoAdjust?: boolean;
  /** Заголовок */
  title?: ReactNode;
  /** Accessibility label */
  ariaLabel?: string;
}
