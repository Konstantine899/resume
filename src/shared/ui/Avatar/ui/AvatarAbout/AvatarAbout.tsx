import React from 'react';
import { useAvatar } from '../../hooks/useAvatar';
import { getInitials } from '@/shared/lib/utils';
import styles from './AvatarAbout.module.scss';

export interface AvatarAboutProps {
  alt: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  maxInitials?: number;
}

export const AvatarAbout: React.FC<AvatarAboutProps> = ({
  alt,
  src,
  size = 'lg',
  className = '',
  maxInitials = 2,
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
    <div className={`${styles.avatarAbout} ${styles[size]} ${className}`}>
      <div className={styles.avatarCircle}>
        <div className={styles.avatarInner}>
          {showFallback ? (
            <span className={styles.initial}>{getInitials(alt, { maxInitials })}</span>
          ) : (
            <img
              className={styles.avatarImage}
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
    </div>
  );
};
