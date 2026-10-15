---
status: done
epic: mywork-parity-polish
issue: 252
created: '2026-10-16'
verified: '2026-10-16'
---

# SPEC — features/AdminMyWork (mywork-parity-polish, issue #252)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> План: vault `wiki/plan/plan_mywork_parity_polish.md`, rev.1. Предыдущая пара (эпик `every-row-clear`, rev.4, done, PR #250) перезаписана — история в git (`git log -- src/features/AdminMyWork/spec/`).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> **Режим исполнения: AUTO** (директива владельца).

## Контекст и цель

Паритет-аудит `src/features/AdminMyWork` против gold-стандартов `src/features/AdminJobs` (#216..#227) и `src/features/AdminSkills` (#205) нашёл 7 отклонений. Эпик их выравнивает; поведение (CRUD, persist-THEN-dispatch, honest-data) НЕ меняется — только конвенции kit-компонентов, ритм SCSS, мёртвые i18n-ключи, проп-имена и шапка модалки.

## Требования

### R-1 Кит-варианты IconButton в ProjectCard (паритет JobCard)

- [x] Строковый Pencil: `variant="ghost"` → `variant="outline"`, иконка 16px → 20px.
- [x] Метрики ↑/↓: ghost → outline, 16px → 20px.
- [x] Trash2 удаления метрики: ghost → `variant="danger"`, 16px → 20px.
- [x] Trash2 очистки поля (clear): ghost → danger, 16px → 20px.
- [x] Критерий: в `ProjectCard.tsx` не осталось ни одного `variant="ghost"` и ни одного `size={16}`; шапочные/strip-кнопки (outline/danger, 20px) не менялись.

### R-2 Шапка MyWorkEditorList (паритет SkillsEditorList)

- [x] Tooltip «сбросить»: `position="bottom"` → `position="top"`.
- [x] Кнопка сброса: `variant="ghost"` → `variant="outline"` (size="md" остаётся).
- [x] Tooltip «добавить»: `position="bottom"` → `position="top"`.

### R-3 Ритм SCSS

- [x] `MyWorkEditorList.module.scss` `.headerActions`: удалён `flex-wrap: wrap;` (gap/align-items сохранены).
- [x] `FieldEditForm.module.scss` `.form`: удалён `gap: $spacing-4;` — вертикальный ритм даёт kit `Form gap="lg"` (24px), паритет с `ProjectForm`.
- [x] `FieldEditForm.module.scss` `.actions`: добавлен `flex-wrap: wrap;`, `gap: $spacing-2` → `$spacing-3`.
- [x] Критерий: `npm run lint:styles` 0; пустых `//`-комментариев не осталось (`scss/comment-no-empty`).

### R-4 Мёртвые i18n-ключи удалены

- [x] Из `en.json` И `ru.json` удалены 5 ключей DataTable-витрины, умершей вместе с ней: `adminMyWorkTableTitle`, `adminMyWorkTableCategory`, `adminMyWorkTableStatus`, `adminMyWorkTableFeatured`, `adminMyWorkTableYear`.
- [x] Живые ключи detail-таблицы сохранены: `adminMyWorkTableField`, `adminMyWorkTableValue`, `adminMyWorkTableActions`.
- [x] `locales-parity.test.ts`: те же 5 записей убраны из allowlist; комментарий актуализирован.
- [x] Критерий: grep по пяти ключам вне `locales-parity.test.ts` пуст; parity-тест зелёный (key-сети en/ru идентичны).

### R-5 data-testid-конвенция (паритет JobCard)

- [x] `ProjectCardProps.testId` → `'data-testid'?: string`, деструктуризация `'data-testid': testId` — как в `JobCard.tsx`; DOM-атрибут на корневом div работает как раньше.
- [x] Потребитель (`ProjectCard.test.tsx`) передаёт `{ 'data-testid': 'my-root' }`.

### R-6 Subtitle модалки формы (паритет AdminSkillsPage)

- [x] `AdminMyWorkPage`: Modal формы получает `subtitle={record?.title}` — в режиме правки подзаголовок называет проект (raw-строка, как `formSubtitle` в `AdminSkillsPage`), в create-режиме `record === undefined` → subtitle отсутствует.
- [x] Критерий: в модалке правки заголовок `adminEditProject` + подзаголовок с названием проекта; в create — только `adminAddProject`.

### R-7 Пара spec

- [x] `spec/SPEC.md` + `spec/TODO.md` перезаписаны эпиком `mywork-parity-polish` (issue #252).

## Решения / Отклонения

- **Метрики ProjectForm остаются одним Textarea** (одна метрика на строку, `splitMetricLines`) — осознанное решение. Альтернатива «bullet-строки как в JobForm» (построчные ↑↓/удаление внутри формы) отложена в отдельный эпик — вне скоупа этого.
- **`AdminJobs/spec/SPEC.md` сейчас перезаписан эпиком modal-content-scroll (#235)** — живой Jobs-spec (пара карточек #225/#227) в git-истории; восстановление вынесено в follow-up issue, вне скоупа.
- **`.field` gap оставлен как есть** (`$spacing-2` в `FieldEditForm.module.scss`) — no-op: правка ничего не даёт и ломает паритет с ProjectForm, поэтому не трогаем.
- Поведение CRUD не менялось: persist-THEN-dispatch (§3), honest-data (R-4 про optional-строки), disabled-края ↑↓ и все i18n-строки остались как были.

## Известные ограничения (осознанные)

- kit Tooltip остаётся hover-only (A14, follow-up #222) — клавиатурная доступность держится на `aria-label`, тултип по focus не появится.
- Кнопки строк detail-таблицы остаются единственный способ перестановки метрик (DnD отклонён владельцем, см. resume-jobcard-bullets-as-is).

## Гейты (2026-10-16)

- tsc 0; eslint 0; stylelint 0; prettier 0 на тронутых файлах; check:public-api 37/37; check:spec.
- Юнит: AdminMyWork (ProjectCard/MyWorkEditorList/FieldEditForm/ProjectForm), locales-parity, AdminMyWorkPage — зелёные.
- Бандл: без изменений капов; `check:bundle` проходит.
