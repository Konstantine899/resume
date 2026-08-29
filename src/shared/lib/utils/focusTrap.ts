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
  if (focusableElements.length === 0) return () => {};

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    // Re-query on every Tab so dynamically added/removed children are respected.
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Если Shift+Tab на первом элементе → переходим на последний
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    }
    // Если Tab на последнем элементе → переходим на первый
    else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
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
