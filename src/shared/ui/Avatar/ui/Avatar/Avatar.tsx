import React, { Children, cloneElement, isValidElement } from 'react';
import { Image } from '@/shared/ui/Image';
import { classNames } from '@/shared/lib/utils/classNames';
import { useAvatar } from '../../lib/hooks/useAvatar';
import type { PolymorphicAvatarProps } from '../../model/types';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
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
 *
 * @example
 * // Polymorphic: render as article
 * ```tsx
 * <Avatar as="article" src="/user.jpg" alt="John Doe" />
 * ```
 *
 * @example
 * // Polymorphic: render as link
 * ```tsx
 * <Avatar as={Link} href="/profile" src="/user.jpg" alt="John Doe" />
 * ```
 *
 * @example
 * // asChild pattern
 * ```tsx
 * <Avatar asChild>
 *   <div className="custom-avatar">Content</div>
 * </Avatar>
 * ```
 */
function AvatarImpl<C extends React.ElementType = 'div'>(
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
    as,
    asChild = false,
    ...rest
  }: PolymorphicAvatarProps<C>,
  ref: React.Ref<HTMLDivElement>
) {
  // Use custom hook for centralized Avatar logic
  const {
    avatarClassName,
    imageStatus,
    showFallback,
    handleLoadSuccess,
    handleLoadError,
    avatarWidth,
  } = useAvatar({
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
    className,
    onError,
    onLoad,
  });

  const Tag = as ?? 'div';

  // asChild mode: merge props into child element instead of rendering own DOM node
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      return null;
    }
    /* eslint-disable react-hooks/refs */

    return cloneElement(child, {
      ref,
      className: classNames(
        avatarClassName,
        (child.props as React.HTMLAttributes<HTMLElement>).className
      ),
      role: 'img',
      'aria-label': alt,
      'data-state': imageStatus,
      'data-size': size,
      'data-variant': variant,
      'data-hero-style': heroStyle || undefined,
      ...rest,
    }) as React.ReactElement;
    /* eslint-enable react-hooks/refs */
  }

  return (
    <Tag
      ref={ref}
      className={avatarClassName}
      role="img"
      aria-label={alt}
      data-state={imageStatus}
      data-size={size}
      data-variant={variant}
      data-hero-style={heroStyle || undefined}
      {...rest}
    >
      {showGlow && <div className={styles.glow} />}
      {showRing && <div className={styles.ring} />}

      {showFallback ? (
        <div className={styles.fallback}>
          {fallback || <AvatarFallback name={alt} size={size} variant={variant} />}
        </div>
      ) : (
        <Image
          src={src || ''}
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
    </Tag>
  );
}

AvatarImpl.displayName = 'Avatar';

const AvatarForwardRef = React.forwardRef(AvatarImpl);

/**
 * Avatar — polymorphic avatar component with fallback, skeleton, and effects.
 *
 * Defaults to rendering a `<div>` element. Use `as="a"` to render as a link,
 * or any other HTML element / React component.
 * Use `asChild` to compose with a single child element (Radix Slot pattern).
 */
export const Avatar = AvatarForwardRef as <C extends React.ElementType = 'div'>(
  props: PolymorphicAvatarProps<C> & {
    ref?: React.Ref<HTMLDivElement>;
  }
) => React.ReactElement;
