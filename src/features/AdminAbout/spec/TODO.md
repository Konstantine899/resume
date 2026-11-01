---
status: done
epic: about-admin-sections
created: '2026-11-01'
spec: SPEC.md
---

# TODO — features/AdminAbout (секционная админка)

> План к [SPEC.md](./SPEC.md) (approved, вердикт владельца 2026-11-01).
> Источник: vault `about-admin-sections-refactor.md` rev.2, execution_mode:
> automatic. Пункты сгорают УДАЛЕНИЕМ, не галочкой. Статусы frontmatter
> пары: draft → approved → done.

## WU

      honest-data-ключ (R-4), EmptyState.
      existence-guard), превью-смоук light+dark, axe, bundle-дельта
      (зафиксировать по WU).
      grep'ом (правило 7), PR `--base dev` squash, issue close вручную
      (`Closes #N` в dev не работает).

## Гейты (каждый WU)

- `npm run validate` (type-check + lint + lint:styles + vitest+coverage +
  check:public-api), `npm run check:spec`, `npm run check:axe`
  (PATHS содержит `/admin/about`; baseline обновлять ТОЛЬКО локально),
  `npm run build` + `npm run check:bundle` (кап 933888 НЕ трогать),
  превью-смоук light+dark.
- `gh pr create` ВСЕГДА с `--base dev`; merge только после зелёных
  чеков и слова владельца (auto-mode: мерж по зелёным, кроме approval-gate
  пунктов).
- `git status` перед коммитом spec-пары (`.gitignore` игнорирует `*.md`).

## UI cleanup v2 (automatic)

Status: approved (automatic)
Date: 2026-11-01

### WU

- Header/collapsed ownership
- Table conversions
- CTA modal
- Tech table + modal
- i18n parity/existence-guard
- a11y
- migration + regression
- gates

Execution mode: automatic (auto WU, burn down, CI green, merge ready).
