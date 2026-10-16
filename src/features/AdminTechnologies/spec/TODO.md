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
