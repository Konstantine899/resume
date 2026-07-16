// ============================================
// Avatar Component — Public API
// ============================================

export type {
  AvatarAboutProps,
  AvatarHeroProps,
  AvatarProps,
  AvatarSize,
  AvatarVariant,
} from './model/types';

export { Avatar } from './ui/Avatar/Avatar';
export { AvatarAbout } from './ui/AvatarAbout/AvatarAbout';
export { AvatarFallback } from './ui/AvatarFallback/AvatarFallback';
export { AvatarHero } from './ui/AvatarHero/AvatarHero';

// Constants for configuration
export { AVATAR_SIZES, FALLBACK_COLORS } from './model/constants';
