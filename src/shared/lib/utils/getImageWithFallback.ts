interface ImageWithFallbackOptions {
  primary?: string | undefined;
  fallback?: string;
  placeholder?: string;
}

/**
 * Получить URL изображения с fallback цепочкой
 *
 * @param options - Опции с primary и fallback URL
 * @returns Первичный URL или fallback если первичный недоступен
 *
 * @example
 * const src = getImageWithFallback({
 *   primary: user.avatarUrl,
 *   fallback: '/default-avatar.png',
 *   placeholder: '/placeholder.svg'
 * });
 */
export const getImageWithFallback = (options: ImageWithFallbackOptions): string => {
  const { primary, fallback = '/placeholder.svg', placeholder } = options;

  if (!primary) {
    return placeholder || fallback;
  }

  return primary;
};
