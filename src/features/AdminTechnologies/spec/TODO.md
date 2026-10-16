---
status: approved
epic: tech-icon-upload
issue: 261
created: '2026-10-16'
spec: SPEC.md
---

# TODO — features/AdminTechnologies (загрузка иконки файла)

> План эпика `tech-icon-upload` ([SPEC.md](./SPEC.md)). Язык: русский
> (правило владельца). Шаг выполнен → пункт удаляется, не отмечается.

## WU-0 — старт

- [ ] Issue #261, ветка `feat/261-tech-icon-upload` от `origin/dev`,
      DRAFT PR `--base dev`.
- [ ] Перезаписать пару `spec/SPEC.md` + `spec/TODO.md` эпиком
      `tech-icon-upload` (A7); убедиться, что `.gitignore`-негация их пропускает.

## WU-1 — схема сущности + форма (TDD)

- [ ] RED: тесты `entities/Technology/.../schema.test.ts` — `url` принимает
      внутренний `/images/...`-путь, отклоняет `http://`/`data:`/не-URL/пробелы.
- [ ] GREEN: union-схема `url` в `schema.ts` (A3); сид/конверт не тронуты.
- [ ] RED: тесты `TechnologyForm.test.tsx` — create без файла блокируется
      (`adminTechIconRequired`); create с SVG → url = `/images/technologies/<name>`
      (saveImageToDir замокан); edit без нового файла → url не меняется;
      edit с новым файлом → url заменён; ошибка записи → тост, модалка открыта,
      persist/dispatch нет.
- [ ] GREEN: `TechnologyForm.tsx` — `<Input iconUrl>` → `<FileUpload>`
      (A1: pending-state, `setValue` shouldDirty, async `handleSave`,
      keep-current, subdir `technologies`); `technologyFormSchema.ts` —
      create-requires-файл; D7 не тронут.
- [ ] `AdminTechnologiesPage.test.tsx` — перевести на file-upload-поток.

## WU-2 — превью текущей иконки (A2)

- [ ] edit-режим: превью `<img src={url}>` + подпись над загрузчиком (+ SCSS,
      тест). `TechnologiesList`/`resolveTechIcons` — проверить, что без изменений.

## WU-3 — i18n (A5)

- [ ] Новые ключи в `en.json` + `ru.json` (ПЛОСКИЕ): `adminTechIconUploadLabel`,
      button/hint/notImage/tooLarge/undecodable/selected, unsupported/saveError,
      `adminTechIconRequired`, подпись превью.
- [ ] Удалить `adminTechIconUrlLabel`, `adminTechUrlInvalid` из ОБЕИХ локалей
      и из `locales-parity.test.ts`; parity зелёный.

## WU-4 — гейты

- [ ] `npx prettier --check` по тронутым файлам.
- [ ] `npm run validate` (флейки «Test timed out in 5000ms» под нагрузкой →
      реран файла изолированно, таймауты НЕ поднимать).
- [ ] `npm run check:spec`.
- [ ] `npm run build` + `npm run check:bundle` (капы НЕ трогать).
- [ ] `npm run check:axe` (build ПЕРЕД; 0 регрессий, baseline не обновлять
      без genuinely нового fingerprint).

## WU-5 — слияние

- [ ] Push, `gh pr ready <n>`, poll `gh pr checks` (пустые зависшие чеки →
      `gh run rerun <run-id> --failed`), squash-merge `--delete-branch`,
      закрыть issue #261 вручную, `git checkout dev && git pull origin dev`.
