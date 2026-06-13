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
  children,
}) => {
  const { hasError, handleError, handleLoad } = useAvatar();
  const showFallback = !src || hasError;

  const handleImageError = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      handleError();
      onError?.(event);
    },
    [handleError, onError]
  );

  const handleImageLoad = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      handleLoad();
      onLoad?.(event);
    },
    [handleLoad, onLoad]
  );

  return (
    <div className={`${styles.avatar} ${styles[size]} ${styles[variant]} ${className}`}>
      {showFallback ? (
        fallback || <AvatarFallback name={alt} size={size} />
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
      {children}
    </div>
  );
};
