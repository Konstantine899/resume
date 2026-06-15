import React from 'react';
// FSD-compliant: Skeleton is in shared/ui (same layer)
import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames } from '@/shared/lib/utils/classNames';

import { SIZE_MAP } from '../../model/constants';
import { AvatarProps } from '../../model/types';
import { useAvatar } from '../../hooks/useAvatar';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import { AvatarImage } from '../AvatarImage/AvatarImage';
import styles from './Avatar.module.scss';

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
  const normalizedSrc = src === '' ? undefined : src;
  const { isLoading, hasError, handleError, handleLoad } = useAvatar(
    normalizedSrc ?? '',
    forceLoading
  );

  const showFallback = !normalizedSrc || hasError;
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
      role="img"
      aria-label={alt}
      data-loading={isLoading}
      data-error={hasError}
    >
      {showSkeletonState ? (
        <div className={styles.skeletonWrapper}>
          <Skeleton
            variant="circular"
            width={SIZE_MAP[size]}
            height={SIZE_MAP[size]}
            className={styles.skeleton}
          />
        </div>
      ) : showFallback ? (
        fallback || <AvatarFallback name={alt} size={size} />
      ) : (
        <AvatarImage
          src={normalizedSrc}
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
