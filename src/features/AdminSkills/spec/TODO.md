---
status: done
spec: SPEC.md
---

# TODO — features/AdminSkills (действия-иконки, rev.3)

> **Закрыто 2026-10-12**: эпик `skills-actions-polish` выполнен в auto-режиме, squash **PR #221** (`6806cc4` WU-1 → `7143135` WU-2 → `e86196f` правка заголовка колонки по итогам превью-ревизии). Контракт закрыт: SPEC rev.3 `status: done`, `verified: '2026-10-12'`.
>
> Гейты: validate 3506/3506, axe-app 0 регрессий (baseline 4), bundle 744 KiB cap зелёный, public-api 37/37; превью light+dark — 6 Card-блоков, тултипы hover, «Действия» справа.
>
> Отклонение по ходу: kit Tooltip оказался строго однорежимным (hover|focus|click) — владелец утвердил hover-only (SPEC A14), keyboard-доступ через aria-label; follow-up: issue #222 (combined trigger). Партнёр-файлы: SPEC.md, vault `wiki/plan/plan_skills_actions_polish.md`.
