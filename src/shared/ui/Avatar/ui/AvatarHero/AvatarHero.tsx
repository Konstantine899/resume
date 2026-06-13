import React from 'react';
import { useAvatar } from '../../hooks/useAvatar';
import { getInitials } from '@/shared/lib/utils';
import styles from './AvatarHero.module.scss';

export interface AvatarHeroProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
  showRing?: boolean;
  children?: React.ReactNode;
}

export const AvatarHero: React.FC<AvatarHeroProps> = ({
  src,
  alt = 'Avatar',
  size = 'xl',
  className = '',
  showGlow = false,
  showRing = false,
  children,
}) => {
  const { hasError, handleError } = useAvatar();
  const showFallback = !src || hasError;

  const handleImageError = React.useCallback(
    (_event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      handleError();
    },
    [handleError]
  );

  return (
    <div className={`${styles.avatarHero} ${styles[size]} ${className}`}>
      {showGlow && <div className={styles.photoGlow} />}
      {showRing && <div className={styles.photoRing} />}

      <div className={styles.photoCircle}>
        <div className={styles.photoInner}>
          {showFallback ? (
            <span className={styles.initial}>{getInitials(alt, { maxInitials: 1, index: 1 })}</span>
          ) : (
            <img
              className={styles.photoImage}
              src={src}
              alt={alt}
              onError={handleImageError}
              loading="lazy"
              decoding="async"
              crossOrigin="anonymous"
            />
          )}
        </div>
      </div>

      {children}
    </div>
  );
};
