// ============================================
// safeHref — block dangerous URL schemes for polymorphic <a>
// ============================================

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Validates an `href` value against dangerous URL schemes (e.g. `javascript:`, `data:`).
 *
 * @description Allows http(s)/mailto/tel, plus relative/root-relative/hash/query paths.
 * Returns `undefined` for unsafe schemes (and warns in development), so the link is
 * effectively neutralised instead of executing injected script.
 *
 * @param href - The raw href attribute
 * @returns The safe href, or undefined when the scheme is disallowed
 *
 * @example
 * sanitizeHref('https://example.com')   // => 'https://example.com'
 * sanitizeHref('/about')                // => '/about'
 * sanitizeHref('javascript:alert(1)')   // => undefined (blocked)
 */
export function sanitizeHref(href: string): string | undefined {
  if (typeof href !== 'string') return undefined;
  const trimmed = href.trim();
  if (trimmed === '') return undefined;

  // Relative / root-relative / hash / query paths are always safe
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) {
    return trimmed;
  }

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(trimmed, base);
    if (SAFE_PROTOCOLS.includes(url.protocol)) {
      return trimmed;
    }
  } catch {
    // Not an absolute URL (relative without base) — treat as safe path
    return trimmed;
  }

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(`[Button] Blocked potentially unsafe href scheme: "${trimmed}"`);
  }
  return undefined;
}
