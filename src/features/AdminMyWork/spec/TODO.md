---
status: approved
spec: SPEC.md
---

# TODO — features/AdminMyWork (рефакторинг к паритету с AdminSkills, rev.1)

Компаньон к [SPEC.md](./SPEC.md) rev.1 (эпик `admin-mywork-refactor`). Исходный план:
vault `wiki/plan/plan_admin_mywork_refactor.md`. Правила: выполненный пункт УДАЛЯЕТСЯ
(не отмечается); пункт без критерия не ревьюивается. Статус `approved` — вердикт
владельца 2026-10-12 см. раздел «Решения (вердикт владельца 2026-10-12)» внизу.

## WU-1 — ARCH-1 докрутка (SPEC R-1)

- [ ] `git mv` `ui/lib/projectFormSchema.ts` → `ui/ProjectForm/lib/
      projectFormSchema.ts` (прецедент `DatePicker/lib/isoDate.ts`, Jobs R-1).
- [ ] Переписать импорты tsc-driven (TS2307 → фикс → повтор; без blanket-sed):
      импорт внутри `ProjectForm.tsx`, баррел `index.ts` при необходимости.
- [ ] Гейт: `npm run validate`; на верхнем уровне `ui/` нет `lib/` и
      `.tsx`/`.scss`-файлов.

## WU-2 — Confirm-parity: список + форма (SPEC R-2, TDD)

- [ ] RED: тесты — subtitle называет сущность (title проекта); фокус после
      открытия — на «Отмена»; persist-fail НЕ закрывает модалку — для
      модалки списка И для form-delete.
- [ ] Локали: ключ `projectConfirmDeleteName` (en+ru, `{{name}}`).
- [ ] `MyWorkEditorList.tsx` и `ProjectForm.tsx`: subtitle с именем,
      `initialFocusRef` → «Отмена», persist-fail: `setDeleting(false);
      return;` (паттерн SkillsEditorList.tsx:124-128); title ≠ label
      кнопки.
- [ ] Тесты зелёные (3+ на список, ≥1 на form-delete).

## WU-3 — EmptyState (SPEC R-3)

- [ ] `MyWorkEditorList.tsx`: `Paragraph noProjectsYet` → kit `EmptyState
      title={t('noProjectsYet')}`; связанный SCSS пустого состояния удалить,
      если есть.
- [ ] Тест: пустой список рендерит EmptyState.

## WU-4 — Страница: Modal + тест (SPEC R-4)

- [ ] `AdminMyWorkPage.tsx` — kit Modal вокруг `ProjectForm`
      (`isOpen` от состояния create/edit, шапка `adminMyWorkTitle`, ESC/
      overlay → закрытие, key-remount сохраняется); h2+hint удалить из
      `ProjectForm.tsx` (A12) — переносятся в шапку витрины (WU-5);
      добавить состояние «create открыт» + add-affordance «Добавить».
- [ ] Новый `pages/Admin/ui/AdminMyWorkPage/AdminMyWorkPage.test.tsx`
      (харнес `AdminSkillsPage.test.tsx:25-66`): create-open, edit-open,
      stale-guard, ESC-close, единственный диалог (A12).

## WU-5 — Витрина DataTable (SPEC R-5)

- [ ] `MyWorkEditorList.tsx` → kit `DataTable`; колонки title /
      category / status / featured / year / actions; сортировка сбрасывает
      страницу (тест); `pageSizeOptions=[5,10,20]`; layout зеркалом Skills
      (page-size сверху справа, навигация снизу по центру, контролы при
      rows>0, range `paginationRange`); шапка витрины (h2+hint+actions,
      паттерн SkillsEditorList:232-238).
- [ ] Новые i18n-ключи заголовков колонок/кнопок шапки при необходимости
      (`adminMyWorkTable*` и др., en+ru).
- [ ] Тесты: row-disappears, порядок persist→dispatch (`calls` array),
      переходы страниц, sort → page=1.
- [ ] Гейт: axe `/admin/mywork` — 0 регрессий.

## WU-6 — Релокация подтверждений + гигиена баррела (SPEC R-6/R-7, OPEN-3/OPEN-4)

- [ ] Удалить из `ProjectForm.tsx` две confirm-модалки и кнопки
      reset/delete; reset переносится в шапку витрины с confirm-модалкой
      (retry из WU-2); переписать затронутые ProjectForm.test (persist-
      THEN-dispatch кейсы сохранить).
- [ ] Вырезать из `index.ts` 12 мёртвых значений + 2 типа
      (`selectFeaturedProjects`, `selectProjectById`, `createProjectsSeed`,
      `PROJECTS_STORAGE_KEY`, `readProjects`, `persistProjects`,
      `addProject`, `deleteProject`, `makeProjectRecord`,
      `makeUpdatePatch`, `resetToDefaults`, `updateProject`,
      `MyWorkEditorListProps`, `ProjectFormProps`); `HomePage.test.tsx:16`
      → deep-import `@/features/AdminMyWork/model/services/storage`;
      `check:public-api` зелёный.

## WU-7 — Гейты эпика (SPEC R-9)

- [ ] `npm run validate` в CPU-окне (<45%) зелёный.
- [ ] `npm run check:axe:stories` (со `--build`; сторисы опциональны).
- [ ] axe-app `/admin/mywork`: 0 регрессий против baseline.
- [ ] Бандл-дельта worktree на merge-base: в капе 737280.
- [ ] Секция R-8 «Известные проблемы вне скоупа» сверена с кодом —
      соответствует фактическому состоянию.
- [ ] SPEC.md: критерии R-1..R-7 закрыты, статус → `done`, дата `verified`.
- [ ] Дуал-райт: gotcha-записи в AGENTS.md/engram по итогам эпика.

## Решения (вердикт владельца 2026-10-12)

- OPEN-1 = A — форма переезжает в page-owned kit Modal на странице (паритет Skills).
- OPEN-2 = A — витрина полностью на kit DataTable: Table + Pagination + PageSizeGroup, сортировка → page=1.
- OPEN-3 = A — мёртвые экспорты баррела вырезаются: 12 значений + 2 типа; HomePage.test → deep-import.
- OPEN-4 = A — подтверждения релокируются: две confirm-модалки и кнопки reset/delete удаляются из ProjectForm; reset — шапка витрины, delete — списка; THEN-dispatch кейсы сохранить.
