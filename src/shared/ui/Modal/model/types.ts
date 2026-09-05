import type { ReactNode, ElementType } from 'react';
// ============================================
// Modal Types
// ============================================

import type { PolymorphicProps } from '@/shared/lib/types/polymorphic';

// ============================================
// Constants
// ============================================

export const MODAL_SIZES = {
  xs: '360px',
  sm: '400px',
  md: '500px',
  lg: '640px',
  xl: '800px',
  '2xl': '960px',
  '3xl': '1200px',
  full: '100%',
} as const;

export type ModalSize = keyof typeof MODAL_SIZES;

// ============================================
// Interfaces
// ============================================

export interface ModalProps {
  /**
   * Компонент для рендера корневого элемента модалки
   * @default 'div'
   * @description Позволяет изменить HTML-элемент (section, article) или использовать custom component
   * @example <Modal as="section" title="About">...</Modal>
   */
  as?: React.ElementType;

  /**
   * Контент модального окна
   * @required
   */
  children: ReactNode;

  /**
   * Состояние открытия модального окна (controlled)
   * @description Если передан — модалка в controlled режиме
   * @example <Modal isOpen={isOpen} onClose={close}>
   */
  isOpen?: boolean;

  /**
   * Начальное состояние открытия (uncontrolled)
   * @description Используется когда isOpen не передан — модалка сама управляет состоянием
   * @default false
   * @example <Modal defaultOpen onClose={close}>
   */
  defaultOpen?: boolean;

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
   * Поведение скролла
   * @default 'paper'
   * @description 'paper' — скролл внутри модалки (фиксированная высота), 'body' — скролл на body (модалка растёт)
   */
  scroll?: 'paper' | 'body';

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
   * Callback при pointer down на overlay (вне модалки)
   * @description Вызывается ДО onClose. Вызови event.preventDefault() чтобы заблокировать закрытие
   * @example onPointerDownOutside={(e) => { analytics.track('click_outside'); }}
   */
  onPointerDownOutside?: (event: PointerEvent) => void;

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
   * Оставить в DOM при закрытии (для exit animation)
   * @default false
   * @description Когда true — модалка не unmount-ится сразу, а проигрывает scaleOut анимацию. Нужно для close animation
   */
  forceMount?: boolean;

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
   * Ref для фокуса при открытии модалки
   * @description Когда передан, фокус перемещается на этот элемент вместо первого фокусируемого
   * @example initialFocusRef={nameInputRef}
   */
  initialFocusRef?: React.RefObject<HTMLElement>;

  /**
   * Ref для фокуса после закрытия модалки
   * @description Переопределяет restoreFocus — фокус на конкретный элемент (Chakra pattern)
   * @example finalFocusRef={submitButtonRef}
   */
  finalFocusRef?: React.RefObject<HTMLElement>;

  /**
   * Включить trap фокуса (удержание фокуса внутри модалки)
   * @default true
   * @description Если true, клавиша Tab циклически перемещает фокус внутри модалки
   */
  trapFocus?: boolean;

  /**
   * Callback при нажатии ESC
   * @description Вызывается ДО onClose. Вызови event.preventDefault() чтобы заблокировать закрытие
   * @example onEscapeKeyDown={(e) => { if (hasUnsavedChanges) e.preventDefault(); }}
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Custom close icon component
   * @default <X /> (lucide-react)
   * @description Overrides the default X icon in the close button
   * @example <Modal closeIcon={<ArrowLeft />}>...</Modal>
   */
  closeIcon?: ReactNode;

  /**
   * Non-modal режим (панель быстрых действий без блокировки фона)
   * @default true
   * @description Когда false — нет overlay, нет focus trap, нет блокировки скролла, aria-modal="false"
   * @example <Modal modal={false}> — панель справа/снизу без блокировки
   */
  modal?: boolean;

  /**
   * Render the child element as the root (Radix Slot pattern)
   * @default false
   * @description When true, the single child element receives all root props (role, aria-*, ref, etc.)
   * instead of wrapping it. Component and style props are merged onto the child.
   * @example <Modal.Root asChild><section>...</section></Modal.Root>
   */
  asChild?: boolean;
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

  /**
   * Custom close icon component
   * @default <X /> (lucide-react)
   */
  closeIcon?: ReactNode;
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

  /**
   * Custom close icon component
   * @default <X /> (lucide-react)
   */
  closeIcon?: ReactNode;
}

// ============================================
// Alert Preset Types
// ============================================

export type ModalAlertVariant = 'alert' | 'confirm' | 'destructive';

export interface ModalAlertProps {
  /**
   * Состояние открытия
   */
  isOpen: boolean;

  /**
   * Callback при закрытии
   */
  onClose: () => void;

  /**
   * Заголовок алерта
   */
  title: string;

  /**
   * Сообщение алерта
   */
  message: string;

  /**
   * Текст на кнопке подтверждения
   * @default 'OK'
   */
  confirmLabel?: string;

  /**
   * Текст на кнопке отмены
   * @description Если не указан — показывается только confirm (alert mode)
   */
  cancelLabel?: string;

  /**
   * Callback при подтверждении
   */
  onConfirm?: () => void;

  /**
   * Callback при отмене
   */
  onCancel?: () => void;

  /**
   * Вариант алерта
   * @default 'alert'
   */
  variant?: ModalAlertVariant;

  /**
   * Иконка для отображения
   * @description Отображается над заголовком
   * @example <ModalAlert icon={<AlertTriangle />} variant="destructive" />
   */
  icon?: ReactNode;

  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

// ============================================
// Drawer Preset Types
// ============================================

export type ModalDrawerPlacement = 'right' | 'left';

export interface ModalDrawerProps {
  /**
   * Состояние открытия
   */
  isOpen: boolean;

  /**
   * Callback при закрытии
   */
  onClose: () => void;

  /**
   * Заголовок
   */
  title?: string;

  /**
   * Контент
   */
  children: ReactNode;

  /**
   * Размер (ширина) drawer
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Сторона появления
   * @default 'right'
   */
  placement?: ModalDrawerPlacement;

  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

// ============================================
// Form Preset Types
// ============================================

export interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onCancel?: () => void;
  disableSubmit?: boolean;
  className?: string;
}

// ============================================
// Polymorphic Types (shared)
// ============================================

export interface ModalRootOwnProps extends Omit<
  ModalProps,
  'title' | 'footer' | 'showCloseButton'
> {
  children: ReactNode;
}

export type ModalRootProps<C extends ElementType = React.ElementType> = PolymorphicProps<
  C,
  ModalRootOwnProps
>;

// Re-export shared PolymorphicProps for convenience
export type { PolymorphicProps };
