import React from 'react';
import { AvatarHero } from '@/shared/ui/Avatar';

interface HeroAvatarLoadedProps {
  fullName: string;
  src: string;
}

export const HeroAvatarLoaded: React.FC<HeroAvatarLoadedProps> = ({ fullName, src }) => {
  return <AvatarHero alt={fullName} src={src} size="xl" showSkeleton={false} showGlow showRing />;
};

HeroAvatarLoaded.displayName = 'HeroAvatarLoaded';
