---
status: approved
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

- [ ] **WU-1 — backend stack** (ветка `feat/about-stack-contract`):
      схема + Prisma-миграция + aggregate + репозиторий/DTO + e2e
      (GET/PUT round-trip) — см. backend-пару. Порядок релиза
      backend → frontend (`.strict()`).
- [ ] **WU-2 — frontend контракт v3**: `entities/AboutContent`
      schema/types/seed-compat + `AboutContentDto` — см. entities-пару.
- [ ] **WU-3 — витрина About**: бейджи из `content.stack ?? PROFILE_STACK` + резолв имён; characterization DOM-паритет; SCSS `features/About`
      НЕ трогаем.
- [ ] **WU-4 — разбивка админки на карточки**: ПЕРЕД стартом перепроверить
      фактический размер бандла (замер ~904.8 КБ устарел, headroom ~7 KiB
      не подтверждён). `AboutEditorList` → 5 Card-блоков (R-1, R-2 persist
      collapse, R-3 фокус/скролл), удаление единой таблицы + мёртвого SCSS.
- [ ] **WU-5 — блок «Технологии»**: тоггл-чипы, `stack` в save-seam,
      honest-data-ключ (R-4), EmptyState.
- [ ] **WU-6 — i18n + гейты**: новые flat-ключи en+ru (parity +
      existence-guard), превью-смоук light+dark, axe, bundle-дельта
      (зафиксировать по WU).
- [ ] **WU-7 — burn-down**: SPEC/TODO → `status: done`, факты сверить
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
