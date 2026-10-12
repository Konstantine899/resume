---
status: done
epic: admin-jobs-refactor
created: '2026-10-11'
verified: '2026-10-12'
---

# SPEC — features/AdminJobs (рефакторинг к паритету с AdminSkills)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_jobs_refactor.md`, rev.1 (draft, 2026-10-11). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Статус `approved` (вердикт владельца 2026-10-11: OPEN-1=A, OPEN-2=A, OPEN-3=B, OPEN-4=B).
> rev.2 (2026-10-11): терминология «поле = строка = должность» (вердикт владельца) + R-6 значок `IconButton` в шапке витрины.
> **done (2026-10-12)**: WU-1..9 исполнены, PR #216; гейты: validate 3431/3431, axe-stories 72/72, axe-app 0 регрессий, бандл 730.7 < 744 KiB. AA-фикс в ходе эпика: dark `--color-surface-tertiary` `#343231` → `#2e2c2b` (zebra/elevated 4.29:1 → 4.67:1 на `text-tertiary`).

## Цель

Привести `features/AdminJobs` к уровню отрефакторенного `AdminSkills`
(план `plan_admin_panel_edit.md`, PR #205): ARCH-1 layout, kit DataTable в
витрине, page-owned form-modal, confirm-modal с именем сущности и
retry-поведением, kit EmptyState, синхронизация лимитов схемы, чистка
мёртвого кода. Model-слой (slice/storage/seed) эталонный и не меняется.

## Контекст (факты, проверено 2026-10-11)

- Слой: `features/AdminJobs` (18 файлов, 2401 LOC, 72 теста), композиция
  страницы — `src/pages/Admin/ui/AdminJobsPage`; данные — `entities/Job` +
  слайс `adminJobs` + storage `resume.jobs` (persist-THEN-dispatch).
- Сегодня: плоский `ui/` (единственный в админ-семье вне ARCH-1), витрина —
  рукотворный `<ul>` (JobsList.tsx:96-136), пустое состояние — голый
  Paragraph (:94), confirm-modal без subtitle/initialFocus, persist-failure
  закрывает модалку (:70), форма инлайн под списком (AdminJobsPage.tsx:43),
  страница без тестов. БАГ: delete persist-ит `selectSortedJobs` (:51,67) —
  порядок в storage молча расходится со store.
- Кит: `DataTable` (Table + Pagination + PageSizeGroup, контролируемая
  сортировка — Skills-пилот WU-5c), `EmptyState`, `Modal` (subtitle,
  initialFocusRef), `Badge`, `Button`, `Form`, `Input`, `Select`, `DatePicker`
  (пилот WU-4 — не трогаем), `Heading`, `Paragraph`, `Toast`.
- Gold standard сравнения — `features/AdminSkills` (SkillsEditorList,
  AdminSkillsPage, AdminSkillsPage.test.tsx:25-66).
- Терминология (вердикт владельца 2026-10-11): «поле» таблицы = строка =
  одна должность (`JobRecord`); «заполненное поле» = добавленная должность.
  CRUD поля — это CRUD должности (R-3, R-5); «заполнять постепенно» =
  добавлять должности по мере необходимости через create-модалку. Отдельного
  полевого CRUD (значки внутри ячеек, динамические колонки, частичные
  записи) НЕ требуется.

## Скоуп

Меняются: `src/features/AdminJobs/**` (layout ui/, JobsList, импорты
JobForm), `src/pages/Admin/ui/AdminJobsPage/**`,
`src/entities/Job/model/schemes/schema.ts` (минимально — bullet max(200)),
локали `en.json`/`ru.json` (ключи adminJob*).

НЕ меняются: `jobsSlice.ts`, `storage.ts`, `seed.ts` и их тесты; витрина
`features/WorkHistory` и Design C; `storeReducers.ts` deep-import
(resume-lazy-rhf-chunk); поведение JobForm (кроме удаления h2 — форма теперь
в Modal, вердикт OPEN-1=A); публичные контракты kit-компонентов.

## Требования

### R-1 — ARCH-1 layout
- [x] Существуют `ui/JobForm/` (внутри `JobForm.tsx`, `JobForm.module.scss`,
      `JobForm.test.tsx`, `lib/jobFormSchema.{ts,test.ts}`) и `ui/JobsList/`
      (`JobsList.tsx`, `JobsList.module.scss`, `JobsList.test.tsx`).
- [x] В `src/features/AdminJobs/ui/` нет `.tsx`/`.scss` файлов на верхнем уровне.
- [x] `npm run validate` зелёный (public-api включительно); импорты резолвятся
      полными путями сегментов (прецедент `DatePicker/lib/isoDate.ts`).

### R-2 — persist-снимок в insertion-order (баг)
- [x] RED-тест доказывает: при `selectSortedJobs` ≠ порядку `selectAllJobs`
      удаление persist-ит массив в порядке `selectAllJobs` (состав = исходный
      минус удалённый).
- [x] Снимок для `persistJobs` берётся из `selectAllJobs`; рендер остаётся на
      `selectSortedJobs`; комментарий инварианта уточнён.

### R-3 — Confirm-delete parity с Skills
- [x] Subtitle модалки удаления называет компанию: ключ
      `adminJobConfirmDeleteName` (en+ru, `{{company}}`); заголовок ≠ label
      кнопки.
- [x] `initialFocusRef` → кнопка «Отмена».
- [x] При неудачном `persistJobs` модалка остаётся открытой (повтор), тост
      `adminJobPersistError` показан.
- [x] 3 новых теста зелёные: subtitle, фокус, persist-fail не закрывает.

### R-4 — Пустое состояние через kit EmptyState
- [x] Пустой список → kit `EmptyState` (public API) c
      `title={t('adminJobsEmpty')}`; голый Paragraph удалён; feature-SCSS
      пустого состояния нет (A2 у kit).

### R-5 — Форма в page-owned Modal / тест страницы
- [x] `AdminJobsPage` рендерит форму в kit `Modal`: `isOpen={form!==null}`,
      шапка `adminEditJob`/`adminAddJob`, ESC/overlay → `setForm(null)`;
      одновременно открыт не более одного диалога.
- [x] Внутренний `<Heading level={2}>` в `JobForm` удалён (A12
      `aria-dialog-name`: имя диалога = шапка модалки).
- [x] Существует `AdminJobsPage.test.tsx` (реальный
      `configureStore({reducer: storeReducers})`, моки только
      storage/i18n/toast — харнес `AdminSkillsPage.test.tsx:25-66`): create-
      open, edit-open, stale-record guard, ESC-close, единственный диалог.

### R-6 — Витрина на kit DataTable
- [x] `JobsList` использует kit `DataTable`: колонки company, position (en/ru),
      period, badges (current/featured), actions Edit/Delete (kit Button).
- [x] Контролируемая сортировка: сортировка сбрасывает страницу на 1
      (закреплено тестом; паттерн Skills WU-5a).
- [x] Page-size (5|10|20) и навигация видны при `rows > 0` (включая одну
      страницу); layout зеркалом Skills: page-size сверху справа, навигация
      снизу по центру.
- [x] Тесты: строка реально исчезает при delete; порядок persist→dispatch
      сохранён (shared `calls` array); переходы страниц; sort → page=1.
- [x] В шапке витрины (блок header над таблицей, паттерн
      `SkillsEditorList.tsx:232-238`) — kit `IconButton` с
      `aria-label={t('adminAddJob')}` вместо текстовой кнопки; клик вызывает
      `onAddJob` (create-модалка R-5). Дублирующая текстовая кнопка
      не сохраняется.
- [x] axe `/admin/jobs` — 0 регрессий (маршрут уже в PATHS).

### R-7 — Синхронизация лимитов entity-схемы
- [x] `entities/Job/model/schemes/schema.ts`: bullet в `description.{en,ru}`
      ограничен `max(200)` — зеркало `jobFormSchema.ts:59-61`.
- [x] Тест: 201-символьный bullet отклоняется `JobSchema.safeParse`.
- [x] Комментарий в schema.ts: «start не в будущем» осознанно формная
      граница (валидация UX-ввода), не entity-правило.

### R-8 — Гигиена i18n и баррела
- [x] Ключ `adminJobPosition` удалён из `en.json`/`ru.json` и из allowlist
      `locales-parity.test.ts:124`; parity-тест зелёный.
- [x] Из `index.ts` удалены экспорты без потребителей (`toggleCurrent`,
      `applyJobToggle`, `resetToDefaults`, `removeJobs`, `selectJobById`,
      `selectCurrentJob`); `check:public-api` зелёный. Кнопка
      Reset-to-defaults НЕ добавляется.

### R-9 — Известные проблемы вне скоупа (зафиксировать, не чинить)
- [x] `formatJobPeriod` хардкодит `"Present"` (entities/Job/lib/utils.ts) —
      отдельный entity-cleanup pass (вердикт OPEN-4=B).
- [x] Kit не имеет Checkbox/Switch и Chip/TagInput — нативный чекбокс-ряд и
      ручной чип-редактор остаются до отдельного kit-плана.
- [x] `model/selectors/index.ts` — OPEN-8 repo-wide (HomePage deep-import),
      не трогается этим эпиком; Select `error`-prop миграция — family-wide
      волна (OPEN-5).

### R-10 — Гейты эпика
- [x] `npm run validate` зелёный (type-check + lint + lint:styles + тесты с
      coverage + public-api).
- [x] `check:axe:stories` зелёный, если менялись сторисы (со `--build`).
- [x] axe-app `/admin/jobs`: 0 регрессий.
- [x] Бандл-дельта в капе `performance-budget.json` (737280) — замер worktree
      на merge-base с `dev`.
- [x] Все критерии R-1..R-8 закрыты; [TODO.md](./TODO.md) выжжен (выполненные
      пункты удалены, не отмечены).

## Критерии приёмки (итог)

Пользователь на `/admin/jobs` видит DataTable-витрину с сортировкой/пагинацией;
значок добавления в шапке витрины открывает create-модалку; удаление
подтверждается модалкой с названием компании, фокус на «Отмена», при ошибке
сохранения модалка не закрывается; форма открывается в модальном окне,
закрывается по ESC; пустой список — kit EmptyState; после удаления
порядок в localStorage совпадает с порядком в store; `npm run validate` и axe
зелёные.
