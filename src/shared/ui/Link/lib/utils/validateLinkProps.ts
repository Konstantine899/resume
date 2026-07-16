// src/shared/ui/Link/lib/utils/validateLinkProps.ts

import type { LinkProps } from '../../model/types';
import { LINK_CONSTANTS } from '../../model/constants';

export function validateLinkProps(props: LinkProps): void {
  const { href, variant, size, underline, requireHref, skeleton } = props;

  if (requireHref && !href && !skeleton) {
    // eslint-disable-next-line no-console
    console.warn('[Link] href is required when requireHref is true');
  }

  if (
    href &&
    !href.startsWith('/') &&
    !href.startsWith('http://') &&
    !href.startsWith('https://') &&
    !href.startsWith('#')
  ) {
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.warn(`[Link] Invalid variant: "${variant}"`);
  }

  if (
    size &&
    !LINK_CONSTANTS.VALID_SIZES.includes(size as (typeof LINK_CONSTANTS.VALID_SIZES)[number])
  ) {
    // eslint-disable-next-line no-console
    console.warn(`[Link] Invalid size: "${size}"`);
  }

  if (
    underline &&
    !LINK_CONSTANTS.VALID_UNDERLINE.includes(
      underline as (typeof LINK_CONSTANTS.VALID_UNDERLINE)[number]
    )
  ) {
    // eslint-disable-next-line no-console
    console.warn(`[Link] Invalid underline value: "${underline}"`);
  }
}
