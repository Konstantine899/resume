import React from 'react';
import { AvatarHero } from '@/shared/ui/Avatar';

interface HeroAvatarLoadingProps {
  fullName: string;
}

export const HeroAvatarLoading: React.FC<HeroAvatarLoadingProps> = ({ fullName }) => {
  return <AvatarHero alt={fullName} size="xl" forceLoading showSkeleton showGlow showRing />;
};

HeroAvatarLoading.displayName = 'HeroAvatarLoading';
