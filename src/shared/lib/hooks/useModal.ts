// ============================================
// useModal Hook
// ============================================

import { useCallback, useEffect, useState } from 'react';

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Хук для управления состоянием модального окна
 *
 * @param initialState - Начальное состояние (по умолчанию false)
 * @returns Объект с состоянием и методами управления
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useModal();
 *
 * return (
 *   <>
 *     <Button onClick={open}>Открыть</Button>
 *     <Modal isOpen={isOpen} onClose={close}>
 *       Контент
 *     </Modal>
 *   </>
 * );
 * ```
 */
export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Блокировка скролла body при открытом модалке
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }

    return undefined;
  }, [isOpen]);

  // NOTE: ESC-обработка живёт в ModalRoot (useModalRoot) с учётом
  // closeOnEsc / canClose. НЕ дублируем её здесь — иначе useModal() +
  // <Modal closeOnEsc={false}> закрывался бы по ESC вопреки настройке.

  return { isOpen, open, close, toggle };
};

export default useModal;
