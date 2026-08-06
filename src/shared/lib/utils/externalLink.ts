// src/shared/lib/utils/externalLink.ts

import { classNames } from './classNames';

/**
 * Detects whether a URL points to an external resource.
 * @description Returns true for absolute `http://` and `https://` URLs.
 *
 * @example
 * ```ts
 * isExternalLink('https://github.com') // → true
 * isExternalLink('/about')             // → false
 * isExternalLink('#main-content')      // → false
 * ```
 */
export const isExternalLink = (href: string): boolean => {
  return href.startsWith('http://') || href.startsWith('https://');
};

/**
 * Builds safe anchor attributes for external links.
 * @description Forces `target="_blank"` and appends `noopener noreferrer`
 * to the caller-provided (optional) `rel`, keeping a single source of truth
 * for external-link behavior across the UI kit.
 *
 * @param rel - Caller-provided rel tokens (e.g. `'nofollow'`), optional.
 * @returns Anchor attributes for the external link.
 *
 * @example
 * ```ts
 * getExternalLinkProps('nofollow')
 * // → { target: '_blank', rel: 'nofollow noopener noreferrer' }
 * ```
 */
export const getExternalLinkProps = (rel?: string): { target: '_blank'; rel: string } => {
  return {
    target: '_blank',
    rel: classNames(rel, 'noopener', 'noreferrer'),
  };
};
