/**
 * Создать debounced версию функции
 *
 * Возвращает функцию с методом `cancel`, позволяющим отменить ожидающий
 * вызов до истечения `wait` (например, в cleanup useEffect при unmount).
 *
 * @param func - Функция для debouncing
 * @param wait - Время ожидания в мс
 * @returns Debounced функция с методом cancel
 *
 * @example
 * const search = debounce((query) => fetchResults(query), 300);
 * search('react');
 * search.cancel(); // отменить ожидающий вызов
 */
export type DebouncedFunction<T extends (...args: never[]) => unknown> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};

export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): DebouncedFunction<T> => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };

  debounced.cancel = (): void => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

export default debounce;
