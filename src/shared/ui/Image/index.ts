/**
 * Image Component
 * @module @/shared/ui/Image
 * @description Универсальный компонент изображения с поддержкой lazy loading,
 * placeholder'ов, fallback'ов и полной accessibility поддержкой
 */

export { Image } from './ui/Image';
export type {
  ImageProps,
  ImageVariant,
  ImageSize,
  ImageObjectFit,
  ImagePlaceholder,
  ImageLazyMode,
  ImageState,
  UseImageLoadingConfig,
  UseImageLoadingReturn,
  ImageValidationResult,
} from './model/types';
export {
  IMAGE_VARIANTS,
  IMAGE_SIZES,
  IMAGE_OBJECT_FITS,
  IMAGE_PLACEHOLDERS,
  IMAGE_LAZY_MODES,
  IMAGE_SIZE_VALUES,
  IMAGE_VARIANT_RADIUS,
  PLACEHOLDER_CONFIG,
  INTERSECTION_OBSERVER_CONFIG,
  IMAGE_DEFAULTS,
  SUPPORTED_IMAGE_TYPES,
  VALIDATION_MESSAGES,
  ARIA_DEFAULTS,
} from './model/constants';
export { useImageLoading, useImageLoadingSimple } from './lib/hooks/useImageLoading';
export {
  validateImageProps,
  normalizeImageProps,
  logValidationWarnings,
} from './lib/utils/imageValidation';
