import React, { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '@/shared/lib/i18n/config/i18n';
import { classNames } from '@/shared/lib/utils/classNames';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { useImageLoading } from '../lib/hooks/useImageLoading';
import { ImageProps } from '../model/types';
import { IMAGE_DEFAULTS, IMAGE_SIZE_VALUES, IMAGE_VARIANT_RADIUS } from '../model/constants';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Spinner } from '@/shared/ui/Spinner';
import styles from './Image.module.scss';

/**
 * Image component for displaying responsive, accessible images with loading states.
 *
 * @description
 * Supports multiple variants (default, rounded, circular, thumbnail),
 * sizes, object-fit modes, placeholders (skeleton, spinner, blur, color),
 * lazy loading strategies (native, intersection, eager), and error recovery.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Image src="/photo.jpg" alt="Description" />
 *
 * // With variant and size
 * <Image
 *   src="/avatar.png"
 *   alt="User avatar"
 *   variant="circular"
 *   size="sm"
 * />
 *
 * // With placeholder and lazy loading
 * <Image
 *   src="/large-photo.jpg"
 *   alt="Gallery photo"
 *   placeholder="blur"
 *   lazyMode="intersection"
 * />
 *
 * // Decorative image
 * <Image src="/bg.jpg" alt="" decorative />
 * ```
 */
