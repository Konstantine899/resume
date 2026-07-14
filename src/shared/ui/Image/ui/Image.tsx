import React, { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { useImageLoading } from '../lib/hooks/useImageLoading';
import { ImageProps } from '../model/types';
import { IMAGE_DEFAULTS, IMAGE_SIZE_VALUES, IMAGE_VARIANT_RADIUS } from '../model/constants';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Loader } from '@/shared/ui/Loader';
import styles from './Image.module.scss';

const ImageComponent = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
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

  // Hook-driven loading state (replaces inline useState<ImageState>)
  const hook = useImageLoading({
    src: typeof src === 'string' ? src : src.src,
    lazyMode,
    priority,
    forceLoading,
  });

  const { loadingStatus, isError } = hook;

  // imageSrc computed directly from props (no useMemo needed)
  const imageSrc = typeof src === 'string' ? src : src.src;

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
      return <img src={fallback} alt="" className={styles.fallback} onError={onLoadError} />;
    }
    if (fallback) {
      return <div className={styles.fallback}>{fallback}</div>;
    }
    return <div className={styles.fallback}>Image not available</div>;
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
      ...(isError && { 'aria-describedby': `image-${alt || 'error'}-error` }),
    };
  }, [decorative, alt, isError]);

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
  const imageRefCallback = useCallback(
    (node: HTMLImageElement | null) => {
      // eslint-disable-next-line react-hooks/immutability
      (hook.ref as React.MutableRefObject<HTMLImageElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = node;
      }
    },
    [ref, hook.ref]
  );

  return (
    <figure className={containerClasses} style={containerStyle}>
      {showPlaceholder && (
        <div className={placeholderClasses} aria-hidden="true">
          {placeholder === 'skeleton' && (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          )}
          {placeholder === 'spinner' && <Loader variant="spinner" />}
        </div>
      )}

      <img
        ref={imageRefCallback}
        src={imageSrc}
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

export default Image;
