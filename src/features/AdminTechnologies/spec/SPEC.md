---
status: approved
epic: technologies-pagination-default-5
issue: 271
created: '2026-10-17'
verified: '2026-10-22'
spec: 1
---

# SPEC — features/AdminTechnologies (витрина каталога)

> Единственная истина для этого эпика (spec-driven workflow: AGENTS.md, раздел
> Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Текущий эпик: issue #271 (директива владельца 2026-10-17: размер 5 по
> умолчанию + нумерация страниц под таблицей). Исторические эпики пары: #268
> (technologies-pagination), #261 (tech-icon-upload), #258
> (technologies-crud) — их решения ниже сохранены как контекст, история в git.
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Companion: [TODO.md](./TODO.md).

## Эпик technologies-pagination-default-5 (issue #271)

### Требование (директива владельца 2026-10-17, verbatim intent)

1. **Размер страницы по умолчанию = 5** (сейчас 20) для таблицы
   `/admin/technologies`.
2. **Блок нумерации страниц `‹ 1 2 3 ›` (kit `Pagination`) рендерится НИЖЕ
   таблицы.** Контрол размера страницы (`PageSizeGroup`) остаётся ВЫШЕ
   таблицы. Владелец явно выбрал «весь блок навигации ниже» — НЕ разделять
   стрелки от номеров.

### Решения

- **R1** — `DEFAULT_PAGE_SIZE = 5` (комментарий в `TechnologiesList.tsx`
  цитирует директиву 2026-10-17); опции размера остаются `[5, 10, 20]`.
- **R2** — DOM-порядок: `PageSizeGroup` выше → таблица → `Pagination` ниже
  (оба блока внутри того же фрагмента, под шапкой «Add»). Прямая ревизия
  решения #268 «оба контрола выше» — старое решение в разделе #268 ниже
  помечено. Новый бокс `.paginationRow` (flex, `justify-content: center`,
  БЕЗ margin — `.root` — flex-колонка с `gap: $spacing-4`); `.controls`
  остался только с `PageSizeGroup` (правый прижим, паритет kit DataTable
  `.sizeRow`).
- **R3** — kit-компоненты (`src/shared/**`) БЕЗ изменений — и `Pagination`,
  и `PageSizeGroup` используются как есть.
- **R4** — i18n: **0 новых ключей** (переиспользуются `perPageLabel` +
  `pagination*`; дифф `en.json`/`ru.json` пуст).
- **R5** — тесты: контракт размера 5 закреплён TDD (5 строк, `5` включён
  `aria-pressed`, `paginationNext` включён); покрытие размера 20 сохранено
  в расширенном size-тесте; тест DOM-порядка инвертирован под новый
  контракт; `AdminTechnologiesPage.test.tsx` получает хелпер `showAllRows()`
  (клик `20` в группе `perPageLabel`) для любого ключа сида вне первых пяти.

### Контракт пагинации (наблюдаемое поведение, rev. #271)

- 14 записей (сид) при default **5** → **3 страницы 5+5+4**, страница 1 =
  react/nextjs/typescript/javascript/tailwind, «следующая» включена.
- Выбор 20 → все 14 на одной странице, «следующая» disabled.
- DOM-порядок: page-size → таблица → Pagination (нумерация целиком ниже).
- Выбор размера страницы → окно на странице 1.
- Удаление последней строки на последней странице → кламп рендером (без эффекта).
- Сортировка по ключу (asc → desc → none) сохранена; `aria-sort` на `<th>`.

### Критерии готовности (эпик #271)

- [ ] Ветка `feat/271-technologies-pagination-default-5` от `origin/dev`;
      DRAFT PR с `--base dev`.
- [ ] `TechnologiesList`: `DEFAULT_PAGE_SIZE = 5`; `PageSizeGroup` в
      `.controls` (выше таблицы), `Pagination` в `.paginationRow` (ниже);
      kit без правок.
- [ ] Тесты `TechnologiesList.test.tsx`: default 5 → ровно 5 строк,
      `5` `aria-pressed`, `paginationNext` enabled; size 20 → все 14
      (покрытие сохранено); DOM-порядок size → table → pagination;
      сортировка/кламп зелёные.
- [ ] `AdminTechnologiesPage.test.tsx` зелёный: каждый тест, трогающий ключ
      сида вне первых пяти, вызывает `showAllRows()` (помощник-критерий
      взамен старого «зелёный без правок (сид 14 ≤ 20)»).
