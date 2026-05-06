import type { AvatarProps, AvatarSize, AvatarStatus } from './types';

/**
 * Маппинг размеров аватара в пикселях
 */
export const AVATAR_SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/**
 * Маппинг статусов в цвета (CSS переменные)
 */
export const AVATAR_STATUS_COLORS: Record<AvatarStatus, string> = {
  online: 'var(--success)',
  offline: 'var(--foreground-muted)',
  busy: 'var(--danger)',
  away: 'var(--warning)',
};

/**
 * Маппинг позиций статуса
 */
export const AVATAR_STATUS_POSITIONS: Record<
  NonNullable<AvatarProps['statusPosition']>,
  { top?: string; bottom?: string; left?: string; right?: string }
> = {
  'top-right': { top: '0', right: '0' },
  'bottom-right': { bottom: '0', right: '0' },
  'top-left': { top: '0', left: '0' },
  'bottom-left': { bottom: '0', left: '0' },
};

/**
 * Получить размер в пикселях
 */
export const getSizeInPixels = (size: AvatarSize): number => {
  return AVATAR_SIZES[size] || AVATAR_SIZES.md;
};

/**
 * Получить цвет статуса
 */
export const getStatusColor = (status: AvatarStatus): string => {
  return AVATAR_STATUS_COLORS[status] || AVATAR_STATUS_COLORS.offline;
};
