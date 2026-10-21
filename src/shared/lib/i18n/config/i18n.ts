import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';

// The en bundle ships statically with the init; the ru bundle is loaded
// lazily (see loadRu / whenReady below) so an en visitor never downloads
// it. The init itself STAYS a synchronous side effect of importing this
// module — src/tests/setup.ts, I18nProvider and Image all rely on that
// contract (resume-i18n-setup-init), and no env-init may hide in an
// import chain.
export const resources = {
  en: { translation: en },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// ----------------------------------------------
// Lazy ru locale (issue #298 follow-up)
// ----------------------------------------------
//
// i18next is initialized with `en` only (no backend, no
// partialBundledLanguages — init stays synchronous). For a ru visitor
// `whenReady` kicks off the ru.json dynamic import during module
// evaluation and src/main.tsx gates the FIRST RENDER on it, so the first
// frame is already fully Russian: no flash of en copy. Even while — or
// if — the ru bundle is missing, t() resolves through fallbackLng to the
// identical en key: raw-key echo is impossible in either load order.
// An en visitor never fetches ru.json at all.

let ruBundle: Promise<void> | undefined;

/** Idempotent: imports the ru.json chunk once and merges it into the store. */
export const loadRu = (): Promise<void> => {
  ruBundle ??= import('../locales/ru.json').then((module) => {
    i18n.addResourceBundle('ru', 'translation', module.default, true, true);
  });
  return ruBundle;
};

// `i18n.resolvedLanguage` stays undefined until a ru bundle exists (nothing
// re-runs setResolvedLanguage on the manual path), so the detector result —
// `i18n.language`, already normalized to `ru` by supportedLngs — is the
// detection source. A failed chunk fetch degrades to en, never to raw keys.
const detectedLanguage = (i18n.language ?? '').toLowerCase().split('-')[0];

/** Resolves once the detected language's bundle is in the store (≈sync for en). */
export const whenReady: Promise<void> =
  detectedLanguage === 'ru' ? loadRu().catch(() => undefined) : Promise.resolve();

export { i18n };
export default i18n;
