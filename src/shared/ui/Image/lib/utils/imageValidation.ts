import { ImageProps, ImageValidationResult } from '../../model/types';
import {
  IMAGE_VARIANTS,
  IMAGE_SIZES,
  IMAGE_OBJECT_FITS,
  IMAGE_PLACEHOLDERS,
  IMAGE_LAZY_MODES,
  VALIDATION_MESSAGES,
} from '../../model/constants';

function isValidEnumValue<T extends readonly string[]>(
  value: unknown,
  validValues: T
): value is T[number] {
  return typeof value === 'string' && validValues.includes(value as T[number]);
}

function isValidSrc(src: ImageProps['src']): boolean {
  if (!src) return false;
  if (typeof src === 'string') {
    return src.trim().length > 0;
  }
  if (typeof src === 'object' && src !== null) {
    return 'src' in src && typeof src.src === 'string' && src.src.trim().length > 0;
  }
  return false;
}

function isValidNumberRange(value: number | undefined, min: number, max: number): boolean {
  if (value === undefined) return true;
  return typeof value === 'number' && value >= min && value <= max;
}

export function validateImageProps(
  props: Partial<ImageProps>,
  isDevelopment = false
): ImageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (props.src && !isValidSrc(props.src)) {
    errors.push(VALIDATION_MESSAGES.INVALID_SRC);
  }

  if (!props.decorative && !props.alt) {
    errors.push(VALIDATION_MESSAGES.MISSING_ALT);
  }

  if (props.variant !== undefined && !isValidEnumValue(props.variant, IMAGE_VARIANTS)) {
    errors.push(VALIDATION_MESSAGES.INVALID_VARIANT(String(props.variant)));
  }

  if (props.size !== undefined && !isValidEnumValue(props.size, IMAGE_SIZES)) {
    errors.push(VALIDATION_MESSAGES.INVALID_SIZE(String(props.size)));
  }

  if (props.objectFit !== undefined && !isValidEnumValue(props.objectFit, IMAGE_OBJECT_FITS)) {
    errors.push(VALIDATION_MESSAGES.INVALID_OBJECT_FIT(String(props.objectFit)));
  }

  if (props.placeholder !== undefined && !isValidEnumValue(props.placeholder, IMAGE_PLACEHOLDERS)) {
    errors.push(VALIDATION_MESSAGES.INVALID_PLACEHOLDER(String(props.placeholder)));
  }

  if (props.lazyMode !== undefined && !isValidEnumValue(props.lazyMode, IMAGE_LAZY_MODES)) {
    errors.push(VALIDATION_MESSAGES.INVALID_LAZY_MODE(String(props.lazyMode)));
  }

  if (props.blurAmount !== undefined && props.blurAmount < 0) {
    errors.push(VALIDATION_MESSAGES.NEGATIVE_BLUR);
  }

  if (!isValidNumberRange(props.quality, 0, 100)) {
    errors.push(VALIDATION_MESSAGES.INVALID_QUALITY);
  }

  if (isDevelopment) {
    if (props.decorative && props.alt) {
      warnings.push('Decorative image should not have alt text.');
    }
    if (props.size === 'full' && (props.width !== undefined || props.height !== undefined)) {
      warnings.push('Using size="full" with explicit width/height may cause unexpected layout.');
    }
    if (props.variant === 'circular' && props.objectFit !== 'cover') {
      warnings.push('Using variant="circular" with objectFit !== "cover" may distort image.');
    }
    if (props.priority && props.lazyMode === 'native') {
      warnings.push('Using priority=true with lazyMode="native" is contradictory.');
    }
    if ((props.blurAmount ?? 0) > 50) {
      warnings.push('blurAmount is very high and may impact performance.');
    }
    if ((props.quality ?? 80) < 30) {
      warnings.push('quality is very low and may result in poor image quality.');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function normalizeImageProps(
  props: ImageProps
): Required<
  Pick<
    ImageProps,
    | 'variant'
    | 'size'
    | 'objectFit'
    | 'placeholder'
    | 'lazyMode'
    | 'showPlaceholder'
    | 'blurAmount'
    | 'quality'
    | 'decorative'
    | 'priority'
  >
> &
  Omit<
    ImageProps,
    | 'variant'
    | 'size'
    | 'objectFit'
    | 'placeholder'
    | 'lazyMode'
    | 'showPlaceholder'
    | 'blurAmount'
    | 'quality'
    | 'decorative'
    | 'priority'
  > {
  const {
    variant = 'default',
    size = 'md',
    objectFit = 'cover',
    placeholder = 'skeleton',
    lazyMode = 'native',
    showPlaceholder = true,
    blurAmount = 10,
    quality = 80,
    decorative = false,
    priority = false,
    ...restProps
  } = props;

  return {
    ...restProps,
    variant,
    size,
    objectFit,
    placeholder,
    lazyMode,
    showPlaceholder,
    blurAmount,
    quality,
    decorative,
    priority,
  };
}

export function logValidationWarnings(props: Partial<ImageProps>, componentName = 'Image'): void {
  if (process.env.NODE_ENV !== 'development') return;
  const { warnings } = validateImageProps(props, true);
  if (warnings.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[${componentName}] Validation warnings:`, warnings.join('\n'));
  }
}
