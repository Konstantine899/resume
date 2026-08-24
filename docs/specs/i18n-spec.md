# Internationalization — i18n Spec

## Stack

- **i18next** + **react-i18next**
- **i18next-browser-languagedetector** — detects from localStorage then navigator
- Config: `src/shared/lib/i18n/config/i18n.ts`
- Hook: `src/shared/lib/i18n/hooks/useLanguage.ts`

## Languages

- `en` (English) — default, fallback
- `ru` (Russian)

## Translation files

`src/shared/lib/i18n/locales/{en,ru}.json` — flat key structure, no nesting.

44 keys total, same set in both files. Examples:

| Key           | English              | Russian              |
| ------------- | -------------------- | -------------------- |
| `greeting`    | Hi, I'm              | Привет, я            |
| `name`        | Konstantin           | Константин           |
| `profession`  | Full Stack Developer | Full Stack Developer |
| `mySkills`    | My Skills            | Мои Навыки           |
| `sendMessage` | Send Message         | Отправить Сообщение  |

## Hook API

```typescript
useLanguage() => {
  language: 'en' | 'ru',
  setLanguage: (lang: Language) => void,
  toggleLanguage: () => void,
  t: TFunction,    // from react-i18next useTranslation()
  isTransitioning: boolean
}
```

## How to add a new key

1. Add key + value to `en.json`
2. Add key + translated value to `ru.json`
3. Use `t('keyName')` in components

## Consumers

All features (Hero, About, Skills, MyWork, WorkHistory, Contact), both widgets (Sidebar, LanguageSwitch, ThemeSwitch), and Developer entity reference i18n keys directly or via the hook.
