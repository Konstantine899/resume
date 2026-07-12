import React, { useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { ImageProps, ImageState } from '../model/types';
import { IMAGE_DEFAULTS, IMAGE_SIZE_VALUES, IMAGE_VARIANT_RADIUS } from '../model/constants';
import { validateImageProps, normalizeImageProps } from '../lib/utils/imageValidation';
import styles from './Image.module.scss';

const ImageComponent: React.FC<ImageProps> = (props) => {
  const normalizedProps = useMemo(() => normalizeImageProps(props), [props]);
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
    ...restProps
  } = normalizedProps;

  const imageRef = useRef<HTMLImageElement>(null);
  const [state, setState] = React.useState<ImageState>({
    loadingStatus: 'idle',
    hasLoaded: false,
    currentSrc: typeof src === 'string' ? src : src.src,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const validation = validateImageProps(props, true);
      // Validation warnings логируются внутри validateImageProps
      void validation;
    }
  }, [props]);

  const handleLoadStart = useCallback(() => {
    setState((prev) => ({ ...prev, loadingStatus: 'loading' }));
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadSuccess = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setState((prev) => ({ ...prev, loadingStatus: 'loaded', hasLoaded: true }));
      onLoadSuccess?.(event);
    },
    [onLoadSuccess]
  );

  const handleLoadError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setState((prev) => ({ ...prev, loadingStatus: 'error' }));
      onLoadError?.(event);
    },
    [onLoadError]
  );

  const imageSrc = useMemo(() => {
    if (typeof src === 'string') return src;
    return src.src;
  }, [src]);

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

  const imageStyle = useMemo(() => {
    return {
      objectFit,
      filter:
        state.loadingStatus === 'loading' && placeholder === 'blur'
          ? `blur(${blurAmount}px)`
          : 'none',
    };
  }, [objectFit, state.loadingStatus, placeholder, blurAmount]);

  const containerClasses = useMemo(() => {
    return [
      styles.container,
      styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
      styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
      styles[`objectFit${objectFit.charAt(0).toUpperCase() + objectFit.slice(1)}`],
      styles[state.loadingStatus],
      decorative ? styles.decorative : '',
      priority ? styles.priority : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
  }, [variant, size, objectFit, state.loadingStatus, decorative, priority, className]);

  const placeholderClasses = useMemo(() => {
    return [
      styles.placeholder,
      styles[`placeholder${placeholder.charAt(0).toUpperCase() + placeholder.slice(1)}`],
      state.loadingStatus === 'loaded' || state.loadingStatus === 'error'
        ? styles.placeholderHidden
        : '',
    ]
      .filter(Boolean)
      .join(' ');
  }, [placeholder, state.loadingStatus]);

  const renderFallback = useCallback(() => {
    if (typeof fallback === 'string') {
      return <img src={fallback} alt="" className={styles.fallback} />;
    }
    if (fallback) {
      return <div className={styles.fallback}>{fallback}</div>;
    }
    return <div className={styles.fallback}>Image not available</div>;
  }, [fallback]);

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
    };
  }, [decorative, alt]);

  return (
    <figure className={containerClasses} style={containerStyle}>
      {showPlaceholder && state.loadingStatus !== 'loaded' && (
        <div className={placeholderClasses} aria-hidden="true" />
      )}

      <img
        ref={imageRef}
        src={imageSrc}
        loading={priority || lazyMode === 'eager' ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={styles.image}
        style={imageStyle}
        onLoadStart={handleLoadStart}
        onLoad={handleLoadSuccess}
        onError={handleLoadError}
        {...ariaProps}
        {...restProps}
      />

      {state.loadingStatus === 'error' && renderFallback()}

      {children && <div className={styles.childrenOverlay}>{children}</div>}
    </figure>
  );
};

export const Image = memo(ImageComponent);
Image.displayName = 'Image';

export default Image;
