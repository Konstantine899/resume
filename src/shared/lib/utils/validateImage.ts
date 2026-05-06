/**
 * Проверить URL изображения на валидность
 *
 * @param url - URL для проверки
 * @returns true если URL валидный
 *
 * @example
 * validateImage('https://example.com/avatar.jpg') // true
 * validateImage('invalid-url') // false
 * validateImage('') // false
 */
export const validateImage = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    // Проверка относительных путей
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
};
