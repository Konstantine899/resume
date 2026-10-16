---
status: draft
epic: technologies-crud
issue: 258
created: '2026-10-16'
spec: SPEC.md
---

# TODO — features/AdminTechnologies (админ-каталог технологий)

> Сгорает по мере работы: пункт выполнен → удаляется (AGENTS.md, Spec-driven features).
> Контракт — [SPEC.md](./SPEC.md). Язык: русский (правило владельца).

## WU-4 — Страница, маршрут, сайдбар, i18n

- [ ] `pages/Admin/ui/AdminTechnologiesPage/` + тест (page-owned modal state:
      create/edit/delete/guard/ESC/единственный диалог; харнес AdminSkillsPage).
- [ ] `routerConfig.tsx` — lazy-ребёнок `technologies`; `AppRouter.test.tsx` 7 → 8.
- [ ] `AdminLayout.tsx` — `<Link> adminNavTechnologies` + assertion в `AdminLayout.test.tsx`.
- [ ] i18n-ключи в `en.json` + `ru.json` (плоские); parity-тест зелёный.
- [ ] `usedKeys`-винiring (D6): страница строит из `selectAllProjects`.

## WU-5 — Гейты (по порядку)

- [ ] prettier-check по тронутым файлам; `npm run validate`.
- [ ] `npm run check:spec`.
- [ ] `npm run build` + `npm run check:bundle` (кап `total.maxSize` при необходимости).
- [ ] `scripts/purge-axe-check.mjs`: PATHS += `/admin/technologies`;
      `npm run check:axe` — 0 регрессий.

## WU-6 — Мерж

- [ ] push; `gh pr ready`; poll `gh pr checks`; `gh pr merge --squash --delete-branch`.
- [ ] `gh issue close 258` (ручное закрытие — `Closes #N` не срабатывает на dev-мержах).
- [ ] `git checkout dev && git pull origin dev`.
