import type { LucideIcon } from 'lucide-react';

/**
 * A section entry rendered by the top navigation bar.
 *
 * `labelKey` is an i18n key — never a literal string (i18n-first).
 * T2 will consolidate this into the single source of truth for section
 * anchors (decision R8).
 */
export interface NavItem {
  /** Stable React key + section id. */
  id: string;
  /** In-page anchor, e.g. `#home`. */
  href: string;
  /** i18n key resolved through `t()` at render time. */
  labelKey: string;
  icon: LucideIcon;
}

export interface NavProps {
  className?: string;
  /** Optional callback fired when a section anchor is activated. */
  onNavigation?: (href: string) => void;
  'data-testid'?: string;
}
