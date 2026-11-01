// ============================================
// About Feature Types
// ============================================

import type { AboutContent } from '@/entities/AboutContent';

/**
 * The catalog slice the vitrina resolves stack labels from (contract v3,
 * SPEC E-3): `stack` stores slug keys only, so the display name must come
 * from the catalog — resolved in FEATURES, because entities→entities is
 * banned (resume-fsd-cross-slice).
 *
 * Structural on purpose, not `Technology`: the `name` field lands with the
 * display-name catalog branch (left untouched here). Until then every label
 * falls back to its key — forward-compatible `name ?? key` (owner verdict,
 * 2026-11-01). `Technology[]` is assignable to this shape, so HomePage
 * passes the selector result unchanged.
 */
export interface StackCatalogEntry {
  key: string;
  name?: string;
}

export interface AboutFeatureProps {
  className?: string;
  'data-testid'?: string;
  /**
   * Store-backed content (WU-2, Design C): HomePage is the ONLY place that
   * reads the slice — the vitrina stays store-free, so its bare tests keep
   * rendering the i18n/seed fallback without a Provider.
   */
  content?: AboutContent;
  /**
   * Technology catalog for the stack badges (WU-3, Design C): HomePage reads
   * `selectAllTechnologies` and passes it down. Without the prop the badges
   * render their raw keys, so bare tests stay Provider-free.
   */
  technologies?: StackCatalogEntry[];
}

export interface AboutTranslations {
  aboutTitle: string;
  about: string;
  aboutDescription: string;
  getInTouch: string;
}
