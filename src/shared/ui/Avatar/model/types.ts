export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type AvatarBadgeVariant = 'dot' | 'number' | 'icon';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  fallback?: React.ReactNode;
  className?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  heroStyle?: boolean;
  showGlow?: boolean;
  showRing?: boolean;
  showSkeleton?: boolean;
  forceLoading?: boolean;
  children?: React.ReactNode;
}

export interface AvatarFallbackProps {
  name?: string;
  size?: AvatarSize;
  maxInitials?: number;
  className?: string;
}

export interface AvatarBadgeProps {
  status?: AvatarStatus;
  variant?: AvatarBadgeVariant;
  count?: number;
  className?: string;
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  variant?: AvatarVariant;
  className?: string;
}

export interface AvatarImageProps {
  src: string;
  alt: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  className?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export interface AvatarStatusProps {
  status: AvatarStatus;
  className?: string;
}

export interface AvatarHeroProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
  showRing?: boolean;
  maxInitials?: number;
  children?: React.ReactNode;
}

export interface AvatarAboutProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  maxInitials?: number;
}