const ImageComponent = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const { t } = useTranslation();
  const {
    src,
    alt,
    variant = IMAGE_DEFAULTS.variant,
    size = IMAGE_DEFAULTS.size,
    objectFit = IMAGE_DEFAULTS.objectFit,
    placeholder = IMAGE_DEFAULTS.placeholder,
    lazyMode = IMAGE_DEFAULTS.lazyMode,
    fallback,
    showPlaceholder = IMAGE_DEFAULTS.showPlaceholder,
    blurAmount = IMAGE_DEFAULTS.blurAmount,
    className = '',
    style,
    children,
    decorative = IMAGE_DEFAULTS.decorative,
    width,
    height,
    priority = IMAGE_DEFAULTS.priority,
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    forceLoading = IMAGE_DEFAULTS.forceLoading,
    ...restProps
  } = props;

  // IMG-04: single resolved-src source — object form carries the optional srcSet,
  // string form normalizes to a source object so the srcset attribute stays absent.
  const resolvedSrc = typeof src === 'object' ? src : { src, srcSet: undefined };

  // Hook-driven loading state (replaces inline useState<ImageState>)
  const hook = useImageLoading({
    src: resolvedSrc.src,
    lazyMode,
    priority,
    forceLoading,
  });

  const { loadingStatus, isError } = hook;

  // IMG-08: single binding for the error description — the same id is attached
  // to the fallback node so the aria-describedby reference resolves to a real element.
  const fallbackDescriptionId =
    isError && !decorative ? `image-${alt || 'error'}-error` : undefined;

  // Container style
  const containerStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      borderRadius: IMAGE_VARIANT_RADIUS[variant],
      ...style,
    };

    if (width) baseStyle.width = typeof width === 'number' ? `${width}px` : width;
    if (height) baseStyle.height = typeof height === 'number' ? `${height}px` : height;
    if (size !== 'full' && !width && !height) {
      baseStyle.width = IMAGE_SIZE_VALUES[size];
      baseStyle.height = IMAGE_SIZE_VALUES[size];
    }

    return baseStyle;
  }, [variant, style, width, height, size]);

  // Image style
  const imageStyle = useMemo(() => {
    return {
      objectFit,
      filter:
        loadingStatus === 'loading' && placeholder === 'blur' ? `blur(${blurAmount}px)` : 'none',
      opacity: loadingStatus === 'error' ? 0 : 1,
    };
  }, [objectFit, loadingStatus, placeholder, blurAmount]);

  // Native loadstart listener (React 19 doesn't delegate loadstart for <img> via synthetic events)
  useEffect(() => {
    const img = hook.ref.current;
    if (!img || !onLoadStart) return;

    const handler = () => onLoadStart();
    img.addEventListener('loadstart', handler);
    return () => img.removeEventListener('loadstart', handler);
  }, [onLoadStart, hook.ref]);

  // Container CSS classes via classNames()
  const containerClasses = useMemo(() => {
    return classNames(
      styles.container,
      styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
      styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
      styles[`objectFit${objectFit.charAt(0).toUpperCase() + objectFit.slice(1)}`],
      styles[loadingStatus],
      decorative && styles.decorative,
      priority && styles.priority,
      className
    );
  }, [variant, size, objectFit, loadingStatus, decorative, priority, className]);

  // Placeholder CSS classes via classNames()
  const placeholderClasses = useMemo(() => {
    return classNames(
      styles.placeholder,
      styles[`placeholder${placeholder.charAt(0).toUpperCase() + placeholder.slice(1)}`],
      (loadingStatus === 'loaded' || loadingStatus === 'error') && styles.placeholderHidden
    );
  }, [placeholder, loadingStatus]);

  // Inline render for fallback (replaces useCallback — simpler, no deps issue)
  const renderFallback = () => {
    if (typeof fallback === 'string') {
      return (
        <img
          src={fallback}
          alt=""
          className={styles.fallback}
          onError={onLoadError}
          id={fallbackDescriptionId}
        />
      );
    }
    if (fallback) {
      return (
        <div className={styles.fallback} id={fallbackDescriptionId}>
          {fallback}
        </div>
      );
    }
    return (
      <div className={styles.fallback} id={fallbackDescriptionId}>
        {t('imageNotAvailable')}
      </div>
    );
  };

  // Aria attributes
  const ariaProps = useMemo(() => {
    if (decorative) {
      return {
        role: 'presentation' as const,
        'aria-hidden': true,
        alt: '',
      };
    }
    return {
      role: 'img' as const,
      'aria-hidden': false,
      alt: alt || '',
      ...(fallbackDescriptionId && { 'aria-describedby': fallbackDescriptionId }),
    };
  }, [decorative, alt, fallbackDescriptionId]);

  // Destructure hook's event callbacks for stable deps
  const { onLoad: hookOnLoad, onError: hookOnError } = hook;

  // Event handlers: wrap hook callbacks to bridge consumer props
  // NOTE: forceLoading suppresses parent callbacks — keeps parent's imageStatus
  // in 'loading' so the skeleton is not replaced by a fallback
  const handleLoadSuccess = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      hookOnLoad(event);
      if (!forceLoading) {
        onLoadSuccess?.(event);
      }
    },
    [hookOnLoad, onLoadSuccess, forceLoading]
  );

  const handleLoadError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      hookOnError(event);
      if (!forceLoading) {
        onLoadError?.(event);
      }
    },
    [hookOnError, onLoadError, forceLoading]
  );

  // Handle ref forwarding: merge hook's imageRef with forwarded ref
  const imageRefCallback = useMergeRefs(hook.ref, ref);

  return (
    <figure
      className={containerClasses}
      style={containerStyle}
      data-variant={variant}
      data-size={size}
      data-loading={loadingStatus}
    >
      {showPlaceholder && (
        <div className={placeholderClasses} aria-hidden="true">
          {placeholder === 'skeleton' && (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          )}
          {placeholder === 'spinner' && <Spinner />}
        </div>
      )}

      <img
        ref={imageRefCallback}
        src={resolvedSrc.src}
        srcSet={resolvedSrc.srcSet}
        loading={priority || lazyMode === 'eager' ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={styles.image}
        style={imageStyle}
        onLoad={handleLoadSuccess}
        onError={handleLoadError}
        {...ariaProps}
        {...restProps}
      />

      {loadingStatus === 'error' && renderFallback()}

      {children && <div className={styles.childrenOverlay}>{children}</div>}
    </figure>
  );
});

ImageComponent.displayName = 'Image';

export const Image = memo(ImageComponent);
Image.displayName = 'Image';
