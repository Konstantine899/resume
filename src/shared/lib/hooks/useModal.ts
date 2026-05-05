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

  // Закрытие по ESC
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  return { isOpen, open, close, toggle };
};

export default useModal;
