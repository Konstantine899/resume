import React from 'react';
import { useAvatar } from '../../hooks/useAvatar';
import { AvatarProps } from '../../model/types';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import { AvatarImage } from '../AvatarImage/AvatarImage';
import styles from './Avatar.module.scss';

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  variant = 'circle',
  fallback,
  className = '',
  onError,
  onLoad,
  heroStyle = false,
  showGlow = false,
  showRing = false,
  children,
}) => {
  const { hasError, handleError, handleLoad } = useAvatar(); // Убираем isLoading
  const showFallback = !src || hasError;

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    handleError();
    onError?.(event);
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    handleLoad();
    onLoad?.(event);
  };

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${styles[variant]} ${heroStyle ? styles.heroStyle : ''} ${className}`}
    >
      {heroStyle && showGlow && <div className={styles.glow} />}

      {showFallback ? (
        fallback ||
        (heroStyle ? (
          <div className={styles.image}>
            <span className={styles.initial}>{alt.charAt(0).toUpperCase()}</span>
          </div>
        ) : (
          <AvatarFallback name={alt} size={size} />
        ))
      ) : (
        <AvatarImage
          src={src}
          alt={alt}
          size={size}
          variant={variant}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {heroStyle && showRing && <div className={styles.ring} />}
      {children}
    </div>
  );
};
