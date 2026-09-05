// ============================================
// Avatar Component — Public API
// ============================================

export type {
  AvatarAboutProps,
  AvatarHeroProps,
  AvatarProps,
  AvatarOwnProps,
  AvatarSize,
  AvatarVariant,
} from './model/types';

export { Avatar } from './ui/Avatar/Avatar';
export { AvatarAbout } from './ui/AvatarAbout/AvatarAbout';
export { AvatarFallback } from './ui/AvatarFallback/AvatarFallback';
export { AvatarHero } from './ui/AvatarHero/AvatarHero';

// New compound components
export { AvatarImage } from './ui/AvatarImage/AvatarImage';
export type { AvatarImageProps } from './ui/AvatarImage/AvatarImage';
export { AvatarBadge } from './ui/AvatarBadge/AvatarBadge';
export type { AvatarBadgeProps, AvatarBadgeStatus } from './ui/AvatarBadge/AvatarBadge';
export { AvatarGroup } from './ui/AvatarGroup/AvatarGroup';
export type { AvatarGroupProps } from './ui/AvatarGroup/AvatarGroup';

// Hook
export { useAvatar } from './lib/hooks/useAvatar';
export type { UseAvatarOptions, UseAvatarReturn } from './lib/hooks/useAvatar';

// Constants for configuration
export { AVATAR_SIZES, FALLBACK_COLORS, AVATAR_CONSTANTS } from './model/constants';
export { validateAvatarProps } from './lib/utils/validateAvatarProps';
