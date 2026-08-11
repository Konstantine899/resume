/**
 * WebP/AVIF format detection utility (Senior+ requirement #11)
 * @description Detects browser support for modern image formats via canvas
 */

/**
 * Проверяет поддержку WebP формата
 * @returns true если браузер поддерживает WebP
 */
export function canUseWebp(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const dataUrl = canvas.toDataURL('image/webp');
    return dataUrl.startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Проверяет поддержку AVIF формата
 * @returns true если браузер поддерживает AVIF
 */
export function canUseAvif(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const dataUrl = canvas.toDataURL('image/avif');
    return dataUrl.startsWith('data:image/avif');
  } catch {
    return false;
  }
}

/**
 * Определяет оптимальный формат изображения
 * @returns предпочтительный формат (avif > webp > jpeg)
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (canUseAvif()) return 'avif';
  if (canUseWebp()) return 'webp';
  return 'jpeg';
}

/**
 * Генерирует srcSet для responsive images с разными форматами
 * @param baseUrl - базовый URL без расширения
 * @param formats - массив форматов (по умолчанию все поддерживаемые)
 * @returns массив объектов { srcSet, sizes, type }
 */
export function generateResponsiveSrcSet(
  baseUrl: string,
  formats: Array<'avif' | 'webp' | 'jpeg'> = ['avif', 'webp', 'jpeg']
): Array<{ srcSet: string; sizes: string; type: string }> {
  const supportedFormats = formats.filter((fmt) => {
    if (fmt === 'avif') return canUseAvif();
    if (fmt === 'webp') return canUseWebp();
    return true; // jpeg/png всегда поддерживаются
  });

  return supportedFormats.map((format) => ({
    srcSet: `${baseUrl}.${format} 1x, ${baseUrl}@2x.${format} 2x, ${baseUrl}@3x.${format} 3x`,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    type: `image/${format}`,
  }));
}
