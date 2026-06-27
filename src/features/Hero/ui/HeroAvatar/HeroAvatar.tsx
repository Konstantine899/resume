import React from 'react';
import { HeroAvatarLoading } from './HeroAvatarLoading';
import { HeroAvatarLoaded } from './HeroAvatarLoaded';
import { HeroAvatarError } from './HeroAvatarError';
import styles from '../Hero.module.scss';

interface HeroAvatarProps {
  state: 'loading' | 'loaded' | 'error';
  fullName: string;
  avatarImage: string;
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({ state, fullName, avatarImage }) => {
  return (
    <div className={styles.rightContent}>
      {state === 'loading' && <HeroAvatarLoading fullName={fullName} />}
      {state === 'loaded' && <HeroAvatarLoaded fullName={fullName} src={avatarImage} />}
      {state === 'error' && <HeroAvatarError fullName={fullName} />}
    </div>
  );
};

HeroAvatar.displayName = 'HeroAvatar';
