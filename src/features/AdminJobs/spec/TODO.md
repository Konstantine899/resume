---
status: approved
spec: SPEC.md
---

# TODO — features/AdminJobs (пер-филд модалки, rev.4, epic job-field-edit)

> План: vault `wiki/plan/plan_job_field_edit.md` (approved, auto-режим). Спека: [SPEC.md](./SPEC.md) rev.4.
> Пункты удаляются по мере выполнения (правило 4); шапка TODO заменяется closing-note на бёрн-дауне.
> **Auto-режим (директива владельца 2026-10-14):** все WU исполняются последовательно без пауз и без запроса подтверждений; гейты, merge, burn-down и dual-write — автоматически.

## WU-1 — lib-слой + FieldEditForm (TDD)

- [ ] Вынести zod-срезы полей из `jobFormSchema.ts` в общий модуль (shared с FieldEditForm); пересобрать `jobFormSchema` — существующие form-тесты зелёные без правок (SPEC R-1 r4).
- [ ] i18n: `adminJobEditFieldTitle` = «Редактировать: {{field}}» / «Edit: {{field}}» (en+ru, flat; SPEC R-4 r4).
- [ ] `ui/FieldEditForm/` (ARCH-1): свитч по 5 полям, per-field zod из lib, RHF (Save disabled без isDirty), persist-THEN-dispatch partial + тосты (SPEC R-2 r4).
- [ ] RED→GREEN тесты формы: prefill каждого поля, валидация (min/max зеркально JobForm), save-порядок persist→dispatch, persist-fail, Cancel; technologies — чип-паритет; period — DatePicker×2 + current (fake timers `toFake: ['Date']`).

## WU-2 — Wiring (TDD)

- [ ] `JobCard`: scalar-row `Pencil` → `onEditField(job, fieldKey)`; заголовочный — без изменений (SPEC R-3 r4).
- [ ] `JobsList`: проп `onEditField` пробрасывается (SPEC R-3 r4).
- [ ] `AdminJobsPage`: state `{ job?, field? } | { job } | {} | null`; контент модалки `FieldEditForm` (key `${id}-${field}`) | `JobForm` (key id); title по полю (SPEC R-3 r4).
- [ ] Page-тесты (`AdminJobsPage.test`, expand-first хелпер): «Пencil строки Период → только даты», «Локация → только location», заголовок «Редактировать: …», шапочный Pencil → полная форма, create не сломан (SPEC R-6 r4).

## WU-3 — Гейты и burn-down

- [ ] `npm run validate` (CPU-окно <45% / реран флэйков), `check:axe` 0 регрессий, `check:bundle` ≤ 737280, `check:public-api`, `check:spec` (SPEC R-6 r4).
- [ ] Превью light+dark: 5 полей × свои модалки, Save/Cancel/ESC, чипы, период+current.
- [ ] Пуш → DRAFT PR → ready → squash auto-merge + удаление ветки; burn-down docs-PR (SPEC/TODO → done + verified); dual-write: vault `memory.md` + AGENTS.md gotcha `resume-job-field-edit`.
