// ============================================
// sanitizeAnchorProps — harden polymorphic <a> rendering
// ============================================

import { sanitizeHref } from './safeHref';

/**
 * Sanitizes anchor props for the polymorphic `component="a"` case.
 *
 * @description
 * - Blocks dangerous `href` schemes via {@link sanitizeHref}.
 * - Auto-adds `rel="noopener noreferrer"` for `target="_blank"` when not explicitly set.
 *
 * @param props - The rest props spread for the rendered `<a>` element
 * @returns A new props object with sanitized href and hardened rel
 */
export function sanitizeAnchorProps(props: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...props };

  if (typeof props.href === 'string') {
    const safe = sanitizeHref(props.href);
    if (safe === undefined) {
      delete next.href;
    } else {
      next.href = safe;
    }
  }

  if (props.target === '_blank' && !('rel' in props)) {
    next.rel = 'noopener noreferrer';
  }

  return next;
}
