// src/shared/ui/Image/lib/utils/sanitizeImageSrc.ts

/**
 * Data-URI MIME types that are safe to render into an `<img src>` attribute.
 * SVG is deliberately EXCLUDED: `data:image/svg+xml` can embed scripts, so it
 * is an XSS vector when the src is not fully trusted (e.g. user-supplied or
 * data from an external source). See issue #59 (R1 C10 from Card 4R).
 */
const SAFE_RASTER_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
] as const;

/**
 * URL schemes (without trailing colon) that are safe to render into an
 * `<img src>` attribute. `data:` is allowed ONLY for raster MIME types
 * (checked separately).
 */
const SAFE_URL_SCHEMES = ['http', 'https'] as const;

const isSafeDataUri = (value: string): boolean => {
  const mimeMatch = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);/i.exec(value);
  const mimeType = mimeMatch?.[1]?.toLowerCase();
  return mimeType ? (SAFE_RASTER_MIME_TYPES as readonly string[]).includes(mimeType) : false;
};

/**
 * Returns `true` when `src` is safe to render into an `<img>` attribute:
 * absolute http(s) URLs, relative paths (/…, ./…, ../…), scheme-less values,
 * and raster-only data-URIs. SVG data-URIs and dangerous schemes
 * (javascript:, vbscript:, …) return `false`.
 */
export const isSafeImageSource = (src: string | undefined): boolean => {
  if (!src) {
    return false;
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return false;
  }

  // Relative paths are always safe: '/img.png', './img.png', '../img.png', 'img.png'
  if (/^(\.{0,2}\/|[^:]*$)/.test(trimmed)) {
    return true;
  }

  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  const scheme = schemeMatch?.[1]?.toLowerCase();
  if (!scheme) {
    return true;
  }

  if ((SAFE_URL_SCHEMES as readonly string[]).includes(scheme)) {
    return true;
  }

  if (scheme === 'data') {
    return isSafeDataUri(trimmed);
  }

  return false;
};

/**
 * Sanitizes an image `src` against dangerous URL schemes and SVG data-URIs.
 * Returns the original value when safe (see {@link isSafeImageSource}), or
 * `undefined` otherwise — an `<img>` without a `src` is inert.
 */
export const sanitizeImageSrc = (src: string | undefined): string | undefined => {
  if (!isSafeImageSource(src)) {
    return undefined;
  }
  return src;
};

/**
 * Checks an `srcSet` string ("url 1x, url 2x") for dangerous SVG data-URIs.
 * Returns `undefined` when the srcSet contains a `data:image/svg+xml` entry
 * (XSS vector — see issue #59); otherwise the original value.
 */
export const sanitizeImageSrcSet = (srcSet: string | undefined): string | undefined => {
  if (!srcSet) {
    return srcSet;
  }

  return /data:image\/svg\+xml/i.test(srcSet) ? undefined : srcSet;
};
