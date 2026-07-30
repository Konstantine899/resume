// ============================================
// AvatarHero Component
// ============================================

import React, { useMemo } from 'react';
import { Image } from '@/shared/ui/Image';
import { classNames } from '@/shared/lib/utils/classNames';
import { useAvatar } from '../../lib/hooks/useAvatar';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import type { AvatarHeroProps } from '../../model/types';
import styles from './AvatarHero.module.scss';

/**
 * AvatarHero Component — hero-style avatar with glow and ring effects
 *
 * Uses shared useAvatar hook for image state management.
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
    const { imageStatus, showFallback, handleLoadSuccess, handleLoadError, avatarWidth } =
      useAvatar({
        src,
        alt,
        size,
        variant: 'circle',
        showSkeleton,
        forceLoading,
        showGlow,
        showRing,
        heroStyle: true,
      });

    const wrapperClasses = useMemo(
      () => classNames(styles.avatarHero, styles[size], className),
      [size, className]
    );

    return (
      <div className={wrapperClasses} role="img" aria-label={alt} data-state={imageStatus}>
        {showGlow && <div className={styles.photoGlow} />}
        {showRing && <div className={styles.photoRing} />}

        <div className={styles.photoCircle}>
          <div className={styles.photoInner}>
            {showFallback ? (
              <AvatarFallback name={alt} size={size} variant="circle" fillContainer />
            ) : (
              <Image
                src={src || ''}
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
