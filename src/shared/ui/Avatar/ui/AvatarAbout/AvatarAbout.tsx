// ============================================
// AvatarAbout Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { Image } from '@/shared/ui/Image';
import { getInitials } from '@/shared/lib/utils';
import React from 'react';
import { useImageStatus } from '@/shared/lib/hooks/useImageStatus';

import { AVATAR_SIZES } from '../../model/constants';
import { AvatarAboutProps } from '../../model/types';
import styles from './AvatarAbout.module.scss';

/**
 * AvatarAbout Component — avatar for About section
 *
 * @example
 * // Basic usage
 * ```tsx
 * <AvatarAbout src="/user.jpg" alt="John Doe" size="lg" />
 * ```
 *
 * @example
 * // With custom initials
 * ```tsx
 * <AvatarAbout alt="John Doe" maxInitials={1} />
 * ```
 */
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
        className={classNames(styles.avatarAbout, styles[size], className)}
        role="img"
        aria-label={alt}
        data-state={imageStatus}
      >
        <div className={styles.avatarCircle}>
          {showFallback ? (
            <div className={styles.avatarInner}>
              <span className={styles.initial}>{getInitials(alt || 'U', { maxInitials })}</span>
            </div>
          ) : (
            <div className={styles.avatarInner}>
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
            </div>
          )}
        </div>
      </div>
    );
  }
);

AvatarAbout.displayName = 'AvatarAbout';
