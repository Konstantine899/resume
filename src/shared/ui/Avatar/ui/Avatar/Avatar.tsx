import React, { useState } from 'react';
import { AvatarProps } from '../../model/types';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
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
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!src);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setHasError(false);
    setIsLoading(false);
    onLoad?.();
  };

  const showFallback = !src || hasError;

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
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}

      {heroStyle && showRing && <div className={styles.ring} />}
      {isLoading && <div className={styles.loader} />}
    </div>
  );
};
