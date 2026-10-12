---
status: approved
spec: SPEC.md
---

# TODO — features/AdminAbout (рефакторинг к паритету с AdminSkills, rev.1)

Компаньон к [SPEC.md](./SPEC.md) rev.1 (эпик `admin-about-refactor`). Исходный план:
vault `wiki/plan/plan_admin_about_refactor.md`. Правила: выполненный пункт УДАЛЯЕТСЯ
(не отмечается); пункт без критерия не ревьюивается. Вердикт владельца 2026-10-12:
OPEN-1 = B (инлайн), OPEN-2 = A (срез мёртвых экспортов), OPEN-3 = A (axe PATHS).

## WU-1 — Reset-confirm на kit Modal (SPEC R-1, TDD)

- [ ] RED: переписать 2 confirm-теста (`AboutEditorForm.test.tsx:175-204`)
      под Modal-кейсы + 3 новых: subtitle с `{{name}}` = текущий fullName,
      фокус на «Отмена», ESC/overlay закрывает без действий.
- [ ] GREEN: `AboutEditorForm.tsx` — состояние `isResetConfirmOpen`; кнопка
      `aboutReset` открывает kit Modal (паттерн
      `SkillsEditorList.tsx:360-383`: title `aboutReset`, subtitle
      `aboutResetConfirm` с `{{name}}` из `values.fullName`, footer Отмена +
      danger-Reset, `initialFocusRef`→Отмена); `window.confirm` (:126)
      удалён; confirmed → `removeAboutContent` → dispatch → `reset(seed)`.
- [ ] Локали: `aboutResetConfirm` (en+ru) получает `{{name}}`; новый ключ
      `aboutCancel` (en+ru); allowlist `locales-parity.test.ts` пополнен
      `aboutCancel`.

## WU-2 — Тест страницы (SPEC R-2)

- [ ] Новый `src/pages/Admin/ui/AdminAboutPage/AdminAboutPage.test.tsx`
      (харнес `AdminSkillsPage.test.tsx:25-66`: реальный
      `configureStore({ reducer: storeReducers })`, моки storage/i18n/toast):
      рендер формы, prefill из storage, save-smoke, reset-кнопка видна.

## WU-3 — Гигиена: axe PATHS + баррел (SPEC R-3/R-4)

- [ ] `scripts/purge-axe-check.mjs:37` — PATHS += `'/admin/about'`;
      axe-app прогнать, вскрытые нарушения починить.
- [ ] Вырезать из `index.ts` 7 мёртвых экспортов
      (`selectAboutContent`, `ABOUT_CONTENT_STORAGE_KEY`, `readAboutContent`,
      `aboutContentReducer`, `resetToDefaults`, `updateAboutContent`,
      `AboutContentRootState`); сохранить `AboutEditorForm`(+Props),
      `createAboutSeed`, `persistAboutContent`, `removeAboutContent`;
      `check:public-api` зелёный. Deep-import `storeReducers.ts:12` /
      `HomePage.tsx:4` не трогать.

## WU-4 — Гейты эпика (SPEC R-6)

- [ ] `npm run validate` в CPU-окне (<45%) зелёный.
- [ ] axe-app: 0 регрессий (PATHS с `/admin/about`).
- [ ] Бандл-дельта worktree на merge-base: в капе 737280.
- [ ] en/ru parity-тест зелёный.
- [ ] Секция R-5 «Известные ограничения» сверена с кодом — соответствует
      фактическому состоянию.
- [ ] SPEC.md: критерии R-1..R-4 закрыты, статус → `done`, дата `verified`.
- [ ] Дуал-райт: gotcha-записи в AGENTS.md/engram по итогам эпика.

## Решения (вердикт владельца 2026-10-12)

- OPEN-1 = B (форма остаётся инлайн)
- OPEN-2 = A (срез 7 мёртвых экспортов)
- OPEN-3 = A (PATHS += /admin/about)
