import { classNames } from '@/shared/lib/utils/classNames';
import { Image } from '@/shared/ui/Image';
import { getInitials } from '@/shared/lib/utils';
import React, { useCallback, useState } from 'react';

import { AVATAR_SIZES } from '../../model/constants';
import { AvatarSize } from '../../model/types';
import styles from './AvatarHero.module.scss';

export interface AvatarHeroProps {
  src?: string;
  alt: string;
  size?: AvatarSize;
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
    const normalizedSrc = src === '' ? undefined : src;
    const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const showFallback = (!normalizedSrc && !forceLoading) || imageStatus === 'error';
    const avatarWidth = AVATAR_SIZES[size];

    const handleLoadSuccess = useCallback(() => {
      setImageStatus('loaded');
    }, []);

    const handleLoadError = useCallback(() => {
      setImageStatus('error');
    }, []);

    return (
      <div
        className={classNames(styles.avatarHero, styles[size], className)}
        role="img"
        aria-label={alt}
        data-loading={!showFallback && imageStatus === 'loading'}
        data-error={imageStatus === 'error'}
      >
        {showGlow && <div className={styles.photoGlow} />}
        {showRing && <div className={styles.photoRing} />}

        <div className={styles.photoCircle}>
          <div className={styles.photoInner}>
            {showFallback ? (
              <span className={styles.initial}>
                {getInitials(alt, { maxInitials: 1, index: 1 })}
              </span>
            ) : (
              <Image
                src={normalizedSrc || 'force.jpg'}
                alt=""
                decorative
                variant="circular"
                width={avatarWidth}
                height={avatarWidth}
                placeholder={showSkeleton ? 'skeleton' : 'color'}
                showPlaceholder={showSkeleton}
                forceLoading={forceLoading}
                onLoadSuccess={handleLoadSuccess}
                onLoadError={handleLoadError}
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
