---
name: i18n-first
description: "Trigger: user-facing string, UI text, hardcoded label, aria-label, translation, i18n. Put all user-facing strings through the project i18n system; hardcoded UI copy is forbidden."
license: Apache-2.0
metadata:
  author: "konstantine"
  version: "1.0"
---

# i18n-First

## Activation Contract

Load before writing or editing any user-facing string: labels, buttons, aria-labels, placeholders, messages, toasts, or copy.

## Hard Rules

1. Every user-facing string MUST come from the i18n system (`useTranslation` / `useLanguage`). Hardcoded UI copy is forbidden — including English and Russian.
2. Aria-labels, placeholders, and screen-reader text are user-facing: translate them too.
3. Do not pass `t` as a prop to bypass hooks; call `useTranslation`/`useLanguage` where the string is used.
4. For a new UI language, all strings of that feature are added to the same translation files as existing keys — no new storage mechanism.

## Decision Gates

| Situation | Action |
|-----------|--------|
| String is user-facing | Add translation key, use `t('...')` |
| String is aria/placeholder | Same — translate, do not hardcode |
| Component receives `t` as prop | Refactor to call the hook locally |
| Locale is not loaded | Use the project's existing i18n config, not a fallback string |

## Execution Steps

1. Check the existing i18n files for the key; reuse if present.
2. Add the key to all locale files with a value in each language.
3. Replace the hardcoded string with `t('key')` at the usage site.
4. Grep for other hardcoded user-facing strings in the touched slice; fix them in the same change.

## Output Contract

Report: keys added (per locale), strings replaced, and any other hardcoded strings found and fixed in the same slice.

## References

- `src/shared/lib/i18n/config/i18n.ts` — i18n config, language detector, persisted locale
- `src/shared/lib/i18n/hooks/useLanguage.ts` — locale hook (`t`, `language`, `setLanguage`)
- `src/shared/lib/i18n/locales/` — translation files (`en.json`, `ru.json`)