---
status: approved
spec: SPEC.md
---

# TODO — features/AdminSkills (загрузка иконки, rev.2)

Компаньон к [SPEC.md](./SPEC.md) rev.2 (эпик `skills-icon-upload`).
Предыдущий эпик `admin-panel-edit` сгорел (PR #205, 2026-10-10).
План: vault `wiki/plan/plan_skills_icon_upload.md` (approved, вердикт OPEN-1 = A).

## WU-0 — вердикты и спека

- [x] Вердикт OPEN-1 = A «полная замена» (владелец, 2026-10-11).
- [x] SPEC rev.2: статус `approved`, эпик `skills-icon-upload`, §Загрузка иконки.

## WU-1 — kit FileUpload: raw-SVG passthrough (TDD)

- [ ] Тесты RED: `useImageDragDrop` для `image/svg+xml` — не canvas; tooLarge по байтам (`maxBlobBytes` формы ~50 КБ); санити (`<svg` есть, `<script`/`javascript:` нет → `undecodable`); успех отдаёт **исходный File** + objectURL-превью.
- [ ] Реализация: raw-ветка в `useImageDragDrop`; растер-путь без изменений; без собственных строк (A2).
- [ ] Тесты GREEN; `stories.tsx` не ломается.

## WU-2 — схема формы (technologyFormSchema)

- [ ] `iconSvg`: create — обязателен файл (пусто → required, `skillsErrIcon`); edit — `''` = «сохранить текущее» | путь; рефайн `knownIcons.includes` удалён.
- [ ] Тесты: create-валидация, edit-«сохранить как было», edit-после-загрузки-путь проходит.

## WU-3 — TechnologyForm: Select → FileUpload

- [ ] Тесты RED: create-форма без файла → ошибка; загрузка → `setValue('iconSvg', '/images/skills/…')`; edit с легаси-ключом — превью через `resolveIconSvg`, Save без загрузки сохраняет ключ.
- [ ] Замена Select на FileUpload + imageDir (`subdir='skills'`); `isDirectoryPickerSupported` нет → тост + форма без иконки; AbortError молча; прочая ошибка → save-error-тост, значение не тронуто.
- [ ] i18n: новые ключи en+ru (`projectFileUpload*`-паттерн: label/hint/unsupported/save-error); `skillsIcon` убран из формы.
- [ ] `SkillsEditorList`/`TechnologyForm` тесты зелёные (select-тесты иконки заменены file-upload-тестами).

## WU-4 — гейты

- [ ] `npm run validate` (CPU < 45 % окно по правилу проекта).
- [ ] `check:axe` — 0 регрессий (baseline 4, PATHS `/`, `/admin`, `/admin/skills`, `/admin/jobs`).
- [ ] `check:axe:stories --filter=FileUpload` (и `TechnologyForm`, если есть сторис).
- [ ] `check:bundle` в лимите (737280 B) — delta мерить worktree/stash-перебилдом, НЕ junction на node_modules (gotcha resume-junction-rmdir).
- [ ] `check:spec` — pass-set `approved|done` (пара approved → проходит).

## WU-5 — git flow + burn-down + dual-write

- [ ] Ветка `feat/skills-icon-upload` от `dev`; DRAFT PR; conventional commits по WU.
- [ ] Гейты зелёные → `gh pr ready` → squash merge → удалить ветку (auto-режим).
- [ ] Burn-down: TODO → `done` + closing-note (паттерн DataTable PR #199); SPEC → `done` + `verified`.
- [ ] Dual-write: engram + vault `resume-app/memory.md` + AGENTS.md-gotcha (если что-то неочевидное).
