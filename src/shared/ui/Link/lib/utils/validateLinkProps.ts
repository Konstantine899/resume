// src/shared/ui/Link/lib/utils/validateLinkProps.ts

/* eslint-disable no-console */

import type { LinkOwnProps } from '../../model/types';
import { LINK_CONSTANTS } from '../../model/constants';

/**
 * Dev-валидация props для Link.
 * @description Проверяет href (обязательность и формат), variant, size, underline
 * в development режиме.
 *
 * @remarks
 * - Runs ONLY when `process.env.NODE_ENV === 'development'` (guard is internal,
 *   so callers — Link component and useLink hook — do not need their own guard)
 * - Uses `console.warn` (does NOT throw errors)
 * - Zero production overhead: function body is effectively a no-op in production
 *
 * @param props - Link props to validate
 *
 * @example
 * ```typescript
 * // Development mode: logs warning
 * validateLinkProps({ href: '', requireHref: true })
 * // → console.warn: "[Link] href is required when requireHref is true"
 *
 * // Production mode: no-op
 * validateLinkProps({ href: '' })
 * // → nothing happens
 * ```
 */
export function validateLinkProps(props: LinkOwnProps): void {
  if (process.env.NODE_ENV !== 'development') return;

  const { href, variant, size, underline, requireHref, skeleton } = props;

  if (requireHref && !href && !skeleton) {
    console.warn('[Link] href is required when requireHref is true');
  }

  if (
    href &&
    !href.startsWith('/') &&
    !href.startsWith('http://') &&
    !href.startsWith('https://') &&
    !href.startsWith('#')
  ) {
    console.warn(
      `[Link] href "${href}" may be invalid — expected absolute path, URL, or hash fragment`
    );
  }

  if (
    variant &&
    !LINK_CONSTANTS.VALID_VARIANTS.includes(
      variant as (typeof LINK_CONSTANTS.VALID_VARIANTS)[number]
    )
  ) {
    console.warn(`[Link] Invalid variant: "${variant}"`);
  }

  if (
    size &&
    !LINK_CONSTANTS.VALID_SIZES.includes(size as (typeof LINK_CONSTANTS.VALID_SIZES)[number])
  ) {
    console.warn(`[Link] Invalid size: "${size}"`);
  }

  if (
    underline &&
    !LINK_CONSTANTS.VALID_UNDERLINE.includes(
      underline as (typeof LINK_CONSTANTS.VALID_UNDERLINE)[number]
    )
  ) {
    console.warn(`[Link] Invalid underline value: "${underline}"`);
  }
}
