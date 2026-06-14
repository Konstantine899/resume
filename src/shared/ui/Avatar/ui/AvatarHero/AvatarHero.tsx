import { classNames } from '@/shared/lib/utils/classNames';
import { Skeleton } from '@/shared/ui/Skeleton';
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
  showSkeleton?: boolean;
  forceLoading?: boolean;
  children?: React.ReactNode;
}

export const AvatarHero: React.FC<AvatarHeroProps> = ({
  src,
  alt = 'Avatar',
  size = 'xl',
  className = '',
  showGlow = false,
  showRing = false,
  showSkeleton = true,
  forceLoading = false,
  children,
}) => {
  const { isLoading, hasError, handleError, handleLoad } = useAvatar(src, forceLoading);

  const showFallback = !src || hasError;
  const showSkeletonState = showSkeleton && isLoading && !hasError;

  const handleImageError = React.useCallback(
    (_event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      handleError();
    },
    [handleError]
  );

  const handleImageLoad = React.useCallback(() => {
    handleLoad();
  }, [handleLoad]);

  return (
    <div
      className={classNames(styles.avatarHero, styles[size], className)}
      data-loading={isLoading}
      data-error={hasError}
    >
      {showGlow && <div className={styles.photoGlow} />}
      {showRing && <div className={styles.photoRing} />}

      <div className={styles.photoCircle}>
        {showSkeletonState ? (
          <div className={styles.skeletonWrapper}>
            <Skeleton variant="circular" className={styles.skeleton} />
          </div>
        ) : (
          <div className={styles.photoInner}>
            {showFallback ? (
              <span className={styles.initial}>
                {getInitials(alt, { maxInitials: 1, index: 1 })}
              </span>
            ) : (
              <img
                className={styles.photoImage}
                src={src}
                alt={alt}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
              />
            )}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};
