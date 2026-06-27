import { classNames } from '@/shared/lib/utils/classNames';
import { AvatarSpinner } from '../AvatarSpinner/AvatarSpinner';
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

export const AvatarHero = React.memo(
  ({
    src,
    alt = 'Avatar',
    size = 'xl',
    className = '',
    showGlow = false,
    showRing = false,
    showSkeleton = true,
    forceLoading = false,
    children,
  }: AvatarHeroProps) => {
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
        role="img"
        aria-label={alt}
        data-loading={isLoading}
        data-error={hasError}
      >
        {showGlow && <div className={styles.photoGlow} />}
        {showRing && <div className={styles.photoRing} />}

        <div className={styles.photoCircle}>
          <div className={styles.photoInner}>
            {showSkeletonState ? (
              <div className={styles.skeletonWrapper}>
                <AvatarSpinner size={size} />
              </div>
            ) : showFallback ? (
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
        </div>

        {children}
      </div>
    );
  }
);

AvatarHero.displayName = 'AvatarHero';
