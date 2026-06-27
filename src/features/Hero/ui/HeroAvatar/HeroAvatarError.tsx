import React from 'react';
import { AvatarHero } from '@/shared/ui/Avatar';

interface HeroAvatarErrorProps {
  fullName: string;
}

export const HeroAvatarError: React.FC<HeroAvatarErrorProps> = ({ fullName }) => {
  return (
    <AvatarHero
      alt={fullName}
      src="invalid-url.jpg"
      size="xl"
      showGlow
      showRing
      showSkeleton={false}
    />
  );
};

HeroAvatarError.displayName = 'HeroAvatarError';
