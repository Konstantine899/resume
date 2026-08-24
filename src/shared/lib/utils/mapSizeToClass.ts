/**
 * Маппинг размеров с цифрами в CSS-классы
 * Решает проблему с классами, начинающимися с цифры (2xl, 3xl, etc.)
 *
 * @example
 * ```ts
 * mapSizeToClass('xs')    // 'xs'
 * mapSizeToClass('2xl')   // 'size-2xl'
 * mapSizeToClass('5xl')   // 'size-5xl'
 * ```
 */
export const mapSizeToClass = (size: string): string => {
  // Если размер начинается с цифры, добавляем префикс 'size-'
  if (/^\d/.test(size)) {
    return `size-${size}`;
  }

  return size;
};

/**
 * Алиас для mapSizeToClass
 */
export const getSizeClass = mapSizeToClass;
