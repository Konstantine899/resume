import { ImageFallbackBoundary } from './ImageFallbackBoundary';
import { forwardRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '@/shared/lib/i18n/config/i18n';
import { classNames } from '@/shared/lib/utils/classNames';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { useImageLoading } from '../lib/hooks/useImageLoading';
import { ImageRendererProps } from '../model/types';
import { IMAGE_DEFAULTS, IMAGE_SIZE_VALUES, IMAGE_VARIANT_RADIUS } from '../model/constants';
import { Spinner } from '@/shared/ui/Spinner';
import { ImageSkeleton } from './ImageSkeleton/ImageSkeleton';
import styles from './Image.module.scss';

/**
 * Общий рендер изображения.
 * @description Не знает про discriminated union — получает уже разрешённый
 * `resolvedSrc` и флаги от обёрток. Вся логика загрузки/placeholder/fallback/
 * aria/телеметрии живёт здесь (единственная копия).
 */
const ImageRenderer = forwardRef<HTMLImageElement, ImageRendererProps>((props, ref) => {
  const { t } = useTranslation();
  const {
    resolvedSrc,
    pendingLocal = false,
    lazyLoad = false,
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
    htmlWidth,
    htmlHeight,
    priority = IMAGE_DEFAULTS.priority,
    as: Component = 'figure',
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    onLoadErrorTelemetry,
    forceLoading = IMAGE_DEFAULTS.forceLoading,
    ...restProps
  } = props;

  // #4: булев lazyLoad-алиас переопределяет lazyMode на IO-стратегию
  const effectiveLazyMode = lazyLoad ? 'intersection' : lazyMode;

  // Hook-driven loading state (replaces inline useState<ImageState>)
  // pendingLocal держит статус 'loading', пока local-loader не резолвится —
  // пустой src не рендерится до появления реального URL.
  const hook = useImageLoading({
    src: resolvedSrc.src,
    lazyMode: effectiveLazyMode,
    priority,
    forceLoading: forceLoading || pendingLocal,
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
  // isLoading for aria-busy
  const isLoading = loadingStatus === 'loading' || forceLoading || pendingLocal;

  const imageStyle = useMemo(() => {
    return {
      'aria-busy': isLoading || undefined,
      objectFit,
      filter:
        loadingStatus === 'loading' && placeholder === 'blur' ? `blur(${blurAmount}px)` : 'none',
      opacity: loadingStatus === 'error' ? 0 : 1,
    };
  }, [objectFit, loadingStatus, placeholder, blurAmount, isLoading]);

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

  // Inline fallback render (no ErrorBoundary wrapper — simpler, single layer)
  const renderFallback = () => {
    if (typeof fallback === 'string') {
      return (
        <img
          src={fallback}
          alt=""
          className={styles.fallback}
          onError={handleLoadError}
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
        'aria-busy': isLoading || undefined,
        role: 'presentation' as const,
        'aria-hidden': true,
        alt: '',
      };
    }
    return {
      'aria-busy': isLoading || undefined,
      role: 'img' as const,
      'aria-hidden': false,
      alt: alt || '',
      ...(fallbackDescriptionId && { 'aria-describedby': fallbackDescriptionId }),
    };
  }, [decorative, alt, fallbackDescriptionId, isLoading]);

  // Destructure hook's event callbacks for stable deps
  const { onLoad: hookOnLoad, onError: hookOnError } = hook;

  // Event handlers: wrap hook callbacks to bridge consumer props
  // NOTE: forceLoading/pendingLocal suppress parent callbacks — keeps parent's
  // imageStatus in 'loading' so the skeleton is not replaced by a fallback
  const handleLoadSuccess = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      hookOnLoad(event);
      if (!forceLoading && !pendingLocal) {
        onLoadSuccess?.(event);
      }
    },
    [hookOnLoad, onLoadSuccess, forceLoading, pendingLocal]
  );

  const handleLoadError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      hookOnError(event);
      if (!forceLoading && !pendingLocal) {
        // ERB-01: telemetry first (pure observer) — never reorders onLoadError (last).
        onLoadErrorTelemetry?.({ src: resolvedSrc.src, alt, event });
        // ERB-02: dev-only diagnostic (console.warn LOCKED — NOT console.error,
        // Storybook test-runner flags console.error and would fail the plays).
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('[Image] Failed to load image', { src: resolvedSrc.src, alt });
        }
        onLoadError?.(event);
      }
    },
    [
      hookOnError,
      onLoadError,
      onLoadErrorTelemetry,
      alt,
      resolvedSrc.src,
      forceLoading,
      pendingLocal,
    ]
  );

  // Handle ref forwarding: merge hook's imageRef with forwarded ref
  const imageRefCallback = useMergeRefs(hook.ref, ref);

  return (
    <Component
      className={containerClasses}
      style={containerStyle}
      data-variant={variant}
      data-size={size}
      data-loading={loadingStatus}
    >
      {showPlaceholder && (
        <div className={placeholderClasses}>
          {placeholder === 'skeleton' && <ImageSkeleton className={placeholderClasses} />}
          {placeholder === 'spinner' && <Spinner />}
        </div>
      )}

      <img
        ref={imageRefCallback}
        src={resolvedSrc.src}
        srcSet={resolvedSrc.srcSet}
        loading={priority || effectiveLazyMode === 'eager' ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={styles.image}
        style={imageStyle}
        onLoad={handleLoadSuccess}
        onError={handleLoadError}
        width={htmlWidth}
        height={htmlHeight}
        {...ariaProps}
        {...restProps}
      />

      {loadingStatus === 'error' && (
        <ImageFallbackBoundary
          fallback={
            <div className={styles.fallback} id={`${fallbackDescriptionId}-fallback`}>
              <div className={styles.minimalFallback}>
                <span>{t('imageNotAvailable')}</span>
              </div>
            </div>
          }
        >
          {renderFallback()}
        </ImageFallbackBoundary>
      )}

      {children && <div className={styles.childrenOverlay}>{children}</div>}
    </Component>
  );
});

ImageRenderer.displayName = 'ImageRenderer';

export { ImageRenderer };
