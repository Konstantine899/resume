// ============================================
// ContactContent seed — THE source of defaults (plan Contact CRUD §5, R-8)
// ============================================
//
// Every default comes from its live source: `email` from the entity
// constant, en copy from the SAME locale JSON the vitrina's t() reads, ru
// copy from the static SEED_RU_TEXTS — the ru LOCALE BUNDLE is lazy (see
// shared/lib/i18n/config/i18n.ts), so the seed cannot await it, yet a store
// init must carry real ru copy for every visitor. Drift is impossible:
// locales-parity.test.ts pins every RU seed text to its ru.json value and
// seed.test.ts asserts this function against ru.json. `resetToDefaults`
// always returns this.

import type { ContactContent } from '@/entities/ContactContent';
import { CONTACT_EMAIL } from '@/entities/ContactContent';
import { SOCIAL_LINKS } from '@/entities/Developer';
import en from '@/shared/lib/i18n/locales/en.json';
import { SEED_RU_TEXTS } from '@/shared/lib/i18n/locales/seedTexts';

/** Socials seed (contact-social-crud S4): slug = name lowercase, from the shared constant. */
const createSocialLinksSeed = (): ContactContent['socialLinks'] =>
  Object.fromEntries(SOCIAL_LINKS.map(({ name, href }) => [name.toLowerCase(), { name, href }]));

export const createContactSeed = (): ContactContent => ({
  email: CONTACT_EMAIL,
  texts: {
    contactDescription: { en: en.contactDescription, ru: SEED_RU_TEXTS.contactDescription },
    responseTimeHint: { en: en.responseTimeHint, ru: SEED_RU_TEXTS.responseTimeHint },
    nameField: { en: en.nameField, ru: SEED_RU_TEXTS.nameField },
    email: { en: en.email, ru: SEED_RU_TEXTS.email },
    message: { en: en.message, ru: SEED_RU_TEXTS.message },
    namePlaceholder: { en: en.namePlaceholder, ru: SEED_RU_TEXTS.namePlaceholder },
    emailPlaceholder: { en: en.emailPlaceholder, ru: SEED_RU_TEXTS.emailPlaceholder },
    messagePlaceholder: { en: en.messagePlaceholder, ru: SEED_RU_TEXTS.messagePlaceholder },
    sendMessage: { en: en.sendMessage, ru: SEED_RU_TEXTS.sendMessage },
    sending: { en: en.sending, ru: SEED_RU_TEXTS.sending },
  },
  formTexts: {
    contactFormRequired: { en: en.contactFormRequired, ru: SEED_RU_TEXTS.contactFormRequired },
    contactFormSent: { en: en.contactFormSent, ru: SEED_RU_TEXTS.contactFormSent },
    contactFormError: { en: en.contactFormError, ru: SEED_RU_TEXTS.contactFormError },
    contactFormConfigError: {
      en: en.contactFormConfigError,
      ru: SEED_RU_TEXTS.contactFormConfigError,
    },
  },
  socialLinks: createSocialLinksSeed(),
});
