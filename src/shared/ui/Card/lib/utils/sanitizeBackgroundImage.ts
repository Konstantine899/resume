// ============================================
// sanitizeBackgroundImage — safe CSS url() builder
// ============================================

import { CARD_CONSTANTS } from '../../model/constants';

export interface SanitizeBackgroundImageOptions {
  /** Hosts allowed for absolute http(s) URLs. Same-origin relative paths are always allowed. */
  allowedHosts?: readonly string[];
}

/**
 * Build a safe `url(...)` value for a `background-image`, or `null` when the
 * value must be rejected (scheme injection, CSS breakout, or disallowed host).
 *
 * Rules:
 * - Rejects `javascript:` / `data:` / `vbscript:` (and any non-http(s)) schemes.
 * - Rejects values containing quotes or parentheses (CSS breakout guard).
 * - Same-origin relative paths (start with a single `/`) are escaped and allowed.
 * - Absolute `http(s)` URLs are allowed only when `host` is in `allowedHosts`.
 * - On rejection the caller SKIPS the layer — no throw.
 */
export function sanitizeBackgroundImage(
  value: string | undefined,
  options: SanitizeBackgroundImageOptions = {}
): string | null {
  if (!value) return null;

  const { allowedHosts = CARD_CONSTANTS.BACKGROUND_IMAGE_ALLOWED_HOSTS } = options;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  const lower = trimmed.toLowerCase();
  if (/^(javascript|data|vbscript):/.test(lower)) return null;

  // Parentheses/quotes allow `url("x") ; background:url(y)` style breakouts.
  if (/['"()]/.test(trimmed)) return null;

  // Same-origin relative path: `/foo/bar.png`
  if (trimmed.startsWith('/')) {
    return `url("${trimmed.replace(/["\\]/g, '\\$&')}")`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (!allowedHosts.includes(parsed.host)) return null;

  return `url("${trimmed.replace(/["\\]/g, '\\$&')}")`;
}
