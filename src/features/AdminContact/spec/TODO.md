---
status: done
epic: contact-row-textarea
issue: 289
created: '2026-10-18'
verified: '2026-10-18'
spec: SPEC.md
---

# TODO — contact-row-textarea (сожжён)

> Эпик ЗАКРЫТ 2026-10-18: squash `e00c6ea` (PR #290, CI все зелёные),
> issue #289 закрыт вручную. План: vault `plan_admin_contact_migration.md`
> rev.6 §10.1 (директива владельца 2026-10-18, авто-режим, оценка ≈40–60
> мин показана перед стартом).
>
> Выполнено WU-1..4: EN/RU-значения `ContactRowForm` → kit `Textarea`
> (`rows=3`, `autoResize`, `maxLength` = кап таблицы 600/120, тот же
> `error`-контракт); `key` (slug) и email остались `Input`; таблицы
> vitrina и локали не тронуты. TDD: RED (ассерты TEXTAREA на Input-
> рендере) → GREEN; гейты: validate 3749/3749, check:spec 17, axe 0
> регрессий, бандл в бюджете 840 KiB (Δ≈0). Контракт — в
> [SPEC.md](./SPEC.md); история — в git.
