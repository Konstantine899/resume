import { classNames } from '@/shared/lib/utils/classNames';
import { Image } from '@/shared/ui/Image';
import { getInitials } from '@/shared/lib/utils';
import React, { useCallback, useState } from 'react';

import { AVATAR_SIZES } from '../../model/constants';
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

export const AvatarAbout = React.memo(
  ({
    alt,
    src,
    size = 'lg',
    className = '',
    maxInitials = 2,
    showSkeleton = true,
    forceLoading = false,
  }: AvatarAboutProps) => {
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
        className={classNames(styles.avatarAbout, styles[size], className)}
        role="img"
        aria-label={alt}
        data-loading={!showFallback && imageStatus === 'loading'}
        data-error={imageStatus === 'error'}
      >
        <div className={styles.avatarCircle}>
          {showFallback ? (
            <div className={styles.avatarInner}>
              <span className={styles.initial}>{getInitials(alt, { maxInitials })}</span>
            </div>
          ) : (
            <div className={styles.avatarInner}>
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
            </div>
          )}
        </div>
      </div>
    );
  }
);

AvatarAbout.displayName = 'AvatarAbout';
