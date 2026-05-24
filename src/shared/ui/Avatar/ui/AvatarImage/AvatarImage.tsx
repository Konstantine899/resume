import React from 'react';
import { AvatarImageProps } from '../../model/types';
import styles from './AvatarImage.module.scss';

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  size = 'md',
  variant = 'circle',
  className = '',
  onError,
  onLoad,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`${styles.image} ${styles[size]} ${styles[variant]} ${className}`}
      onError={onError}
      onLoad={onLoad}
      loading="lazy"
      decoding="async"
    />
  );
};
