/**
 * Focus Trap Utility
 * Удерживает фокус внутри указанного элемента (для модальных окон, dropdown и т.д.)
 */

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

/**
 * Находит все фокусируемые элементы внутри контейнера
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const elements = container.querySelectorAll(FOCUSABLE_SELECTORS);
  return Array.from(elements) as HTMLElement[];
};

/**
 * Включает trap фокуса внутри элемента
 * @param container - Элемент, внутри которого нужно удерживать фокус
 * @returns Функция для отключения trap
 *
 * @example
 * const untrap = focusTrap(modalElement);
 * // ... позже
 * untrap();
 */
export const focusTrap = (container: HTMLElement | null): (() => void) => {
  if (!container) return () => {};

  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    // Если Shift+Tab на первом элементе → переходим на последний
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
    // Если Tab на последнем элементе → переходим на первый
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Возвращаем функцию очистки
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Находит первый видимый фокусируемый элемент
 */
export const getFirstFocusableElement = (container: HTMLElement): HTMLElement | null => {
  const focusableElements = getFocusableElements(container);

  for (const element of focusableElements) {
    // Проверяем, что элемент виден
    const style = window.getComputedStyle(element);
    if (style.display !== 'none' && style.visibility !== 'hidden') {
      return element;
    }
  }

  return null;
};
