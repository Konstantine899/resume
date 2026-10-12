---
status: approved
epic: admin-mywork-refactor
created: '2026-10-11'
---

# SPEC — features/AdminMyWork (рефакторинг к паритету с AdminSkills)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_mywork_refactor.md`, rev.1 (draft, 2026-10-11). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Статус `approved` — вердикт владельца 2026-10-12: OPEN-1 = A, OPEN-2 = A, OPEN-3 = A, OPEN-4 = A (рекомендации приняты без изменений).

## Цель

Привести `features/AdminMyWork` к уровню отрефакторенного `AdminSkills`
(план `plan_admin_panel_edit.md`, PR #205): confirm-modal с именем сущности
и retry-поведением, kit EmptyState, page-owned form-modal с тестом
страницы, kit DataTable в витрине, гигиена баррела, ARCH-1 докрутка.
Model-слой (slice/storage/seed) эталонный и не меняется; FileUpload-пилот
(project-images, PR #209) не трогается.

## Контекст (факты, проверено 2026-10-11)

- Слой: `features/AdminMyWork` (ui: MyWorkEditorList.tsx 147 LOC,
  ProjectForm.tsx 472 LOC, projectFormSchema.ts 108 LOC; model:
  myWorkSlice.ts/storage.ts по 69 LOC; 68 тестов), композиция страницы —
  `src/pages/Admin/ui/AdminMyWorkPage` (44 LOC, без тестов); данные —
  `entities/Project` + слайс `myWork` + storage `resume.projects`
  (persist-THEN-dispatch).
- Сегодня: confirm-modal списка без subtitle-имени/initialFocus,
  persist-fail закрывает модалку (MyWorkEditorList.tsx:71-75); две
  confirm-модалки ВНУТРИ формы (ProjectForm.tsx:431-467, persist-fail
  :194-197); пустое состояние — голый Paragraph (:84-90); витрина —
  рукотворный `<ul>` без шапки/DataTable/пагинации (:94-123); форма
  инлайн под списком с h2 внутри (AdminMyWorkPage.tsx:38,
  ProjectForm.tsx:217-220); `ui/lib/projectFormSchema.ts` вне
  компонентной директории; баррел — 12 значений + 2 типа без
  production-потребителей (index.ts:16-33).
- ОПРОВЕРГНУТО (WU не заводим): persist-order бага НЕТ — снимок везде из
  insertion-order `selectAllProjects` (MyWorkEditorList.tsx:59,70;
  ProjectForm.tsx:90,162,171,193), сортирующего селектора нет
  (selectors.ts:6-13); дрейф лимитов схемы НЕВОЗМОЖЕН — форма делегирует
  через `.pipe()` в `ProjectFormDataSchema` (projectFormSchema.ts:31-62),
  compile-time guard в entities (schema.ts:122-125); мёртвых i18n-ключей
  НЕТ (46 project*/myWork*-ключей, en/ru симметрия); axe-маршрут
  `/admin/mywork` уже в PATHS (purge-axe-check.mjs:37).
- Кит: `DataTable` (Table + Pagination + PageSizeGroup, контролируемая
  сортировка — Skills-пилот), `EmptyState`, `Modal` (subtitle
  Modal.tsx:19, initialFocusRef :40), `Badge`, `Button`, `Form`, `Input`,
  `Textarea`, `Select`, `FileUpload` (пилот — не трогаем), `Heading`,
  `Paragraph`, `Toast`.
- Gold standard сравнения — `features/AdminSkills` (SkillsEditorList,
  AdminSkillsPage, AdminSkillsPage.test.tsx:25-66) и план
  `plan_admin_jobs_refactor.md` (rev.1).

## Скоуп

Меняются: `src/features/AdminMyWork/**` (ui/, баррел index.ts, импорты),
`src/pages/Admin/ui/AdminMyWorkPage/**` (+ новый тест), локали
`en.json`/`ru.json` (новые ключи projectConfirmDeleteName, возможно
adminMyWorkTable*/кнопки шапки), `HomePage.test.tsx` (только deep-import
`removeProjects`).

НЕ меняются: `myWorkSlice.ts`, `storage.ts`, `seed.ts` и их тесты;
`entities/Project/**` (spec `done`, project-images); витрина
`features/MyWork` и Design C + deep-import `HomePage.tsx:13`;
`storeReducers.ts` deep-import (resume-lazy-rhf-chunk);
`model/selectors/index.ts` barrel — OPEN-8 repo-wide; поведение
ProjectForm (кроме удаления h2/подтверждений — вердикты OPEN-1/OPEN-4);
публичные контракты kit-компонентов.

## Требования

### R-1 — ARCH-1 докрутка (`ui/lib` внутрь компонента)
- [ ] `projectFormSchema.ts` перенесён в `ui/ProjectForm/lib/
      projectFormSchema.ts` (прецедент Jobs R-1, `DatePicker/lib/isoDate.ts`).
- [ ] На верхнем уровне `src/features/AdminMyWork/ui/` нет `lib/` и нет
      `.tsx`/`.scss`-файлов; импорты резолвятся (validate зелёный,
      public-api включительно).

### R-2 — Confirm-delete parity (список + форма)
- [ ] Subtitle модалок удаления называет сущность: новый ключ
      `projectConfirmDeleteName` (en+ru, `{{name}}` — title проекта);
      заголовок модалки ≠ label кнопки.
- [ ] `initialFocusRef` → кнопка «Отмена» в модалках списка и формы.
- [ ] При неудачном `persistProjects` модалка ОСТАЁТСЯ открытой (повтор),
      тост `projectSaveError` показан — в модалке списка
      (MyWorkEditorList.tsx:71-75) и в form-delete (ProjectForm.tsx:194-197).
- [ ] Тесты зелёные: subtitle с именем, фокус на «Отмена», persist-fail не
      закрывает (список + форма).

### R-3 — Пустое состояние через kit EmptyState
- [ ] Пустой список → kit `EmptyState` (public API) c
      `title={t('noProjectsYet')}` (ключ общий с витриной — не
      переименовывать); голый Paragraph удалён; feature-SCSS пустого
      состояния нет (A2 у kit).
- [ ] Тест: пустой список рендерит EmptyState.

### R-4 — Форма в page-owned Modal / тест страницы
- [ ] `AdminMyWorkPage` рендерит форму в kit `Modal`: `isOpen`
      от состояния create/edit, шапка `adminMyWorkTitle`, ESC/overlay →
      закрытие; одновременно открыт не более одного диалога (A12).
- [ ] h2+hint удалены из `ProjectForm` (A12 — имя диалога =
      шапка модалки) и перенесены в шапку витрины (R-5); key-remount
      сохраняется; есть add-affordance «Добавить» (create-режим иначе
      недоступен).
- [ ] Существует `AdminMyWorkPage.test.tsx` (реальный
      `configureStore({reducer: storeReducers})`, моки только
      storage/i18n/toast — харнес `AdminSkillsPage.test.tsx:25-66`):
      create-open, edit-open, stale-record guard, ESC-close, единственный
      диалог (A12).

### R-5 — Витрина на kit DataTable
- [ ] `MyWorkEditorList` использует kit `DataTable`: колонки
      title, category, status (Badge), featured (Badge), year, actions
      Edit/Delete (kit Button); контролируемая сортировка (sort → page=1,
      закреплено тестом; паттерн Skills WU-5a); Page-size 5|10|20 и
      навигация видны при `rows > 0`; layout зеркалом Skills: page-size
      сверху справа, навигация снизу по центру; шапка витрины (h2+hint+
      actions — паттерн SkillsEditorList:232-238).
- [ ] Тесты: строка реально исчезает при delete; порядок persist→dispatch
      сохранён (shared `calls` array); переходы страниц; sort → page=1.
- [ ] Новые i18n-ключи заголовков колонок/кнопок шапки при необходимости
      (`adminMyWorkTable*`, en+ru); parity-тест зелёный.
- [ ] axe `/admin/mywork` — 0 регрессий (маршрут уже в PATHS).

### R-6 — Релокация подтверждений формы
- [ ] Из `ProjectForm` удалены две confirm-модалки и кнопки
      reset/delete (форма оставляет Save/Cancel); delete-per-record — в
      строках списка (уже есть); reset переезжает в шапку витрины с
      confirm-модалкой (retry-поведение R-2 сохраняется).
- [ ] Затронутые ProjectForm.test переписаны; persist-THEN-dispatch кейсы
      сохранены.

### R-7 — Гигиена баррела
- [ ] Из `index.ts` удалены 12 мёртвых значений
      (`selectFeaturedProjects`, `selectProjectById`, `createProjectsSeed`,
      `PROJECTS_STORAGE_KEY`, `readProjects`, `persistProjects`,
      `addProject`, `deleteProject`, `makeProjectRecord`,
      `makeUpdatePatch`, `resetToDefaults`, `updateProject`) + 2 типа
      (`MyWorkEditorListProps`, `ProjectFormProps`); `HomePage.test.tsx:16`
      переведён на deep-import `@/features/AdminMyWork/model/services/
      storage`; `check:public-api` зелёный.
- [ ] Мёртвых i18n-ключей нет (проверено) — allowlist locales-parity не
      меняется.

### R-8 — Известные проблемы вне скоупа (зафиксировать, не чинить)
- [ ] Kit не имеет Checkbox/Switch и Chip/TagInput — Button-toggle ряд
      techIcons (ProjectForm.tsx:250-272) и aria-pressed featured
      (:363-372) остаются до отдельного kit-плана.
- [ ] Select `error`-prop миграция (ручные `Paragraph role=alert`,
      :341-345/:355-359) — family-wide волна (Jobs OPEN-5).
- [ ] `model/selectors/index.ts` — OPEN-8 repo-wide (HomePage
      deep-import), не трогается этим эпиком; компонентные тесты на
      legacy holder-моке документированы как working.

### R-9 — Гейты эпика
- [ ] `npm run validate` зелёный (type-check + lint + lint:styles + тесты
      с coverage + public-api).
- [ ] `check:axe:stories` зелёный, если менялись сторисы (со `--build`).
- [ ] axe-app `/admin/mywork`: 0 регрессий.
- [ ] Бандл-дельта в капе `performance-budget.json` (737280) — замер
      worktree на merge-base с `dev`.
- [ ] Все критерии R-1..R-7 закрыты; [TODO.md](./TODO.md) выжжен
      (выполненные пункты удалены, не отмечены).

## Критерии приёмки (итог)

Пользователь на `/admin/mywork` видит DataTable-витрину с шапкой,
сортировкой/пагинацией и кнопкой «Добавить»; удаление
подтверждается модалкой с названием проекта, фокус на «Отмена», при ошибке
сохранения модалка не закрывается; форма открывается в модальном окне,
закрывается по ESC; пустой список — kit EmptyState; после удаления порядок
в localStorage совпадает с порядком в store; `npm run validate` и axe
зелёные.
