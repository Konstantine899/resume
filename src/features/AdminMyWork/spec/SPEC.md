---
status: done
epic: every-row-clear
issue: 249
created: '2026-10-15'
verified: '2026-10-15'
---

# SPEC — features/AdminMyWork (every-row-clear, rev.4, issue #249)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> План: vault `wiki/plan/plan_mywork_detail_table.md`, аменда rev.4 (2026-10-15). Предыдущая пара (эпик `mywork-field-actions`, rev.3, done, PR #246) перезаписана — история в git (`git log -- src/features/AdminMyWork/spec/`).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> **Режим исполнения: AUTO** (директива владельца; аменда rev.4 выполнена тем же режимом).

## Контекст и цель

Директива владельца (2026-10-15): «кнопка Trash2 удаления на КАЖДОЙ строке detail-таблицы `/admin/mywork` с соответствующим ей функционалом. Строго выполни!». Рев.3 оставлял clear только на year/link/role/featured (контракт запрещал пустые title/category/status/description/techIcons/image), а строке image вообще не было действий (R-B1). Рев.4 снимает эти ограничения.

Итог: 10 скалярных строк карточки проекта несут Pencil (полевая правка) + Trash2 (очистка до контрактного пустого значения). Очищенная строка исчезает из таблицы (honest-data, R-4). Метрики: последняя тоже удалима (`metrics` optional).

## Требования

### R-1 Контракт ослаблен (entities/Project, обратно совместимо)

- `title`: `''` ИЛИ 2–100 после trim (непустой 1-символьный — по-прежнему отклоняется).
- `description.en/ru`: ≤600, пустая строка допустима.
- `techIcons`: 0..n (пустой массив допустим; ключи по-прежнему из `TECH_ICONS`).
- `category`/`status`: optional (enum-значения по-прежнему строгие).
- `image`: union получает `z.literal('')` — это значение CLEAR.

Ослабление только расширяет множество валидных записей: seed `PROJECTS` и envelope `{v:1}` валидны без миграций.

- [x] Критерий: `schema.test.ts` — 30/30, включая «fully cleared record» и «accepts missing category/status».

### R-2 Строки detail-таблицы

- [x] Каждая из 10 скалярных строк (title, category, status, description, role, techIcons, image, year, link, featured) несёт clear Trash2 с aria-label `adminMyWorkClearField`.
- [x] Image-строка получила Pencil (`onEditField(project, 'image')`) — R-B1 отменён; поле-модалка = text Input пути (паритет link).
- [x] title/category/status — conditional-push: при пустом значении строка исчезает из таблицы.
- [x] Значения CLEAR: `title:''`, `category:undefined`, `status:undefined`, `description:{en:'',ru:''}`, `techIcons:[]`, `image:''` (year/link/role/featured — как rev.3).

### R-3 Порядок persist (§3, без изменений)

- [x] Критерий: клик clear → `persistProjects(next)` ДО `dispatch(updateProject)`; при fail persist — store не тронут + тост `projectSaveError`.

### R-4 Метрики

- [x] Trash2 последней метрики НЕ disabled; `removeMetric` при пустоте ставит `metrics: undefined`.
- [x] ↑↓-края по-прежнему disabled.

### R-5 Шапка

- [x] Status-badge в шапке omitted при `status: undefined` (guard).

### R-6 Поле-модалка image

- [x] `ScalarEditField += 'image'`; `fieldEditSchemas.image` делегирует в `ProjectFormSchema.shape.image`; кейс в `FieldEditForm` — Input с error-ключом `projectImageInvalid`.

### R-7 Форма (SSOT, паритет)

- [x] Полная `ProjectForm` наследует ослабление через `.pipe()`-делегирование: пустой title/без image/пустые techIcons сабмитятся.
- [x] `create`-дефолты не менялись (`emptyProjectFormValues`: category 'other', status 'completed').
- [x] Критерий: ProjectForm-тесты перевёрнуты — «accepts empty title», «accepts NO image», «accepts empty techIcons».

### R-8 Сортировка

- [x] `MyWorkEditorList` category-sort: `(a.category ?? '').localeCompare(b.category ?? '')`.

## Известные ограничения (осознанные)

- Полная форма при редактировании записи без category/status показывает дефолты ('other'/'completed') в селектах — сохранение без правок материализует дефолт. Это поведение create-дефолтов, не регрессия.
- Vitrina (shared ProjectCard) уже guard'ит пустые title/description/techIcons/image — отдельных правок не потребовалось.
- Запись можно сохранить БЕЗ title/category/status/description/techIcons/image — витрина honest-data покажет карточку без этих строк. Вердикт владельца при плане rev.4.

## Гейты (2026-10-15)

- tsc 0; eslint 0; stylelint 0; check:public-api 37/37; check:spec 15.
- axe-app: 0 регрессий (baseline 4 known; `/admin/mywork` light+dark чист).
- Бандл: 762.1 < 768 KiB (cap из #227).
- Юнит: schema 30/30, ProjectCard 32/32, fieldSchemas/storage/ProjectForm 51/51, AdminMyWork 149/149, MyWork 11/11, AdminMyWorkPage 10/10, AppRouter+Card 106/106 (CPU-флейки зелёные в изоляции).
