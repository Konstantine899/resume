import { classNames } from '@/shared/lib/utils/classNames';
import { Skeleton } from '@/shared/ui/Skeleton';
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
  showSkeleton?: boolean;
  forceLoading?: boolean;
}

export const AvatarAbout: React.FC<AvatarAboutProps> = ({
  alt,
  src,
  size = 'lg',
  className = '',
  maxInitials = 2,
  showSkeleton = true,
  forceLoading = false,
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
      className={classNames(styles.avatarAbout, styles[size], className)}
      data-loading={isLoading}
      data-error={hasError}
    >
      <div className={styles.avatarCircle}>
        {showSkeletonState ? (
          <div className={styles.skeletonWrapper}>
            <Skeleton variant="circular" className={styles.skeleton} />
          </div>
        ) : (
          <div className={styles.avatarInner}>
            {showFallback ? (
              <span className={styles.initial}>{getInitials(alt, { maxInitials })}</span>
            ) : (
              <img
                className={styles.avatarImage}
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
    </div>
  );
};
