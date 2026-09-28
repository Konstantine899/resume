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

/**
 * Rendering context of a `NavItem` row (decision R10).
 *
 * - `desktop` — horizontal link inside the sticky top bar.
 * - `mobile`  — full-width row of the T6 mobile menu panel. MUST keep regular
 *   link semantics (`role="link"`): the old Sidebar mobile variant emitted an
 *   orphaned `menuitem` with no `menubar` parent, which this variant forbids.
 */
export type NavItemVariant = 'desktop' | 'mobile';

export interface NavProps {
  className?: string;
  /** Optional callback fired when a section anchor is activated. */
  onNavigation?: (href: string) => void;
  'data-testid'?: string;
}

/**
 * Props for the `NavControls` wrapper (🌍 LanguageSwitch + 🎨 ThemeSwitch).
 *
 * Decision R12: typed HERE against the REAL switch component contracts —
 * the stale Sidebar `ThemeSwitchProps` (missing isCollapsed/variant) is
 * never imported. `ui/NavControls/NavControls.test.tsx` holds the
 * compile-time guard against that regression.
 */
export interface NavControlsProps {
  /**
   * Rendering context — shares the `NavItemVariant` desktop/mobile values:
   * `desktop` renders icon-only switches with built-in title tooltips (R5),
   * `mobile` renders full text rows (old MobileMenu composition, reused in T6).
   */
  variant?: NavItemVariant;
  className?: string;
  'data-testid'?: string;
}

/**
 * Props for the `CtaButton` resume CTA (issue #138, T5).
 *
 * Decision R4: the SAME component serves both surfaces —
 * `desktop` renders the always-visible text CTA (Link-primary, Hero
 * precedent), `mobile` renders a compact icon-only anchor with an
 * i18n `aria-label` (reused by the T6 mobile menu panel).
 */
export interface CtaButtonProps {
  /** Rendering context (decision R4) — required, no default. */
  variant: NavItemVariant;
  className?: string;
  'data-testid'?: string;
}

/**
 * Props for the `AdminLink` 🔐 placeholder (issue #138, T5, decision R3).
 *
 * Read-only icon-only link to `ADMIN_HREF` (`#/admin`) — visible in BOTH
 * surfaces (the mobile menu panel of T6 reuses it unchanged).
 */
export interface AdminLinkProps {
  className?: string;
  'data-testid'?: string;
}
