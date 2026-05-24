export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'square';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  fallback?: React.ReactNode;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  heroStyle?: boolean;
  showGlow?: boolean;
  showRing?: boolean;
}

export interface AvatarFallbackProps {
  name?: string;
  size?: AvatarSize;
  className?: string;
}
