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
  /**
   * Контент модального окна
   * @required
   */
  children: ReactNode;

  /**
   * Состояние открытия модального окна
   * @required
   */
  isOpen: boolean;

  /**
   * Callback при закрытии модального окна
   * @required
   */
  onClose: () => void;

  /**
   * Заголовок модального окна
   * @description Отображается в шапке модального окна
   */
  title?: string;

  /**
   * Подзаголовок (дополнительное описание)
   * @description Отображается под заголовком меньшим шрифтом
   */
  subtitle?: string;

  /**
   * Футер с кнопками действий
   * @description Обычно содержит кнопки "Сохранить" и "Отмена"
   */
  footer?: ReactNode;

  /**
   * Размер модального окна
   * @default 'md'
   * @description Предопределённые размеры: sm (400px), md (500px), lg (640px), xl (800px), full (100%)
   */
  size?: ModalSize;

  /**
   * Показывать затемняющий overlay
   * @default true
   */
  overlay?: boolean;

  /**
   * Закрытие по клику на overlay
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Закрытие по нажатию ESC
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Блокировка скролла body при открытом модальном окне
   * @default true
   */
  blockScroll?: boolean;

  /**
   * Дополнительные CSS-классы
   */
  className?: string;

  /**
   * Показывать кнопку закрытия (крестик)
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * ARIA label для доступности
   * @default 'Modal dialog'
   */
  ariaLabel?: string;

  /**
   * Отключить анимацию появления
   * @default false
   */
  disableAnimation?: boolean;

  /**
   * Callback вызывается после завершения анимации открытия
   * @description Полезно для фокуса или аналитики
   */
  onOpened?: () => void;

  /**
   * Callback вызывается после завершения анимации закрытия
   * @description Полезно для очистки состояния или аналитики
   */
  onClosed?: () => void;

  /**
   * Разрешает или запрещает закрытие модального окна
   * @default true
   * @description Может быть булевым значением или функцией, возвращающей boolean
   * @example canClose={false} — запретить закрытие
   * @example canClose={() => !hasUnsavedChanges} — запретить при несохранённых изменениях
   */
  canClose?: boolean | (() => boolean);

  /**
   * Автоматический фокус на первый фокусируемый элемент
   * @default true
   * @description Если true, фокус перемещается на первый интерактивный элемент внутри модалки
   */
  autoFocus?: boolean;

  /**
   * Возвращать фокус на предыдущий элемент при закрытии
   * @default true
   */
  restoreFocus?: boolean;

  /**
   * Включить trap фокуса (удержание фокуса внутри модалки)
   * @default true
   * @description Если true, клавиша Tab циклически перемещает фокус внутри модалки
   */
  trapFocus?: boolean;
}

// ============================================
// Sub-components Props
// ============================================

export interface ModalHeaderProps {
  /**
   * Заголовок модального окна
   */
  title?: string;

  /**
   * Подзаголовок
   */
  subtitle?: string;

  /**
   * Показывать кнопку закрытия
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Callback при закрытии
   */
  onClose: () => void;

  /**
   * ID заголовка для aria-labelledby
   */
  titleId?: string;

  /**
   * ID подзаголовка для aria-describedby
   */
  subtitleId?: string;
}

export interface ModalContentProps {
  /**
   * Контент модального окна
   */
  children: ReactNode;

  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

export interface ModalFooterProps {
  /**
   * Контент футера (кнопки)
   */
  children: ReactNode;

  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

export interface ModalCloseButtonProps {
  /**
   * Callback при клике
   */
  onClose: () => void;

  /**
   * ARIA label
   * @default 'Закрыть модальное окно'
   */
  ariaLabel?: string;
}

export interface ModalRootProps extends Omit<ModalProps, 'title' | 'footer' | 'showCloseButton'> {
  /**
   * Контент (обычно Modal.Header + Modal.Content + Modal.Footer)
   */
  children: ReactNode;
}
