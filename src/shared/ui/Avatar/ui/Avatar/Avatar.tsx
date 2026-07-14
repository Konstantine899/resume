import React, { useCallback, useState } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Image } from '@/shared/ui/Image';

import { AVATAR_SIZES } from '../../model/constants';
import { AvatarProps } from '../../model/types';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import styles from './Avatar.module.scss';

export const Avatar = React.memo(
  ({
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
    heroStyle,
    showGlow,
    showRing,
    children,
  }: AvatarProps) => {
    const normalizedSrc = src === '' ? undefined : src;
    const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const showFallback = (!normalizedSrc && !forceLoading) || imageStatus === 'error';

    const handleLoadSuccess = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageStatus('loaded');
        onLoad?.(event);
      },
      [onLoad]
    );

    const handleLoadError = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageStatus('error');
        onError?.(event);
      },
      [onError]
    );

    const avatarWidth = AVATAR_SIZES[size];

    return (
      <div
        className={classNames(styles.avatar, styles[size], styles[variant], className, {
          [styles.heroStyle]: heroStyle,
        })}
        role="img"
        aria-label={alt}
        data-loading={!showFallback && imageStatus === 'loading'}
        data-error={imageStatus === 'error'}
      >
        {showGlow && <div className={styles.glow} />}
        {showRing && <div className={styles.ring} />}

        {showFallback ? (
          <div className={styles.fallback}>
            {fallback || <AvatarFallback name={alt} size={size} variant={variant} />}
          </div>
        ) : (
          <Image
            src={normalizedSrc || ''}
            alt=""
            decorative
            variant={variant === 'circle' ? 'circular' : 'rounded'}
            width={avatarWidth}
            height={avatarWidth}
            placeholder={showSkeleton ? 'skeleton' : 'color'}
            showPlaceholder={showSkeleton}
            forceLoading={forceLoading}
            className={styles.image}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
          />
        )}

        {children}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
