---
status: approved
spec: SPEC.md
---

# TODO — features/AdminJobs (селект статуса записи, rev.5, epic job-status-select)

> Компаньон к [SPEC.md](./SPEC.md) rev.5 (`approved`). План: vault
> `wiki/plan/plan_job_status_select.md` (draft → утверждение владельца).
> TDD: RED-тесты ПЕРЕД реализацией. Пункты сгорают по мере работы (правило 4).

## WU-1 — Селект в JobForm (TDD)

- [ ] RED: рендер селекта — 3 опции (`''`/`'current'`/`'featured'` →
      `adminJobStatusNone`/`adminJobCurrent`/`adminJobFeatured`) через
      `getAllByRole('option')` + label `adminJobStatus` через
      `getByLabelText`; пустая опция выбираема (обычная option `value:''`,
      kit `Select.tsx:76`; НЕ placeholder-проп).
- [ ] RED: выбор значения через `fireEvent.change(select,
{target:{value:'current'}})` ⇒ `current=true, endDate=''`, DatePicker
      и его calendar-trigger disabled (A6-паритет `toggleCurrent`);
      `'featured'` ⇒ `featured=true, current=false`, `endDate` не тронут;
      `''` ⇒ оба false; все `setValue` dirty (Save разблокирован).
- [ ] RED: prefill 4 типов записи — ни одного → `''`, current → `'current'`,
      featured → `'featured'`, **оба → `'current'`** (вариант A, значение
      производное от булево).
- [ ] RED: **submit-нормализация** — запись «оба» + нетронутый селект +
      Save (после любого isDirty-действия) ⇒ в persist/update DTO
      `featured=false, current=true`; в `handleSave` флаги берутся из
      производного значения (`JobForm.tsx:110`).
- [ ] RED: переписать ровно 3 существующих теста `JobForm.test.tsx`
      (тестов на `#job-form-current`/`#job-form-featured` id в репо НЕТ):
      :127 лейбл-список (`adminJobCurrent`/`adminJobFeatured` →
      `adminJobStatus` + опции), :164 A6-click, :180 A6-calendar-trigger.
      Тесты на id → ожидаемый red→green, не регрессия; `jobFormSchema.test`
      остаётся зелёным БЕЗ правок.
- [ ] GREEN: kit `Select` `job-form-status` на месте current-чекбокса
      (обёртка `.field`), оба чекбокса удалены; `setValue`-маппинг через
      существующий `toggleCurrent` для A6; `value` производное
      (`values.current ? 'current' : values.featured ? 'featured' : ''`).
- [ ] GREEN: submit-нормализация в `handleSave`; удалить мёртвый
      `.checkRow` из `JobForm.module.scss` (последние использования — строки
      350/447; `.checkRow` в `FieldEditForm.module.scss` не трогать — там
      свой чекбокс Period).

## WU-2 — i18n

- [ ] `adminJobStatus` («Статус записи» / «Record status») +
      `adminJobStatusNone` («Обычная запись» / «Standard entry») в ОБЕИХ
      `en.json`/`ru.json` (flat, без точек).
- [ ] `locales-parity.test.ts` зелёный БЕЗ правки; хардкода строк в
      компоненте нет.

## WU-3 — Гейты

- [ ] `npm run validate` зелёный (CPU-окно <45%); `check:spec` ready.
      Контроль «ничего не сломано»: `FieldEditForm.test` (3 теста на
      `adminJobCurrent`), `locales-parity`, `AdminJobsPage.test`,
      `JobCard.test`, `jobFormSchema.test` — зелёные БЕЗ правок.
- [ ] `check:axe` 0 регрессий (light+dark, `/admin/jobs` в PATHS).
- [ ] Бандл-дельта worktree на merge-base ≤ 786432 (ожидание Δ 0);
      `check:public-api` 37/37.
- [ ] Превью light+dark: 3 опции, A6 туда-обратно, edit 4 типов записей
      (оба → показ `'current'`).

## WU-4 — Merge + burn-down

- [ ] Ветка `feat/job-status-select` от свежего `origin/dev`, DRAFT PR →
      `dev`; merge после зелёного CI + явного одобрения (auto-режим
      plan-run — по утверждению плана).
- [ ] Burn-down: SPEC/TODO → `status: done` + `verified`, план → `done`;
      dual-write: vault `memory.md` + AGENTS.md gotcha.
