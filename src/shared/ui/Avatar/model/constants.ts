import { AvatarSize, AvatarVariant } from './types';

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
