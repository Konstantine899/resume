// ============================================
// AboutContent — FSD contract (plan About CRUD §5)
// ============================================
//
// The contract BOTH sides import: the display feature receives it as a
// prop, the admin feature owns it in the store. Cross-feature imports
// are banned (features → features), so the types live here, in entities.
// `LocalizedText` comes from `shared` for the same reason: Contact's
// contract must reuse it without an entities → entities hop.

import type { LocalizedText } from '@/shared/lib/i18n/types';

/** i18n keys of the four KNOWN stat lines rendered by the About section. */
export type StatKey = 'aboutStatYears' | 'aboutStatProjects' | 'aboutStatUsers' | 'aboutStatRemote';

/**
 * The editable document of the About section (contract v2, SPEC D10).
 * - `fullName` — the page h1 (a proper name: not localized, RU only).
 * - `descriptions` — pitch paragraphs in document order (0..n, ≤600 per
 *   locale); the seed ships three, the admin adds/removes rows.
 * - `stats` — OPEN record of stat strings in insertion order: the four
 *   `StatKey` records are the known seed subset, custom keys are added by
 *   the admin. Vitrina renders every entry (custom keys show the value).
 * - `statLabels` — labels for CUSTOM stat keys only (known keys are i18n);
 *   written together with the stat, removed together with it.
 * - `ctaLabel` — the "Hire Me" link text; `null` = the row was deleted
 *   (the vitrina hides the link).
 * - `portrait` — path of the portrait file (upload lands in WU-14); the
 *   vitrina falls back to the static asset when absent.
 * Deliberately absent: `stack` (shared PROFILE_STACK, out of CRUD scope).
 * v2 is a SUPERSET of v1: a legacy document validates as-is — no migration.
 */
export interface AboutContent {
  fullName: string;
  descriptions: LocalizedText[];
  stats: Record<string, LocalizedText>;
  statLabels?: Record<string, LocalizedText>;
  ctaLabel: LocalizedText | null;
  portrait?: string;
}
