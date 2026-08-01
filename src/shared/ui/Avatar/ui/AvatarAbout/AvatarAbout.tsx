// ============================================
// AvatarAbout Component
// ============================================

import React, { useMemo } from 'react';
import { Image } from '@/shared/ui/Image';
import { classNames } from '@/shared/lib/utils/classNames';
import { useAvatar } from '../../lib/hooks/useAvatar';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import type { AvatarAboutProps } from '../../model/types';
import styles from './AvatarAbout.module.scss';

/**
 * AvatarAbout Component — avatar for About section with gradient border
 *
 * Uses shared useAvatar hook for image state management, AvatarFallback for initials.
 *
 * @example
 * // Basic usage
 * ```tsx
 * <AvatarAbout src="/user.jpg" alt="John Doe" size="lg" />
 * ```
 */
export const AvatarAbout = React.memo(
  ({
    alt = 'Avatar placeholder',
    src,
    size = 'lg',
    className = '',
    showSkeleton = true,
    forceLoading = false,
  }: AvatarAboutProps) => {
    const { imageStatus, showFallback, handleLoadSuccess, handleLoadError, avatarWidth } =
      useAvatar({
        src,
        alt,
        size,
        variant: 'circle',
        showSkeleton,
        forceLoading,
      });

    const wrapperClasses = useMemo(
      () => classNames(styles.avatarAbout, styles[size], className),
      [size, className]
    );

    return (
      <div
        className={wrapperClasses}
        role="img"
        aria-label={alt}
        data-state={imageStatus}
        data-size={size}
        data-variant="circle"
      >
        <div className={styles.avatarCircle}>
          <div className={styles.avatarInner}>
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
      </div>
    );
  }
);

AvatarAbout.displayName = 'AvatarAbout';
