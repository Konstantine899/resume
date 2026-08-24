/**
 * Получить инициалы из полного имени
 *
 * @param fullName - Полное имя (например, "Иван Петров" или "John Doe")
 * @param options - Опции для кастомизации
 * @param options.maxInitials - Максимальное количество инициалов для обработки (по умолчанию 2)
 * @param options.index - Получить конкретный индекс (0-based, опционально)
 * @returns Строка с инициалами или один символ по индексу
 *
 * @example
 * getInitials("Иван Петров") // "ИП"
 * getInitials("Иван Петров", { index: 0 }) // "И"
 * getInitials("Иван Петров", { index: 1 }) // "П"
 * getInitials("Иван Петров Сидоров", { maxInitials: 3 }) // "ИПС"
 * getInitials("Иван Петров", { maxInitials: 1, index: 1 }) // "П" (игнорирует maxInitials для индекса)
 */
export const getInitials = (
  fullName: string,
  options: {
    maxInitials?: number;
    index?: number;
  } = {}
): string => {
  const { maxInitials = 2, index } = options;

  // Валидация входных данных
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }

  // Обработка имени: trim, split по пробелам, фильтрация пустых строк
  const names = fullName
    .trim()
    .split(/\s+/)
    .filter((name) => name.length > 0);

  // Получаем ВСЕ инициалы из имён
  const allInitials = names.map((name) => name[0].toUpperCase()).join('');

  // Если указан индекс - возвращаем конкретный символ (игнорируя maxInitials)
  if (index !== undefined) {
    return allInitials.charAt(index) || '';
  }

  // Если индекс не указан - ограничиваем maxInitials
  return allInitials.slice(0, maxInitials);
};
