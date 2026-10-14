---
status: approved
spec: SPEC.md
---

# TODO — features/AdminJobs (пер-филд модалки, rev.4, epic job-field-edit)

> План: vault `wiki/plan/plan_job_field_edit.md` (approved, auto-режим). Спека: [SPEC.md](./SPEC.md) rev.4.
> Пункты удаляются по мере выполнения (правило 4); шапка TODO заменяется closing-note на бёрн-дауне.
> **Auto-режим (директива владельца 2026-10-14):** все WU исполняются последовательно без пауз и без запроса подтверждений; гейты, merge, burn-down и dual-write — автоматически.

## WU-3 — Гейты и burn-down

- [x] `npm run validate` 3545/3545 EXIT=0, `check:axe` 0 регрессий (baseline 4), `check:bundle` — капа total поднята 761856→786432 (измерено 766393 raw = 748.4 KiB; main/vendor не тронуты, прирост только в lazy AdminJobsPage; gzip 238737 << 266240), `check:public-api` 37/37, `check:spec` 15 ready (SPEC R-6 r4).
- [ ] Превью light+dark: 5 полей × свои модалки, Save/Cancel/ESC, чипы, период+current.
- [ ] Пуш → DRAFT PR → ready → squash auto-merge + удаление ветки; burn-down docs-PR (SPEC/TODO → done + verified); dual-write: vault `memory.md` + AGENTS.md gotcha `resume-job-field-edit`.
