// ============================================
// Modal Types
// ============================================

import type { ReactNode } from 'react';

// ============================================
// Constants
// ============================================

export const MODAL_SIZES = {
  sm: '400px',
  md: '500px',
  lg: '640px',
  xl: '800px',
  full: '100%',
} as const;

export type ModalSize = keyof typeof MODAL_SIZES;

// ============================================
// Interfaces
// ============================================

export interface ModalProps {
  /** Контент модального окна */
  children: ReactNode;

  /** Состояние открытия */
  isOpen: boolean;

  /** Callback при закрытии */
  onClose: () => void;

  /** Заголовок */
  title?: string;

  /** Подзаголовок */
  subtitle?: string;

  /** Футер с кнопками */
  footer?: ReactNode;

  /** Размер модального окна */
  size?: ModalSize;

  /** Показывать overlay */
  overlay?: boolean;

  /** Закрытие по клику на overlay */
  closeOnOverlayClick?: boolean;

  /** Закрытие по ESC */
  closeOnEsc?: boolean;

  /** Блокировка скролла body */
  blockScroll?: boolean;

  /** Дополнительные классы */
  className?: string;

  /** Показывать кнопку закрытия */
  showCloseButton?: boolean;

  /** ARIA label */
  ariaLabel?: string;

  /** Отключить анимацию */
  disableAnimation?: boolean;
}
