// ============================================
// ContactContent — FSD contract (plan Contact CRUD §5)
// ============================================
//
// The contract BOTH sides import: the display feature receives it as a
// prop, the admin feature owns it in the store. Cross-feature imports
// are banned (features → features), so the types live here, in entities.
// `LocalizedText` comes from `shared` for the same reason: entities →
// entities is also banned, so this contract cannot reuse the type
// declared inside `entities/AboutContent`.

import type { LocalizedText } from '@/shared/lib/i18n/types';

/**
 * i18n keys of the ten editable section strings.
 * The shared `contact` key is deliberately EXCLUDED: it is the Nav
 * label (`labelKey` in widgets/Nav) — store-editing it would desync the
 * nav item from the section heading (split-brain, plan §2).
 */
export type TextKey =
  | 'contactDescription'
  | 'responseTimeHint'
  | 'nameField'
  | 'email'
  | 'message'
  | 'namePlaceholder'
  | 'emailPlaceholder'
  | 'messagePlaceholder'
  | 'sendMessage'
  | 'sending';

/** i18n keys of the four form-outcome toasts. */
export type FormTextKey =
  'contactFormRequired' | 'contactFormSent' | 'contactFormError' | 'contactFormConfigError';

/**
 * One row of the social-links table (contact-social-crud S1).
 * Named `ContactSocialLink` to avoid the clash with `SocialLink` in
 * `entities/Developer` (the icon-bearing constant type) and in
 * `widgets/Nav` — those consumers keep reading `SOCIAL_LINKS`.
 */
export interface ContactSocialLink {
  name: string;
  href: string;
}

/**
 * The editable document of the Contact section.
 * - `email` — the mailto link target (seed = CONTACT_EMAIL).
 * - `texts` — section + form labels, each in both locales.
 * - `formTexts` — toast messages for the Create flow (§9).
 * - `socialLinks` — open record of social rows (contact-social-crud S1):
 *   slug key, `{ name, href }` value; seed = shared `SOCIAL_LINKS`.
 * OPEN records (contact-rows-crud D1): rows are dynamic — the admin can
 * add/delete string rows; `TextKey`/`FormTextKey` stay the typed read-set
 * for the vitrina, seed and row labels. A missing key falls back to the
 * i18n default on the read path.
 * Deliberately absent: the `contact` nav key (i18n-owned).
 */
export interface ContactContent {
  email: string;
  texts: Record<string, LocalizedText>;
  formTexts: Record<string, LocalizedText>;
  socialLinks: Record<string, ContactSocialLink>;
}
