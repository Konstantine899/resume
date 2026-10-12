---
status: approved
spec: SPEC.md
---

# TODO — features/AdminJobs (рефакторинг к паритету с AdminSkills, rev.2)

Компаньон к [SPEC.md](./SPEC.md) rev.2 (эпик `admin-jobs-refactor`). Исходный план:
vault `wiki/plan/plan_admin_jobs_refactor.md`. Правила: выполненный пункт УДАЛЯЕТСЯ
(не отмечается); пункт без критерия не ревьюивается. Вердикт владельца 2026-10-11:
OPEN-1=A (модалка), OPEN-2=A (DataTable), OPEN-3=B (срез мёртвых экспортов),
OPEN-4=B («Present» отдельным pass).

## WU-1 — ARCH-1 layout (SPEC R-1)

- [ ] `git mv` `ui/JobForm.{tsx,module.scss,test.tsx}` → `ui/JobForm/`,
      `ui/JobsList.*` → `ui/JobsList/`, `ui/lib/jobFormSchema.{ts,test.ts}` →
      `ui/JobForm/lib/` (прецедент `DatePicker/lib/isoDate.ts`).
- [ ] Переписать импорты tsc-driven (TS2307 → фикс → повтор; без blanket-sed):
      баррел `index.ts`, внутренние импорты, тесты.
- [ ] Гейт: `npm run validate`; на верхнем уровне `ui/` нет `.tsx`/`.scss`.

## WU-2 — persist-снимок insertion-order (SPEC R-2, TDD)

- [ ] RED: тест в `ui/JobsList/JobsList.test.tsx` — сортированный рендер ≠
      порядку `selectAllJobs`; delete persist-ит в порядке `selectAllJobs`.
- [ ] GREEN: `JobsList.tsx` — снимок для `persistJobs` из `selectAllJobs`
      (рендер `selectSortedJobs` оставить); уточнить комментарий инварианта.

## WU-3 — Confirm-delete parity (SPEC R-3)

- [ ] Локали: ключ `adminJobConfirmDeleteName` (en+ru, `{{company}}`); заголовок
      модалки ≠ label кнопки.
- [ ] `JobsList.tsx`: subtitle с именем компании, `initialFocusRef` → «Отмена».
- [ ] Persist-failure: модалка остаётся открытой (`setDeleting(false); return;`).
- [ ] Тесты: subtitle-текст, фокус на «Отмена», persist-fail не закрывает.

## WU-4 — EmptyState (SPEC R-4)

- [ ] `JobsList.tsx`: `Paragraph adminJobsEmpty` → kit `EmptyState
      title={t('adminJobsEmpty')}`; удалить связанный SCSS, если есть.
- [ ] Тест: пустой список рендерит EmptyState.

## WU-5 — Страница: Modal + тест (SPEC R-5)

- [ ] `AdminJobsPage.tsx` — kit Modal вокруг `JobForm` (`isOpen={form!==null}`,
      шапка `adminEditJob`/`adminAddJob`, ESC/overlay → `setForm(null)`);
      удалить h2 внутри `JobForm.tsx` (A12).
- [ ] Новый `pages/Admin/ui/AdminJobsPage/AdminJobsPage.test.tsx` (харнес
      `AdminSkillsPage.test.tsx:25-66`): create-open, edit-open, stale-guard,
      ESC-close, единственный диалог.

## WU-6 — Витрина DataTable (SPEC R-6)

- [ ] `JobsList.tsx` → kit `DataTable`; колонки company /
      position(en,ru) / period / badges / actions; сортировка сбрасывает
      страницу (тест); layout зеркалом Skills (page-size сверху справа,
      навигация снизу по центру, контролы при rows>0).
- [ ] Шапка витрины: текстовая кнопка `adminAddJob` (`JobsList.tsx:88-90`)
      → kit `IconButton` (`aria-label={t('adminAddJob')}`, паттерн
      `SkillsEditorList.tsx:232-238`); тест: клик по значку вызывает
      `onAddJob` (create-модалка WU-5).
- [ ] Новые i18n-ключи заголовков колонок при необходимости
      (`adminJobsTable*`, en+ru).
- [ ] Тесты: row-disappears, порядок persist→dispatch (`calls` array), переходы
      страниц, sort → page=1.
- [ ] Гейт: axe `/admin/jobs` — 0 регрессий.

## WU-7 — Лимиты entity-схемы (SPEC R-7)

- [ ] `entities/Job/model/schemes/schema.ts`: `max(200)` на bullet в
      `description.{en,ru}`; комментарий о формной границе «start не в
      будущем».
- [ ] Тест: 201-символьный bullet отклоняется `JobSchema.safeParse`.

## WU-8 — Гигиена (SPEC R-8)

- [ ] Удалить ключ `adminJobPosition` из `en.json`/`ru.json` и из allowlist
      `locales-parity.test.ts:124`; parity-тест зелёный.
- [ ] Вырезать из `index.ts` мёртвые экспорты (`toggleCurrent`,
      `applyJobToggle`, `resetToDefaults`, `removeJobs`, `selectJobById`,
      `selectCurrentJob`); пересмотреть их тесты; `check:public-api` зелёный.

## WU-9 — Гейты эпика (SPEC R-10)

- [ ] `npm run validate` в CPU-окне (<45%) зелёный.
- [ ] `npm run check:axe:stories` (со `--build`; сторисы опциональны).
- [ ] axe-app `/admin/jobs`: 0 регрессий против baseline.
- [ ] Бандл-дельта worktree на merge-base: в капе 737280.
- [ ] SPEC.md: критерии R-1..R-8 закрыты, статус → `done`, дата `verified`.
- [ ] Дуал-райт: gotcha-записи в AGENTS.md/engram по итогам эпика.
