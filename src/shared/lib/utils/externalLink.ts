// src/shared/lib/utils/externalLink.ts

import { classNames } from './classNames';

/**
 * Schemes that are safe to render into an `href` attribute (without the
 * trailing colon). Anything else (javascript:, data:, vbscript:, ...) is
 * rejected — an anchor with such an href is an XSS vector when the value
 * is not trusted.
 */
export const SAFE_URL_SCHEMES = ['http', 'https', 'mailto', 'tel'] as const;

/**
 * Returns true when `href` uses a scheme from the allow-list, is a relative
 * path, a hash fragment, or has no explicit scheme at all.
 */
export const hasSafeUrlScheme = (href: string): boolean => {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }

  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  const scheme = schemeMatch?.[1]?.toLowerCase();
  if (!scheme) {
    return true;
  }

  return (SAFE_URL_SCHEMES as readonly string[]).includes(scheme);
};

/**
 * Sanitizes an `href` against dangerous URL schemes (javascript:, data:, ...).
 * Returns the original href when safe, `undefined` when dangerous — an anchor
 * without `href` is inert and cannot execute a script.
 */
export const sanitizeHref = (href: string | undefined): string | undefined => {
  if (!href) {
    return href;
  }
  return hasSafeUrlScheme(href) ? href : undefined;
};

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
