// ============================================
// AvatarHero Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { Image } from '@/shared/ui/Image';
import { getInitials } from '@/shared/lib/utils';
import React from 'react';
import { useImageStatus } from '@/shared/lib/hooks/useImageStatus';

import { AVATAR_SIZES } from '../../model/constants';
import { AvatarHeroProps } from '../../model/types';
import styles from './AvatarHero.module.scss';

/**
 * AvatarHero Component — hero-style avatar with glow and ring effects
 *
 * @example
 * // Basic usage
 * ```tsx
 * <AvatarHero src="/user.jpg" alt="John Doe" size="xl" />
 * ```
 *
 * @example
 * // With glow and ring
 * ```tsx
 * <AvatarHero src="/user.jpg" alt="John Doe" showGlow showRing />
 * ```
 */
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

    // Use custom hook for image state management (eliminates duplication)
    const { imageStatus, showFallback, handleLoadSuccess, handleLoadError } = useImageStatus(
      forceLoading,
      normalizedSrc,
      undefined,
      undefined
    );

    const avatarWidth = AVATAR_SIZES[size];

    return (
      <div
        className={classNames(styles.avatarHero, styles[size], className)}
        role="img"
        aria-label={alt}
        data-state={imageStatus}
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
                src={normalizedSrc || ''}
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
