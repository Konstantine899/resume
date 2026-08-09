import { ImageVariant, ImageSize, ImageObjectFit, ImagePlaceholder, ImageLazyMode } from './types';

/**
 * Доступные варианты стилей изображения
 * @description Константы для валидации variant prop
 */
export const IMAGE_VARIANTS: readonly ImageVariant[] = [
  'default',
  'rounded',
  'circular',
  'thumbnail',
] as const;

/**
 * Доступные размеры изображения
 * @description Константы для валидации size prop
 */
export const IMAGE_SIZES: readonly ImageSize[] = ['sm', 'md', 'lg', 'full'] as const;

/**
 * Доступные режимы object-fit
 * @description Константы для валидации objectFit prop
 */
export const IMAGE_OBJECT_FITS: readonly ImageObjectFit[] = [
  'cover',
  'contain',
  'fill',
  'none',
  'scale-down',
] as const;

/**
 * Доступные типы placeholder'ов
 * @description Константы для валидации placeholder prop
 */
export const IMAGE_PLACEHOLDERS: readonly ImagePlaceholder[] = [
  'blur',
  'skeleton',
  'color',
  'spinner',
] as const;

/**
 * Доступные режимы lazy loading
 * @description Константы для валидации lazyMode prop
 */
export const IMAGE_LAZY_MODES: readonly ImageLazyMode[] = [
  'native',
  'intersection',
  'eager',
] as const;

/**
 * Размеры изображений в пикселях
 * @description Маппинг size prop на конкретные значения
 */
export const IMAGE_SIZE_VALUES: Record<ImageSize, string> = {
  sm: '64px',
  md: '128px',
  lg: '256px',
  full: '100%',
} as const;

/**
 * Значения border-radius для вариантов
 * @description Маппинг variant prop на border-radius
 */
export const IMAGE_VARIANT_RADIUS: Record<ImageVariant, string> = {
  default: '0',
  rounded: '12px',
  circular: '50%',
  thumbnail: '8px',
} as const;

/**
 * Пороги для Intersection Observer
 * @description Конфигурация для lazy loading через Observer
 */
export const INTERSECTION_OBSERVER_CONFIG = {
  threshold: 0.01,
  rootMargin: '50px',
} as const;

/**
 * Дефолтные значения props
 * @description Используется для нормализации props
 */
export const IMAGE_DEFAULTS = {
  variant: 'default' as ImageVariant,
  size: 'md' as ImageSize,
  objectFit: 'cover' as ImageObjectFit,
  placeholder: 'skeleton' as ImagePlaceholder,
  lazyMode: 'native' as ImageLazyMode,
  showPlaceholder: true,
  blurAmount: 10,
  quality: 80,
  decorative: false,
  priority: false,
  forceLoading: false,
} as const;

/**
 * Сообщения об ошибках
 * @description Локализованные сообщения для валидации
 */
export const VALIDATION_MESSAGES = {
  INVALID_VARIANT: (value: string) =>
    `Invalid variant "${value}". Valid values: ${IMAGE_VARIANTS.join(', ')}`,
  INVALID_SIZE: (value: string) =>
    `Invalid size "${value}". Valid values: ${IMAGE_SIZES.join(', ')}`,
  INVALID_OBJECT_FIT: (value: string) =>
    `Invalid objectFit "${value}". Valid values: ${IMAGE_OBJECT_FITS.join(', ')}`,
  INVALID_PLACEHOLDER: (value: string) =>
    `Invalid placeholder "${value}". Valid values: ${IMAGE_PLACEHOLDERS.join(', ')}`,
  INVALID_LAZY_MODE: (value: string) =>
    `Invalid lazyMode "${value}". Valid values: ${IMAGE_LAZY_MODES.join(', ')}`,
  MISSING_ALT: 'Missing required "alt" prop for non-decorative image',
  INVALID_SRC: 'Invalid "src" prop: must be a non-empty string or object with src property',
  NEGATIVE_BLUR: 'blurAmount must be a positive number',
  INVALID_QUALITY: 'quality must be between 0 and 100',
} as const;
