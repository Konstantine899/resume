---
status: done
epic: tech-icon-upload
issue: 261
created: '2026-10-16'
verified: '2026-10-17'
spec: 1
---

# SPEC — features/AdminTechnologies (загрузка иконки файла вместо URL)

> Единственная истина для этого эпика (spec-driven workflow: AGENTS.md, раздел
> Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Источник: issue #261 (директива владельца, решения A1/A2/A3/A5/A7 закреплены).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Companion: [TODO.md](./TODO.md).

## Цель

В админ-форме `features/AdminTechnologies/ui/TechnologyForm` текстовое поле
`iconUrl` («URL иконки») заменяется kit-компонентом `FileUpload`: иконка
загружается с файловой системы компьютера, как в эпике Skills #213 и в
`ProjectForm` (rev.4). Ручной ввод URL из формы уходит; сид и витрина не меняются.

## Контекст (факты, проверены 2026-10-16)

- Форма: `src/features/AdminTechnologies/ui/TechnologyForm/TechnologyForm.tsx` —
  `<Input {...register('iconUrl')}>`; `handleSave` собирает `record {key, url: data.iconUrl,
invertInDark}` (create) и `patch {url, invertInDark}` (edit); Save `disabled={!isDirty}`;
  фабрика схемы `./lib/technologyFormSchema` (`makeTechnologyFormSchema(existingKeys, mode, originalKey)`).
- D7 (неизменяемость ключа в edit): Input `disabled` + zod-refine `value === originalKey`
  — RHF НЕ стрипает DOM-disabled из submit-данных; НЕ регрессировать.
- Контракт сущности: `entities/Technology/model/schemes/schema.ts` —
  `url: z.url().refine(startsWith('https://'))`; конверт `{v: 1, technologies}`;
  сид = 14 devicon https-URL. Типы: `entities/Technology/model/types/types.ts`.
- kit `FileUpload` (`src/shared/ui/FileUpload/`): `{label, texts, onFileSelect,
maxBlobBytes?, disabled?, className?}`; `FileUploadSelection = {blob, name}`
  (SVG — ОРИГИНАЛЬНЫЙ File passthrough, имя сохраняет `.svg`; растр — сжатый
  webp/jpeg); SVG-безопасность (`isSafeSvgText`) — ВНУТРИ кита, не дублировать.
- `shared/lib/imageDir`: `isDirectoryPickerSupported()`, `pickImagesRoot()`,
  `readImagesRootHandle()`, `writeImagesRootHandle()`, `getOrCreateSubdir(root, subdir)`,
  `saveImageToDir(root, blob, name, subdir)` → `/images/<dir>/<name>`.
- Gold-паттерн интеграции: `AdminSkills/ui/TechnologyForm` (иконка-загрузка,
  subdir `skills`) и `AdminMyWork/ui/ProjectForm` (pick-root + subdir).
- Витрина: `TechnologiesList` рендерит `<img src={url}>` — внутренние
  `/images/...` пути работают как есть (проверить, не менять).
- Витрина шоукейса: `resolveTechIcons` (`entities/Technology/lib/utils.ts`) — без изменений (A4).
- Потребители ключа `iconUrl` формы: только сама форма + её тест +
  `AdminTechnologiesPage.test.tsx` (два использования `urlInput()`).

## Решения (закреплены, A1/A2/A3/A5/A7)

- **A1** — TechnologyForm: `<Input iconUrl>` → kit `<FileUpload>`:
  - `label={t('adminTechIconUploadLabel')}` + `texts` — ВСЕ строки из `t()`
    (kit без собственного текста, форма `FileUploadTexts` ProjectForm/Skills);
  - `onFileSelect(selection)`: pending-выбор держится в component state
    (`useState<FileUploadSelection | null>`) И поле помечается грязным:
    `setValue('iconUrl', selection.name, {shouldDirty: true})` — ПРОВИЗОРНЫЙ
    маркер (имя файла), чтобы кнопка Save включилась; реальный путь резолвится
    при сохранении;
  - `handleSave` — async: при pending-выборе `saveImageToDir(..., 'technologies')`
    (subdir `technologies`; pick-root, если не сохранён — тот же поток, что
    ProjectForm/Skills); ошибка → error-тост, форма остаётся, persist/dispatch НЕТ;
    успех → сохранённый `url` = `/images/technologies/<name>`;
  - edit БЕЗ нового файла → `url` сохраняет текущее значение записи
    (keep-current: провизорный маркер НЕ перезаписывает его);
  - create: файл ОБЯЗАТЕЛЕН — нет pending-выбора и пустой `iconUrl` → ошибка
    схемы с i18n-ключом (пара Skills create-requires-icon);
  - D7 (неизменяемость ключа в edit) — без изменений.
- **A2** — edit-режим: маленький превью ТЕКУЩЕЙ сохранённой иконки над
  загрузчиком (паттерн Skills rev.2: `<img src={url}>` + muted-подпись).
- **A3** — контракт сущности: `url` → union: абсолютный `https://...` ИЛИ
  внутренний путь `/images/...` (regex без пробелов, прецедент — image-union
  Project rev.3). Сид остаётся валидным, конверт остаётся `v: 1`.
- **A5** — i18n: ПЛОСКИЕ ключи (без точек) в ОБЕИХ `en.json`/`ru.json`:
  `adminTechIconUploadLabel` + тексты FileUpload (button/hint/notImage/
  tooLarge/undecodable/selected) + ошибки потока (unsupported/saveError) +
  required-ошибка create + подпись превью; МЁРТВЫЕ `adminTechIconUrlLabel` и
  `adminTechUrlInvalid` УДАЛЯЮТСЯ из обеих локалей и из parity-теста;
  `locales-parity.test` зелёный.
- **A7** — эта пара SPEC/TODO перезаписывает эпик `technologies-crud`
  (паттерн «одна пара на эпик, история в git»).

## Контракт FileUpload (наблюдаемое поведение)

- Выбор SVG в create: Save включается; при Save файл пишется в
  `/images/technologies/<имя>`; в сторе/хранилище — этот путь; tost «Saved»;
  модалка закрывается.
- Save в create БЕЗ файла: блокировка схемой, ошибка `role=alert` с ключом
  `adminTechIconRequired`, persist/dispatch НЕ вызываются.
- Save в edit БЕЗ нового файла: `url` записи НЕ меняется (keep-current).
- Save в edit С новым файлом: `url` заменён на `/images/technologies/<имя>`.
- Ошибка записи файла (нет File System Access API / отказ диска): error-тост,
  модалка открыта, стор/хранилище не тронуты.
- Превью в edit: `<img src={текущий url}>` виден до любого действия.
- D7: смена ключа в edit (форс через DOM) отклоняется схемой, ничего не сохраняется.

## Критерии готовности (наблюдаемые исходы)

- [ ] Ветка `feat/261-tech-icon-upload` отрезана от `origin/dev`; DRAFT PR
      открыт с `--base dev` в момент старта работ.
- [ ] Пара `spec/SPEC.md` + `spec/TODO.md` перезаписана эпиком `tech-icon-upload`
      (статус `approved` до старта WU-1); оба файла в индексе git
      (`git status` / `git diff --cached` — негация `.gitignore`).
- [ ] `npm run check:spec` — exit 0 (pass-set `approved|done`).
- [ ] `TechnologyForm`: `<Input iconUrl>` отсутствует; на его месте kit
      `<FileUpload>` с label/texts из `t()`; pending-выбор в state;
      `handleSave` async; edit-превью текущей иконки.
- [ ] Схема формы: create без файла → `adminTechIconRequired` (role=alert);
      D7-правило ключа не тронуто (тест).
- [ ] `entities/Technology` schema: `url` принимает `https://...` И
      `/images/technologies/x.svg`; по-прежнему отклоняет `http://`, `data:`,
      `javascript:`, не-URL, пути с пробелами (тесты `schema.test.ts` расширены).
- [ ] Тесты `TechnologyForm.test.tsx` (расширены, TDD): create без файла →
      блокировка; create с SVG → url = `/images/technologies/<name>`, persist
      ДО dispatch; edit без нового файла → url не меняется; edit с новым файлом →
      url заменён; ошибка записи → тост + модалка открыта.
- [ ] `AdminTechnologiesPage.test.tsx` — переведён на file-upload-поток
      (без `urlInput()`), зелёный.
- [ ] i18n: новые ключи в ОБЕИХ локалях, `adminTechIconUrlLabel`/
      `adminTechUrlInvalid` удалены из ОБЕИХ; `locales-parity.test` зелёный.
- [ ] `TechnologiesList` / `resolveTechIcons` — БЕЗ изменений (проверено:
      `<img src>` принимает внутренний путь; сид валиден по новой union-схеме).
- [ ] Гейты (WU-4, по порядку): prettier-check по тронутым файлам →
      `npm run validate` → `npm run check:spec` → `npm run build` +
      `npm run check:bundle` (капы НЕ трогать, ожидаем ≈0 дельту) →
      `npm run check:axe` (0 регрессий; PATHS уже содержит `/admin/technologies`).
- [ ] PR переведён в ready (`gh pr ready`), CI зелёный, squash-merge с
      `--delete-branch`, issue #261 закрыт вручную.

## Вне скоупа

- `performance-budget.json` — не трогать (ожидаем ≈0 дельту бандла).
- kit `FileUpload` / `useImageDragDrop` — без изменений (SVG-passthrough уже есть).
- `resolveTechIcons`, сид, конверт `v: 1`, ключ хранения `technologies`.
- Выбор подпапки в UI (как в ProjectForm rev.4) — subdir фиксирован
  `technologies` (иконки — мелкие файлы, отдельный пикер не нужен).

## Известные ограничения

- **Осиротевшие файлы при записи до persist (принято для stage 1).**
  Файл пишется в `images/technologies/` В ПЕРВУЮ ОЧЕРЕДЬ — в `handleSave`,
  до `persistTechnologies` (A1: реальный путь разрешается при Save). Если
  persist не удался (запись в localStorage отклонена/некорректный
  конверт), файл на диске УЖЕ лежит, а запись в каталог не добавлена —
  остаётся осиротевший файл. Та же картина при замене иконки: старый файл
  заменяется по имени, но если новое имя отличается, прежний файл не
  удаляется. Поведение ОГРАНИЧЕНО: повторная загрузка того же имени
  перезаписывает файл (create-or-overwrite в `saveImageToDir`), так что
  рост каталога ограничен числом уникальных имён, а не числом загрузок.
  Принято по прецеденту ProjectForm rev.4 (#209): cleanup-логика (сканирование
  каталога, удаление мусора) ВНЕ скоупа stage 1 — потенциальный отдельный
  эпик, только при реальной надобности.

## Связи

- Gold standard: PR #213 (skills-icon-upload), #209 (project-images),
  #259 (technologies-crud — базовый эпик этой формы).
- Уроки: `resume-admin-skills-icon-upload` (self-closing `<svg/>` regex,
  axe-stories `--build`, URL-stub через `class extends URL`),
  `resume-project-images-amend` (zod extend strip, `gh pr ready` перед merge),
  `resume-pr-base-dev-default-main` (PR всегда `--base dev`).

## Итог

Эпик доставлен без девиаций в PR #262: контракт A1/A2/A3/A5/A7 исполнен как
написано. Гейты: `npm run validate` 3707/3707 (один CPU-флейк в
`AdminSkillsPage.test.tsx` — зелёный в изоляции), `check:spec` 16, бандл
777.7 < 784 KiB (капы НЕ тронуты), `check:axe` — 0 регрессий (baseline 4).
Checklist сгорел по мере работы.
