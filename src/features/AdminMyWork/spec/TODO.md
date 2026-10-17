---
status: approved
spec: SPEC.md
issue: 273
verified: '2026-10-17'
---

# TODO — features/AdminMyWork (mywork-field-image-fileupload, issue #273)

Эпик `mywork-field-image-fileupload` (директива владельца 2026-10-17). Пункты WU-1..4 сгорели в этом PR (Closes #273):

1. TDD: тесты image-поля (`FieldEditForm.test.tsx`) — red → green: FileUpload вместо текстового Input, save-on-selection с `subdir:'projects'`, unsupported/write-failure держат модалку открытой, AbortError тихо, Save disabled пока pristine.
2. `FieldEditForm.tsx`: `case 'image':` → kit `FileUpload` + `handleImageFile` (async `saveUploadedImage`, `setValue('image', path, {shouldDirty, shouldValidate})`), `imageSaveErrorKey`-станок, превью текущего значения (паритет ProjectForm).
3. `FieldEditForm.module.scss`: добавлены `imageCurrent`/`imageCurrentPreview`/`imageCurrentPath` (превью текущего пути, паритет ProjectForm).
4. Пара spec перезаписана эпиком `mywork-field-image-fileupload` (issue #273).

Предыдущая пара (эпик `mywork-parity-polish`, rev.1, PR #253) перезаписана — история в git.
