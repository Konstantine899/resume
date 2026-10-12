---
status: approved
spec: SPEC.md
---

# TODO — features/AdminAbout (рефакторинг к паритету с AdminSkills, rev.1)

Компаньон к [SPEC.md](./SPEC.md) rev.1 (эпик `admin-about-refactor`). Исходный план:
vault `wiki/plan/plan_admin_about_refactor.md`. Правила: выполненный пункт УДАЛЯЕТСЯ
(не отмечается); пункт без критерия не ревьюивается. Вердикт владельца 2026-10-12:
OPEN-1 = B (инлайн), OPEN-2 = A (срез мёртвых экспортов), OPEN-3 = A (axe PATHS).

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
