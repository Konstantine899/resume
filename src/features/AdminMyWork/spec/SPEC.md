---
status: approved
epic: mywork-field-image-fileupload
issue: 273
created: '2026-10-17'
verified: '2026-10-17'
---

# SPEC — features/AdminMyWork (mywork-field-image-fileupload, issue #273)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Предыдущая пара (эпик `mywork-parity-polish`, rev.1, done, PR #253) перезаписана — история в git (`git log -- src/features/AdminMyWork/spec/`).
> **Режим исполнения: AUTO** (директива владельца).

## Контекст и цель

Директива владельца (2026-10-17): «Загрузка изображений должна быть через компонент `src/shared/ui/FileUpload`.»

Аудит `src` показал, что каждая загрузка изображений уже идёт через kit `FileUpload`, КРОМЕ ОДНОГО места: `src/features/AdminMyWork/ui/FieldEditForm/FieldEditForm.tsx`, ветка `case 'image':`. Она рисовала kit `Input` (текстовое поле с `placeholder="/images/…  or  https://…"` и `{...register('image')}`) — это field-scoped модалка, открываемая по ✏️ на строке `image` detail-таблицы `/admin/mywork`. Эпик заменяет этот текстовый инпут на kit `FileUpload`, повторяя поток `ProjectForm` (save-on-selection).

## Требования

### R-1 Текстовый Input изображения удалён, вместо него kit `FileUpload`

- [ ] Ветка `case 'image':` `FieldEditForm.tsx` больше не рендерит `Input` с `placeholder="/images/…"` и `{...register('image')}`.
- [ ] Вместо неё рендерится kit `FileUpload` (паритет `ProjectForm`): `label`/`texts` из той же i18n-семьи `projectFileUpload*`.
- [ ] Критерий: в модалке поля `image` присутствует `input[type="file"]`; `getByLabelText('projectFieldImage')` → null.

### R-2 Save-on-selection через saveUploadedImage (паритет ProjectForm)

- [ ] `handleImageFile` async: `saveUploadedImage({ blob, name, subdir: 'projects' })` → `setValue('image', path, { shouldDirty: true, shouldValidate: true })`.
- [ ] `subdir` ФИКСИРОВАН `'projects'` — модалка одного поля НЕ получает Select `imageSubdir` (нет места, вне скоупа).
- [ ] Критерий: выбор файла пишет `/images/projects/<name>` и включает Save (форма становится dirty); при Save значение доходит до записи.

### R-3 Ошибки: unsupported / write-failure держат модалку открытой, AbortError — тихо

- [ ] `isDirectoryPickerSupported()` false → in-modal `role="alert"` `projectFileUploadUnsupported`, модалка открыта, Save disabled.
- [ ] Ошибка записи → `role="alert"` `projectFileUploadSaveError`, модалка открыта, Save disabled.
- [ ] `isAbortError(...)` → тихо (пользователь отменил picker), без значения и без тревоги.

### R-4 Save-конвейер и i18n не меняются

- [ ] Существующий Save-конвейер без изменений: `handleSubmit` → `toUpdateDto` → `persistProjects` → `dispatch(updateProject)` → toast → `onExitEdit()`.
- [ ] 0 новых i18n-ключей — используются только существующие `projectFileUploadLabel/Button/Hint/NotImage/TooLarge/Undecodable/Selected`, `projectFileUploadUnsupported`, `projectFileUploadSaveError`, `projectImageInvalid` (diff `en.json`/`ru.json` пуст).
- [ ] kit (`src/shared/**`) и `entities/**` не тронуты.

### R-5 Превью текущего изображения (паритет ProjectForm)

- [ ] Как в `ProjectForm`: при непустом `values.image` рендерится строка с превью `<img>` + путь; запись с `https://…` сохраняет значение, `FileUpload` просто ждёт новый выбор.
- [ ] Кнопки очистки в модалке НЕТ (очистка — Trash2 строки, эпик every-row-clear — не трогаем).

### R-6 Пара spec

- [ ] `spec/SPEC.md` + `spec/TODO.md` перезаписаны эпиком `mywork-field-image-fileupload` (issue #273).

## Решения / Отклонения

- **Подкаталог фиксирован `'projects'`** — модалка одного поля слишком мала для Select `imageSubdir`; альтернатива «добавить выбор подкаталога» отклонена (вне скоупа).
- **Очистка изображения НЕ в модалке** — это Trash2 строки detail-таблицы (эпик every-row-clear, #250), не трогаем.
- **Превью текущего значения добавлено** (паритет `ProjectForm`, `imageCurrent*`-классы в `FieldEditForm.module.scss`) — чтобы перед заменой было видно, какое изображение стоит сейчас. Классов-мёртвых не появилось (`.field`/`.toggles`/`.actions` по-прежнему используются).
- **`subdir`-селект и `imageSubdir`-поле формы не заводим** — форма-модалка работает только со скаляром `image`; контракт зода/типов не менялся.

## Известные ограничения (осознанные)

- Кит `FileUpload` не различает «текущее https-изображение» и «пусто» — модалка просто показывает текущее значение строкой и ждёт новый файл.
- Выбор корневой директории (`pickImagesRoot`) и её память в IndexedDB — на стороне общего `shared/lib/imageDir`, здесь только контракт `(blob, name, subdir)`.

## Гейты (2026-10-17)

- `npm run validate` (type-check + lint + lint:styles + unit + coverage + check:public-api) — зелёный.
- `npm run build` + `npm run check:bundle` (кап `total.maxSize` 802816).
- `npm run check:axe` — 0 регрессий (baseline 4 known).
- diff `src/shared/lib/i18n/locales/en.json` + `ru.json` пуст (0 новых ключей).
