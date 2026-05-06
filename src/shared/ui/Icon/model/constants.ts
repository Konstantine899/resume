import type { IconColor, IconSize } from './types';

/**
 * Маппинг размеров в пикселях
 */
export const ICON_SIZES: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Маппинг цветов в CSS переменные
 */
export const ICON_COLORS: Record<IconColor, string> = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  foreground: 'var(--foreground)',
  'foreground-muted': 'var(--foreground-muted)',
  inherit: 'currentColor',
};

/**
 * Получить размер в пикселях
 */
export const getSizeInPixels = (size: number | IconSize): number => {
  if (typeof size === 'number') return size;
  return ICON_SIZES[size] || ICON_SIZES.md;
};

/**
 * Получить цвет (CSS переменная или кастомный)
 */
export const getColorValue = (color: string): string => {
  if (color in ICON_COLORS) {
    return ICON_COLORS[color as IconColor];
  }
  return color;
};
