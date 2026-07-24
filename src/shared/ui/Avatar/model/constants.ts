import type { AvatarSize } from './types';

export const AVATAR_SIZES: Record<AvatarSize, number> = {
  sm: 100,
  md: 200,
  lg: 300,
  xl: 300,
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

/**
 * Consolidated Avatar constants
 */
export const AVATAR_CONSTANTS = {
  SIZES: AVATAR_SIZES,
  FALLBACK_COLORS,
} as const;
