export interface HeroAvatarProps {
  state: 'loading' | 'loaded' | 'error';
  fullName: string;
  avatarImage: string;
  onRetry: () => void;
}

export interface HeroAvatarLoadingProps {
  fullName: string;
}

export interface HeroAvatarLoadedProps {
  fullName: string;
  src: string;
}

export interface HeroAvatarErrorProps {
  onRetry: () => void;
}
