// ============================================
// Avatar Component
// ============================================

import React, { useEffect } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Image } from '@/shared/ui/Image';
import { useImageStatus } from '@/shared/lib/hooks/useImageStatus';

import { AVATAR_SIZES } from '../../model/constants';
import { AvatarProps } from '../../model/types';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import { validateAvatarProps } from '../../lib/utils/validateAvatarProps';
import styles from './Avatar.module.scss';

/**
 * Avatar Component — displays user avatar with fallback, skeleton, and effects
 *
 * @example
 * // Basic usage
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" size="md" />
 * ```
 *
 * @example
 * // With glow and ring effects
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" showGlow showRing heroStyle />
 * ```
 *
 * @example
 * // With custom fallback
 * ```tsx
 * <Avatar alt="John Doe" fallback={<CustomFallback />} />
 * ```
 */
export const Avatar = React.memo(
  React.forwardRef<HTMLDivElement, AvatarProps>(
    (
      {
        src,
        alt = 'Avatar placeholder',
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
      }: AvatarProps,
      ref
    ) => {
      const normalizedSrc = src === '' ? undefined : src;

      // Runtime validation in dev mode
      useEffect(() => {
        validateAvatarProps({
          src,
          alt,
          size,
          variant,
          fallback,
          showSkeleton,
          forceLoading,
          heroStyle,
          showGlow,
          showRing,
        });
      }, [
        src,
        alt,
        size,
        variant,
        fallback,
        showSkeleton,
        forceLoading,
        heroStyle,
        showGlow,
        showRing,
      ]);

      // Use custom hook for image state management (eliminates duplication)
      const { imageStatus, showFallback, handleLoadSuccess, handleLoadError } = useImageStatus(
        forceLoading,
        normalizedSrc,
        onLoad,
        onError
      );

      const avatarWidth = AVATAR_SIZES[size];

      return (
        <div
          ref={ref}
          className={classNames(styles.avatar, styles[size], styles[variant], className, {
            [styles.heroStyle]: heroStyle,
          })}
          role="img"
          aria-label={alt}
          data-state={imageStatus}
          data-size={size}
          data-variant={variant}
          data-hero-style={heroStyle || undefined}
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
  )
);

Avatar.displayName = 'Avatar';