- [ ] i18n: 0 новых ключей; `locales-parity.test` зелёный.
- [ ] Гейты: `npm run validate` → `npm run build` + `npm run check:bundle`
      (капы НЕ трогать) → `npm run check:axe` (0 регрессий; baseline 4).
- [ ] PR `--base dev`, `Closes #271`; НЕ мержить без инструкции владельца
      (issue закрывается вручную — `Closes` в `dev` не работает).

### Вне скоупа (эпик #271)

- kit `Pagination` / `PageSizeGroup` / `Table` / `DataTable` — без изменений;
- разделение навигации (стрелки сверху, номера снизу) — ОТКЛОНЕНО владелецем
  явно;
- другие страницы, URL-синк, сортировка-расширения — нет.

## Эпик technologies-pagination (issue #268)

> **РЕВИЗИЯ #271 (2026-10-17):** default 20 → **5**; размещение «оба
> контрола выше таблицы» → «`PageSizeGroup` выше, `Pagination` ниже».
> Формулировки этого раздела отредактированы, чтобы НЕ противоречить коду;
> исходная директива #268 сохранена в git.

### Требование (директива владельца, verbatim intent)

Пагинация таблицы каталога на `/admin/technologies`: контролы РАЗМЕЩАЮТСЯ
ВЫШЕ таблицы, ПОД кнопкой «Add technology» (т.е. в list-области под шапкой
страницы). Опции размера страницы: **5, 10, 20** элементов. Размер по
умолчанию: **20** _(при поставке #268; ревизия #271 → **5**)_.

### Решения

- **P1** — `TechnologiesList` становится pagination-контейнером (зеркало
  `features/MyWork` пилота): локальный стейт `{page, pageSize}` (default 5 —
  ревизия #271; при #268 было 20),
  нарезка строк — render-time вывод (`safePage = min(max(page,1), totalPages)`),
  БЕЗ setState-in-effect (react-hooks v7);
- **P2** — kit `PageSizeGroup` (sizes `[5, 10, 20]`) рендерится ВЫШЕ таблицы,
  kit `Pagination` — ПОД ней (DOM-порядок: page-size → таблица → Pagination;
  ревизия #271 — #268 размещал оба контрола выше); kit `DataTable`
  НЕ используется: его `Pagination` рендерится ПОД таблицей безусловно, а
  контейнеру нужен собственный порядок. Таблица —
  kit `Table`; sort-декорация (bare-button заголовок, `aria-sort`,
  `null → asc → desc → null`, сортировка ДО нарезки, сброс страницы при
  сортировке) перенесена из DataTable WU-5 в контейнер без изменений
  поведения; kit-компоненты НЕ менялись;
- **P3** — смена размера страницы сбрасывает окно на страницу 1 (kit
  `PageSizeGroup` stateless — сброс на стороне контейнера, паттерн MyWork);
- **P4** — пустой каталог: `EmptyState` вместо таблицы и контролов
  (владелец 2026-10-09: контролы не исчезают при взаимодействии, скрывает
  только пустой список);
- **P5** — i18n: БЕЗ новых ключей — переиспользуются `perPageLabel` и
  плоская семья `pagination*` (`paginationNav`/`paginationPrevious`/
  `paginationNext`/`paginationPage`), они уже в ОБЕИХ локалях.

### Контракт пагинации (наблюдаемое поведение)

- 14 записей (сид) при default **5** → 3 страницы 5+5+4, страница 1 =
  первые 5 строк _(ревизия #271; #268: все 14 при default 20 — остаётся
  проверкой при выборе размера 20)_.
- Выбор размера страницы → окно на странице 1.
- Удаление последней строки на последней странице → окно выводится в диапазон
  рендером (без эффекта).
- DOM-порядок: page-size → таблица → Pagination _(ревизия #271; #268:
  page-size → Pagination → таблица)_.
- Сортировка по ключу (asc → desc → none) сохранена; `aria-sort` на `<th>`.

### Критерии готовности (эпик #268, сгорели — история; формулировки rev. #271)

- [ ] Ветка `feat/technologies-pagination` от `origin/dev`; DRAFT PR с `--base dev`.
- [ ] `TechnologiesList` — контейнер: `{page, pageSize}` default 5
      _(ревизия #271)_, `safePage` render-time, kit `PageSizeGroup` выше
      kit `Table`, kit `Pagination` ниже _(ревизия #271)_; `DataTable` из
      файла убран; kit без правок.
- [ ] Тесты `TechnologiesList.test.tsx` (TDD): default 5 → ровно 5 строк
      _(ревизия #271; #268: 14 при default 20 → все видны)_; размер 5 →
      окно 5; опции 5/10/20; смена размера → страница 1; удаление
      на последней странице → кламп; DOM-порядок _(ревизия #271)_;
      сортировка сохранена.
- [ ] `AdminTechnologiesPage.test.tsx` — зелёный: тесты на ключи вне первых
      пяти зовут хелпер `showAllRows()` _(критерий #268 «зелёный без правок
      (сид 14 ≤ 20)» устарел с default 5 — переписан под хелпер, ревизия #271)_.
- [ ] i18n: 0 новых ключей (`perPageLabel`/`pagination*` уже в en+ru),
      `locales-parity.test` зелёный.
- [ ] Гейты: prettier (тронутые файлы) → `npx vitest run src/features/
AdminTechnologies src/pages/Admin` → `npm run validate` →
      `npm run check:spec` → `npm run build` + `npm run check:bundle`
      (капы НЕ трогать) → `npm run check:axe` (0 регрессий; PATHS содержит
      `/admin/technologies`).
- [ ] PR переведён в ready, CI зелёный, squash-merge с `--delete-branch`,
      issue #268 закрыт вручную.

### Вне скоупа (эпик #268)

- kit `Pagination` / `PageSizeGroup` / `Table` / `DataTable` — без изменений;
- другие страницы, сортировка-расширение, URL-синк — нет (только
  in-component state);
- сторис: у `AdminTechnologies` сторис нет — пропущено осознанно.

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
- `shared/lib/server-media`: `isDirectoryPickerSupported()`, `pickImagesRoot()`,
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
- Ошибка записи файла (нет server upload API / отказ диска): error-тост,
  модалка открыта, стор/хранилище не тронуты.
- Ошибка persist ПОСЛЕ записи файла (аменд 2026-10-22): только что
  записанный файл УДАЛЯЕТСЯ best-effort (`removeUploadedImage` из
  `shared/lib/server-media` — удаление НИКОГДА не бросает и не маскирует тост),
  error-тост `adminTechPersistError`, модалка открыта, стор не тронут;
  pending-выбор остаётся в state, поэтому ПОВТОРНЫЙ Save перезаписывает
  файл заново. Исключение: если новый путь РАВЕН текущему `url` записи
  (перезапись того же имени) — файл НЕ удаляется, запись всё ещё ссылается
  на него. Обработка `persistTechnologies` defensive: контракт — boolean,
  но throw уходит в ту же ветку (тост + cleanup + без dispatch).
- Превью в edit: `<img src={текущий url}>` виден до любого действия.
- D7: смена ключа в edit (форс через DOM) отклоняется схемой, ничего не сохраняется.

## Критерии готовности (эпик #261, сгорели — история)

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

- **Замена иконки другим именем: СТАРЫЙ файл не удаляется.** Файл новой
  иконки пишется под НОВЫМ именем, запись каталога переключается на новый
  путь, а прежний файл остаётся в `images/technologies/`. Рост каталога
  ограничен числом уникальных имён (create-or-overwrite в `saveImageToDir`),
  а не числом загрузок. Сканирование каталога и удаление старых файлов при
  замене — ВНЕ скоупа (потенциальный отдельный эпик, только при реальной
  надобности; прецедент ProjectForm rev.4 #209).
- **Осиротевший файл при ОШИБКЕ persist — УСТРАНЕНО (аменд 2026-10-22).**
  Раньше файл писался в `images/technologies/` ДО `persistTechnologies`, и
  при неудачном persist оставался осиротевшим. Контракт теперь закреплён в
  §Контракт FileUpload: только что записанный файл удаляется best-effort,
  модалка остаётся открытой, повторный Save переписывает файл; перезапись
  того же имени (запись ссылается на путь) не удаляется. Остаются ВНЕ
  скоупа осиротевшие файлы от отменённых ДО Save действий — в этой форме
  их нет (запись происходит только в `handleSave`).

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
