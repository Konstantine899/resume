// ============================================
// ContactContent seed — THE source of defaults (plan Contact CRUD §5, R-8)
// ============================================
//
// Every default comes from its live source: `email` from the entity
// constant, all localized strings imported from the SAME locale JSON the
// vitrina's `t()` reads. There is no hand-copied second version, so seed
// and locales CANNOT drift — `resetToDefaults` always returns this.

import type { ContactContent } from '@/entities/ContactContent';
import { CONTACT_EMAIL } from '@/entities/ContactContent';
import en from '@/shared/lib/i18n/locales/en.json';
import ru from '@/shared/lib/i18n/locales/ru.json';

export const createContactSeed = (): ContactContent => ({
  email: CONTACT_EMAIL,
  texts: {
    contactDescription: { en: en.contactDescription, ru: ru.contactDescription },
    responseTimeHint: { en: en.responseTimeHint, ru: ru.responseTimeHint },
    nameField: { en: en.nameField, ru: ru.nameField },
    email: { en: en.email, ru: ru.email },
    message: { en: en.message, ru: ru.message },
    namePlaceholder: { en: en.namePlaceholder, ru: ru.namePlaceholder },
    emailPlaceholder: { en: en.emailPlaceholder, ru: ru.emailPlaceholder },
    messagePlaceholder: { en: en.messagePlaceholder, ru: ru.messagePlaceholder },
    sendMessage: { en: en.sendMessage, ru: ru.sendMessage },
    sending: { en: en.sending, ru: ru.sending },
  },
  formTexts: {
    contactFormRequired: { en: en.contactFormRequired, ru: ru.contactFormRequired },
    contactFormSent: { en: en.contactFormSent, ru: ru.contactFormSent },
    contactFormError: { en: en.contactFormError, ru: ru.contactFormError },
    contactFormConfigError: { en: en.contactFormConfigError, ru: ru.contactFormConfigError },
  },
});
