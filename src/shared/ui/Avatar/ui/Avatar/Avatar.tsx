import { classNames } from '@/shared/lib/utils/classNames';

import React from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';

import { useAvatar } from '../../hooks/useAvatar';
import { AvatarProps } from '../../model/types';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import { AvatarImage } from '../AvatarImage/AvatarImage';
import styles from './Avatar.module.scss';

const sizeMap: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: '32px',
  md: '48px',
  lg: '64px',
  xl: '96px',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  variant = 'circle',
  fallback,
  showSkeleton = true,
  forceLoading = false,
  className = '',
  onError,
  onLoad,
  children,
}) => {
  const { isLoading, hasError, handleError, handleLoad } = useAvatar(src, forceLoading);

  const showFallback = !src || hasError;
  const showSkeletonState = showSkeleton && isLoading && !hasError;

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
    <div
      className={classNames(styles.avatar, styles[size], styles[variant], className)}
      data-loading={isLoading}
      data-error={hasError}
    >
      {showSkeletonState ? (
        <div className={styles.skeletonWrapper}>
          <Skeleton
            variant="circular"
            width={sizeMap[size]}
            height={sizeMap[size]}
            className={styles.skeleton}
          />
        </div>
      ) : showFallback ? (
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
