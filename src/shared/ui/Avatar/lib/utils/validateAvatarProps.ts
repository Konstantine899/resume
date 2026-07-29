/**
 * Avatar runtime validation (dev-only)
 */

import type { AvatarProps, AvatarSize, AvatarVariant } from '../../model/types';

const VALID_SIZES: AvatarSize[] = ['sm', 'md', 'lg', 'xl'];
const VALID_VARIANTS: AvatarVariant[] = ['circle', 'square'];

/**
 * Validate Avatar props in development mode
 */
export function validateAvatarProps(props: AvatarProps): void {
  if (process.env.NODE_ENV !== 'development') return;

  const { size, variant, alt, fallback, showSkeleton, forceLoading } = props;

  // Validate size
  if (size && !VALID_SIZES.includes(size)) {
    // eslint-disable-next-line no-console
    console.warn(`Avatar: invalid size "${size}". Valid sizes: ${VALID_SIZES.join(', ')}`);
  }

  // Validate variant
  if (variant && !VALID_VARIANTS.includes(variant)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Avatar: invalid variant "${variant}". Valid variants: ${VALID_VARIANTS.join(', ')}`
    );
  }

  // Validate alt (required for accessibility)
  if (!alt || alt.trim() === '') {
    // eslint-disable-next-line no-console
    console.warn('Avatar: missing or empty "alt" prop. Alt text is required for accessibility.');
  }

  // Validate fallback type
  if (fallback !== undefined && typeof fallback !== 'function' && !isValidReactNode(fallback)) {
    // eslint-disable-next-line no-console
    console.warn('Avatar: "fallback" should be a ReactNode or a render function.');
  }

  // Validate showSkeleton + forceLoading combination
  if (showSkeleton === false && forceLoading === true) {
    // eslint-disable-next-line no-console
    console.warn(
      'Avatar: "showSkeleton=false" with "forceLoading=true" has no effect. ' +
        'Force loading requires skeleton to be visible.'
    );
  }
}

/**
 * Basic runtime check for valid ReactNode
 */
function isValidReactNode(node: unknown): boolean {
  if (node === null || node === undefined) return true;
  if (typeof node === 'string' || typeof node === 'number') return true;
  if (typeof node === 'object') return true; // React element, array, etc.
  return false;
}
