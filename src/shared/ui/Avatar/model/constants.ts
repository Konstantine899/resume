import { AvatarSize, AvatarStatus, AvatarVariant } from './types';

export const AVATAR_SIZES: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export const AVATAR_RADIUS: Record<AvatarVariant, string> = {
  circle: '50%',
  square: '8px',
};

export const BADGE_SIZES: Record<AvatarSize, number> = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
};

export const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: '#22C55E',
  offline: '#9CA3AF',
  busy: '#EF4444',
  away: '#F59E0B',
};

export const FALLBACK_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FDE3A7',
  '#F5AB35',
  '#E87E04',
  '#D24D57',
  '#663399',
];

export const GROUP_SPACING: Record<AvatarSize, number> = {
  sm: -6,
  md: -8,
  lg: -10,
  xl: -12,
};
