---
status: approved
epic: about-admin-sections
created: '2026-11-01'
spec: SPEC.md
---

# TODO — entities/AboutContent (контракт v3)

> План к [SPEC.md](./SPEC.md) (approved). Пункты сгорают удалением.

## WU

- [ ] **WU-2 — контракт v3** (общая ветка эпика, после backend WU-1): - `model/types/types.ts`: `stack?: string[]`; - `model/services/schema.ts`: optional-слой `stack` (slug-regex,
      кап 20, `[]` валиден; envelope `v:1` не трогаем); - seed-compat: `createAboutSeed` БЕЗ `stack`; - `AboutContentDto` (`shared/api/types`) += `stack`; - тесты: legacy без поля, порядок, кап, не-slug, `[]` vs
      `undefined`, seed.
- [ ] Гейты: `npm run validate`, `npm run check:spec`, бандл-дельта
      (~0 ожидается).
