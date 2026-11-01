---
status: approved
epic: about-admin-sections
created: '2026-11-01'
spec: 1
---

# SPEC — entities/AboutContent (контракт v3, поле `stack`)

> Единственная истина контракта для эпика `about-admin-sections`.
> Статусы: `draft` → `approved` → `done`. Источник: vault
> `about-admin-sections-refactor.md` rev.2; вердикт OPEN-4 — 2026-11-01.
> Companion: [TODO.md](./TODO.md). Язык: русский.

## Цель

Контракт `AboutContent` становится v3 = superset v2: появляется optional
поле `stack` — выбранные оператором технологии в порядке документа.
Legacy-документы остаются валидными БЕЗ миграции (envelope `v:1`
не меняется).

## Решения

- **E-1 — `stack?: string[]`**: ключи каталога `entities/Technology`
  (slug, ≤20 элементов), порядок = порядок документа. Поле optional.
- **E-2 — семантика значений (вердикт OPEN-4=А)**:
  - `undefined` (поля нет) → витрина фолбэчит `PROFILE_STACK`
    (legacy-поведение, DOM идентичен);
  - `[]` → ОСОЗНАННО пустой стек: витрина не показывает бейджей;
  - seed/Reset НЕ пишет `stack` (документ остаётся `undefined`).
- **E-3 — только ключи, не имена**: контракт хранит ТОЛЬКО slug-ключи —
  резолв `name ?? key` живёт в features (FSD `resume-fsd-cross-slice`:
  entities→entities запрещён).
- **E-4 — валидация**: фронтенд-схема (НЕ `.strict()`, envelope `v:1`)
  принимает `stack` опционально: каждый элемент — slug-regex
  `technologyUpsertSchema.key`, кап 20, порядок сохраняется; пустой
  массив валиден.
- **E-5 — DTO**: `AboutContentDto` в `shared/api/types` += `stack`;
  гидрация GET пробрасывает поле в документ (отсутствие → `undefined`,
  не `[]`).

## Контракт (наблюдаемое поведение)

- Документ без `stack` валиден и идентичен v2 (тесты совместимости).
- `stack: ['react','nodejs']` сохраняется и читается в порядке документа.
- Не-slug ключ и `stack.length > 20` → отказ схемы (тесты).
- `stack: []` валиден и сохраняется как «пусто» (не уходит в
  `undefined`).
- Сид/Reset не создаёт `stack`.

## Критерии готовности

- [ ] `AboutContentSchema` принимает legacy-документ без `stack`
      (существующие тесты БЕЗ правок).
- [ ] `stack` optional: валиден порядок, кап 20, slug-формат; `[]`
      валиден; не-slug → отказ (тесты RED→GREEN).
- [ ] `stack: []` и `stack: undefined` различаются на уровне контракта
      (тест фиксирует оба исхода).
- [ ] Seed/Reset не пишет `stack` (тест).
- [ ] `AboutContentDto` + гидрация: GET-документ с `stack` доходит до
      формы; без поля — `undefined`.
- [ ] Envelope `v:1` не тронут; `npm run validate` + `check:spec` зелёные.

## Вне скоупа

- UI карточек/чипов — `features/AdminAbout/spec/`.
- Backend-схема, Prisma, e2e — `backend/src/modules/content/spec/`.
- `PROFILE_STACK`/`SkillsCode` (OPEN-3) — не трогаются.
