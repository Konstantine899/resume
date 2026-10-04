// ============================================
// i18n shared types (plan About/Contact CRUD §5)
// ============================================
//
// Single home for i18n types: `Language`, the hook context, and
// `LocalizedText` — the bilingual record shared by BOTH CRUD contracts
// (About + Contact). It lives in `shared` because `entities → entities`
// is banned by the FSD matrix: Contact's contract cannot reuse a type
// declared inside `entities/AboutContent`.
//
// (formerly `types/types.ts` — merged here so the plan's import path
// `@/shared/lib/i18n/types` resolves to a real file, not a shadow of
// the old `types/` directory.)

export type Language = 'en' | 'ru';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

/** A string rendered in both locales, e.g. `{ en: 'Hire Me', ru: 'Наймите Меня' }`. */
export type LocalizedText = Record<Language, string>;
