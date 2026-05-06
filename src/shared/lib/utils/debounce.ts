/**
 * Создать debounced версию функции
 *
 * @param func - Функция для debouncing
 * @param wait - Время ожидания в мс
 * @returns Debounced функция
 *
 * @example
 * const search = debounce((query) => fetchResults(query), 300);
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};
