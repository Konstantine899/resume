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

/** i18n keys of the four stat lines rendered by the About section. */
export type StatKey = 'aboutStatYears' | 'aboutStatProjects' | 'aboutStatUsers' | 'aboutStatRemote';

/**
 * The editable document of the About section.
 * - `fullName` — the page h1 (a proper name: not localized, RU only).
 * - `descriptions` — exactly three pitch paragraphs, each in both locales.
 * - `stats` — the four stat strings; ORDER is not part of the data — the
 *   vitrina keeps it in `STATS_KEYS` (About.tsx), so a new stat = 3 places.
 * - `ctaLabel` — the "Hire Me" link text.
 * Deliberately absent: `stack` (shared PROFILE_STACK, out of CRUD scope)
 * and `portrait` (file upload, out of stage-1 scope).
 */
export interface AboutContent {
  fullName: string;
  descriptions: [LocalizedText, LocalizedText, LocalizedText];
  stats: Record<StatKey, LocalizedText>;
  ctaLabel: LocalizedText;
}
