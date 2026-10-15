---
status: done
epic: project-images
issue:
created: '2026-10-10'
verified: '2026-10-10'
---

# SPEC — entities/Project (хранилище изображений + FileUpload)

> Единственная истина для этой фичи (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_project_images.md`, рев.4 (rev.2 включил FileUpload по вердикту владельца; rev.3 — верификация 2026-10-10: OPEN-1…7 закрыты вердиктами, правки M1–M8 внесены: суперсет-схема, webp→JPEG фолбэк, квота в символах, Safari ITP, проверяемые критерии квоты/a11y). **rev.4 (вердикт владельца 2026-10-10: «файл должен помещаться в директорию проекта, а не прописывать путь»)**: контракт FileUpload — Blob + имя (dataURL убран), запись в реальную директорию через File System Access API, поле URL удалено из формы. **Аменди 2026-10-10 (уточнение владельца):** выбор/создание целевой поддиректории, default `projects` (FileUpload — многоблочный, механизм в shared), git-шаг до сервера (см. Контекст). Критерии живут ТОЛЬКО здесь; рабочие единицы — в [TODO.md](./TODO.md); решения и контекст — в плане vault.
> **Режим исполнения (требование):** при реализации этой SPEC через план `wiki/plan/plan_project_images.md` все запланированные действия — рабочие единицы плана, правки файлов, гейты (`npm run validate`, `check:axe`, `axe-stories`, `check:bundle`, `check:spec`), публикация и squash merge PR, удаление ветки — выполняются **в автоматическом режиме**, без пофазных подтверждений владельца; ручной approval остаётся только на нестандартные/явные решения владельца (решение владельца 2026-10-05, авто-режим плана; в этой SPEC ничего сверх перечисленного не автоматизируется). Исполнение **делегируется сабагентам** через `sdd-orchestrator-deepseek` — карта WU → сабагенты, MCP и правила burn-down зафиксированы в плане (раздел «Система делегирования»).
> **Семантика статуса `done`:** гейты зелёные на ветке rev.4 (`feat/file-upload-dir-write`); слияние в `dev` — автошаг плана (WU-5, auto-режим), не отдельное решение. Критерии аменди 2026-10-10 (строки с `[ ]`) остаются открытыми до реализации на той же ветке — `done` фиксирует слитый rev.3 + код rev.4 pre-amend + готовый план/аменди-документы; аменди-код (shared-механизм директорий) — предстоящий apply-остаток (TODO).

## Цель

Изображения проектов хранить **файлами в репозитории**, а в данных — **путём** `/images/projects/<имя>` (аменди 2026-10-10: обобщается до `/images/<dir>/<имя>` — `<dir>` любая поддиректория root изображений, default `projects`), вместо хрупкого внешнего URL. Путь нейтрален к хранилищу: сейчас его отдаёт vite из `public/` (копия из источника в `src/`), позже сервер отдаст его же с диска/базы — **данные мигрировать не нужно**. Мотив владельца (2026-10-10): внешний URL может умереть, и узнать об этом — слишком поздно (link rot).

**Вторая часть цели (rev.2, вердикт владельца «Однозначно создаем FileUpload»):** создать kit-компонент `FileUpload` (загрузка картинки с компьютера вместо ручного URL) с пилотом в `ProjectForm`. **rev.4 (вердикт владельца 2026-10-10) заменил OPEN-6=A:** выбранный файл **физически пишется в директорию** `src/shared/assets/images/<dir>/` через File System Access API (`showDirectoryPicker`), в данные сохраняется **путь** `/images/<dir>/<имя>` — dataURL в контракте отсутствует; ручное поле URL удалено из формы (FILE-ONLY). **Аменди 2026-10-10:** `<dir>` — поддиректория root изображений, **по умолчанию `projects`** (имя передаёт потребитель), с возможностью выбора созданной ранее или создания новой; механизм переиспользуем разными блоками загрузки (shared-слой).

## Контекст

- Поле `image` (`entities/Project/model/schemes/schema.ts`) — обязательное; **до WU-1** было `z.url()`, что **запрещало внутренние пути**; у `link` в том же файле уже был union «https | `/…`» (`linkSchema`) — образец для правки. Внутри `z.url()` лежит `new URL()` — `javascript:` формально проходил; погашен union-правкой (WU-1, verified 2026-10-10).
- Потребители всего два: форма `AdminMyWork/ProjectForm` (plain `Input`, ошибка `projectImageInvalid`) и витрина `MyWork` → `ProjectCard` (проп `backgroundImage`, CSS background — битая картинка молча пустая).
- Сид: 7 картинок (verified 2026-10-10, WU-3) указывают внутренние пути `/images/projects/<имя>`; файлы лежат в источнике `src/shared/assets/images/projects/` (6 webp + 1 png, все ≤ 1 MB). Исторически сид ссылался на `ext.same-assets.com` (третья сторона — источник link rot, мотив плана).
- Хранилище данных — localStorage (бэкенда нет) ⇒ сид-файлы «лежат в проекте» (git), а файл, выбранный в браузере, **записывается в рабочее дерево как untracked** (`src/shared/assets/images/<dir>/`) — браузер не может закоммитить, **коммитит владелец** (временный шаг до реального сервера: с сервером файлы при сохранении будут уходить сразу на сервер, git-шаг отпадает; без коммита путь в данных указывает на файл, которого нет в других клонах) — отсюда OPEN-6 (куда уходят байты при загрузке с компьютера).
- **Архитектурный конвейер (единственный рабочий вариант):** источник в `src/shared/assets/images/projects/` (под git) → `vite-plugin-static-copy` кладёт в `public/images/projects/` на dev и на сборке. Альтернативы отвергнуты: положить в `public/` напрямую нельзя (сборка пустит `public/` — доказано опытно), импорт из `src` нельзя (в `[name].[hash].[ext]` путь переколлится).
- В `public/` уже лежит результат такой же копии — `public/locales` (прецедент `buildPlugins.ts`); SSOT путей — тип `BuildPath` (`config/vite/types/config.ts`) + сборка в `vite.config.ts` + фикстуры в `config/vite/__tests__/*`.
- **FileUpload:** компонента в `shared/ui` не было (reuse-first проверено 2026-10-10); материалом послужил сирота-хук `shared/ui/Image/lib/hooks/useImageDragDrop.ts` (File API, FileReader → dataURL, **0 прод-потребителей**, хардкод английской строки) — перенесён в `shared/ui/FileUpload/lib/` и переписан без собственных строк (A2, коды ошибок); старое расположение удалено (WU-4, verified 2026-10-10).
- Конвенция kit (Select/DataTable/EmptyState/Pagination): компонент идёт **с пилотом**, тестами, сторисами (en+ru, обе темы, инлайн-viewport 390px — встроенный `mobile1` = 320px), записью в каталог `wiki/ui-kit/components-list.md` и гейтом `axe-stories --filter=<Name>` (после новых сторис — со `--build`).

## Критерии приёмки

### Схема

- [x] **Принцип суперсета:** всё правдоподобное, что принимала старая `z.url()`, остаётся валидным, кроме осознанных security-отклонений — иначе `readProjects` молча откатывает весь энвелоп к сиду (факт гидрации, план rev.3 / решение 5).
- [x] `image` принимает внутренний путь `/images/projects/foo.webp` (тест schema: `safeParse` → success).
- [x] `image` принимает абсолютный `https://…` **и `http://…`** (совместимость: `http://` валиден сегодня; старые данные в localStorage владельца и существующие тест-фикстуры валидны — OPEN-1, вердикт rev.3).
- [x] `image` отвергает мусор: `javascript:alert(1)`, `ftp://…`, `file://…`, пустую строку, `not-a-url`; в форме это по-прежнему даёт `projectImageInvalid` (существующий маппинг не меняется).
- [x] Протокольно-относительные пути `//host/x.png` **и `/\host/x.png`** отклоняются (вердикт OPEN-2 rev.3: бэкслэш нормализуется браузером в `//` — одного `!startsWith('//')` мало).
- [x] `image` принимает `data:image/<mime>;base64,…` со **строгим префиксом** (`image/` обязателен, `data:text/html;base64,…` и «голый» `data:` — нет) и длиной ≤ ≈512K симв (защитный кап); ветка действует всегда (суперсет — вердикт OPEN-6 управляет только пилотом, не схемой).

### Перенос файлов (сид)

- [x] 7 файлов сида лежат в источнике `src/shared/assets/images/projects/` и после `npm run build` присутствуют в `public/images/projects/` (сборка не уничтожает их — копия создаётся эмиссией).
- [x] В dev-сервере `GET /images/projects/<имя>` отдаёт файл (static-copy dev mode — не только после сборки).
- [x] Константы сида указывают `/images/projects/<имя>`; `grep -r "ext.same-assets" src/` → 0 вхождений.
- [x] **Тест-страж:** каждый `image` из сида существует как реальный файл источника (`fs.existsSync`) — опечатка или переименование валит тест, а не молча ломает витрину.
- [x] Имена файлов — kebab-case/lowercase, расширение сохранено (OPEN-4); размер каждого файла ≤ ~3 MB (OPEN-5).

### FileUpload (kit + пилот)

- [x] Компонент по ARCH-1: `src/shared/ui/FileUpload/` (`ui/FileUpload/FileUpload.{tsx,module.scss,test,stories}` + `model/types.ts` + `lib/useImageDragDrop.ts` + barrel `index.ts`).
- [x] **A2 — ни одной собственной строки:** лейблы, тексты ошибок и превью-подписи приходят пропсами от потребителя (`t()` формы); тест фиксирует отсутствие хардкода внутри компонента.
- [x] `useImageDragDrop` перенесён из `shared/ui/Image` (у него 0 потребителей), английский хардкод `'Failed to read file'` устранён; у `shared/ui/Image` не осталось ссылок на хук.
- [x] **Контракт (rev.4):** `onFileSelect({ blob, name })` — сжатый Blob + санитизированное имя файла; никакого dataURL и никакого RHF внутри. Превью — objectURL (revocation на fail/reset/unmount).
- [x] Поведение: кнопка выбора + drag&drop, превью выбранного; потребитель (`ProjectForm`) делает запись в директорию и `setValue('image', путь, { shouldDirty: true, shouldValidate: true })` — без `shouldValidate` ошибка формы не пересчитается до submit.
- [x] **Кодек (rev.4):** webp при поддержке (`canvas.toBlob`), иначе **явный JPEG** — probe-энкод webp → если `blob.type !== 'image/webp'` → повторный энкод `image/jpeg` (Safari молча откатывается в PNG, фото-PNG рвёт бюджет); тест: toBlob-мок → не-webp → выбран jpeg.
- [x] **Санитизация имени:** NFKD → `[^\w-]+` → `-`, ≤64 символов, расширение по фактическому типу blob (webp/jpg); `'My Photo (1).PNG'` → `'my-photo-1.webp'`.
- [x] Reject-кейсы: не-изображение; файл сверх лимита (**300 000 байт сжатого blob**, default `maxBlobBytes`); **недекодируемое изображение (HEIC и т.п.) — через `img.onerror`** (`file.type` подделывается; arbiter — успех canvas-декода).
- [x] **Запись в директорию (rev.4, аменди 2026-10-10; механизм — shared, перенос из `AdminMyWork/model/services/imageDir.ts`: features→features запрещён, нужен переиспользуемый механизм):** корень `src/shared/assets/images/` — `showDirectoryPicker` (Chrome/Edge; узкий каст `WindowWithDirectoryPicker` — тип вне lib.dom), handle корня запоминается в IndexedDB (best-effort — отсутствие indexedDB не фатально; ключ `imagesRoot`; устаревший rev.4-ключ `projectsImageDir` — best-effort игнорируется/чистится); поддиректория выбирается/создаётся на каждую загрузку; `saveImageToDir` → `/images/<dir>/<имя>`. (verified 2026-10-11: `src/shared/lib/imageDir/` реализован, тесты зелёные, validate+public-api зелёные.)
- [x] **Директории (аменди 2026-10-10):** без явного выбора директории файл кладётся в поддиректорию `projects` (имя передаёт потребитель), путь `/images/projects/<файл>`; выбор ранее созданной или создание новой директории → файл и путь `/images/<dir>/<файл>` соответствуют выбранной (тесты default/create/select). UI выбора директории — **отдельный контроль пилота** (или shared-виджет): контракт kit НЕ растёт — FileUpload остаётся `{blob,name}` и ничего не знает о директориях (server-ready); строки селектора — от потребителя (A2), новые ключи — en+ru + parity. (verified 2026-10-11: kit Select `imageSubdir` в `ProjectForm`, тесты default/create/select зелёные, i18n-ключи `projectImageSubdirLabel` en+ru.)
- [x] **Ошибки записи (пилот):** unsupported API → `projectFileUploadUnsupported` (`role=alert`); ошибка записи → `projectFileUploadSaveError`; отмена выбора директории (AbortError) → молча, без алерта и без смены значения.
- [x] **Доступность:** видимый label/accessible name у input и кнопки; ошибки — `role=alert` + `aria-describedby` (прецедент kit Input); кнопка выбора присутствует всегда — drag не единственный путь (WCAG SC 2.5.7/2.1.1); цели ≥24×24 (SC 2.5.8, прецедент Pagination); статус успеха — `aria-live="polite"`.
- [x] Тесты: выбор/перетаскивание → `onFileSelect` с ожидаемым Blob+именем; все reject-кейсы (включая onerror); webp-фолбэк; санитизация; клавиатура/focus; тексты — только от потребителя. Заметка: jsdom не реализует `DataTransfer` — dnd-путь через фейковый объект, основной путь — `input[type=file]`.
- [x] Сторисы: en+ru, обе темы, инлайн-viewport 390px; запись в каталог `wiki/ui-kit/components-list.md` (включая сводную таблицу); сторис `UploadsAFile` — реальный PNG через decode→canvas→toBlob в браузере.
- [x] **Пилот `ProjectForm` (rev.4, FILE-ONLY):** поле URL `projectFieldImage` **удалено** (форма и обе локали); выбор файла → запись в директорию → `setValue('image', путь)`; показ текущего значения — строка «путь + превью 48×48»; новые i18n-ключи — в обе локали + parity-тест.
- [x] `axe-stories --filter=FileUpload` — 0 violations.

### Отображение

- [x] Витрина: `ProjectCard` получает значение `image` (путь) и отрисовывает background — при ручной проверке в браузере все 7 карточек сида показывают картинку, ни одной битой.
- [x] Форма админки: ввод внутреннего пути проходит валидацию и сохраняется в стор (кейс в `ProjectForm.test`); остальные тесты форм/стора зелёны **без правок** (их https-фикстуры совместимы).

### Гейты

- [x] `npm run validate` зелёный (verified 2026-10-10, rev.4: type-check + lint + scss + тесты + coverage + public-api 37/37).
- [x] `check:axe` — 0 регрессий против baseline (verified 2026-10-10: `/admin/mywork` в PATHS, 0 violations в обеих темах; baseline 4 known на `/` не тронуты).
- [x] `axe-stories` — 0 violations по сторисам FileUpload (verified 2026-10-10, rev.4: `--filter=FileUpload --build` 20/20 — 5 сторис × 2 темы × 2 вьюпорта, включая `UploadsAFile`). Полный прогон `--filter=shared`: ~1460 ✓ / 203 ✗ — ВСЕ в не тронутых веткой семействах — pre-existing storybook-долг, вынесен в отдельный issue **#208** по решению владельца (2026-10-10), вне рамок этого change.
- [x] `check:bundle` в лимите (verified 2026-10-10, rev.4: 725.2 KiB < **744.0 KiB** — кап поднят в rev.3 с явного одобрения владельца; rev.4 dataURL-код убран, бандл уменьшился против 722.5 rev.3).
- [x] `check:spec` — пара в статусе, проходящем гейт (verified 2026-10-10: `spec gate OK: 10 specs`).

## Планируемые файлы

Список фиксирует охват change (rev.3 + аменди rev.4); выполненные файлы остаются здесь как карта зависимости.

- `src/entities/Project/model/schemes/schema.ts` (+ `schema.test.ts`)
- `src/entities/Project/model/constants/constants.ts` (7 путей)
- `src/entities/Project/spec/SPEC.md`, `src/entities/Project/spec/TODO.md`
- `src/shared/assets/images/projects/*.{webp,png}` (7 файлов-источников, новые)
- `config/vite/types/config.ts`, `vite.config.ts`, `config/vite/buildPlugins.ts` (+ `config/vite/__tests__/buildPlugins.test.ts`, `buildViteConfig.test.ts`; сверить `.storybook/main.ts`)
- `src/shared/ui/FileUpload/**` (новый; сюда переезжает `useImageDragDrop`) + удалить `src/shared/ui/Image/lib/hooks/useImageDragDrop.ts`
- `src/features/AdminMyWork/ui/ProjectForm/ProjectForm.tsx` + `ProjectForm.test.tsx` (пилот и кейс внутреннего пути)
- `src/shared/lib/imageDir/` (+ тесты; аменди 2026-10-10: выбор/создание поддиректории, переиспользуемо разными блоками — rev.4 размещалось в `features/AdminMyWork/model/services/imageDir.ts`, перенос из-за запрета features→features)
- `wiki/ui-kit/components-list.md` (каталог kit), локали `en.json`/`ru.json` (если нужны новые ключи пилота)
- vault: `wiki/plan/plan_project_images.md`; `memory.md`

## Что не входит

- Сервер, БД, эндпоинты загрузки — путь спроектирован как подмена механизма отдачи без миграции данных; при появлении сервера FileUpload меняет только свой выхлоп (запись в локальную директорию → загрузка на сервер).
- Превью-блок рядом с ручным полем URL (OPEN-3 — закрыт: в rev.4 поля URL больше нет), изменение `link`/`linkSchema`, хэшированные импорты картинок, ручной resize-пайплайн файлов сида (OPEN-5).
- Аватарки/соцсети/прочие изображения — при необходимости отдельный план по тому же паттерну.

## Риски

- Битая картинка видна только глазами (CSS background не даёт ошибок) — закрывается тестом-стражем путей + браузерной проверкой критерия.
- git навсегда хранит скачанные байты — измерить размер до коммита (OPEN-5).
- dev и build ведут static-copy по-разному (serve из источника vs copy) — обе проверки обязательны (WU-2).
- `public/` стирается сборкой — исходников там по определению нет; регрессия = кто-то «упростит» до ручного положения в `public/` (зафиксировано в плане и TODO).
- **Квота localStorage при OPEN-6=A** (rev.3, ИСТОРИЧЕСКИ — rev.4 убрал dataURL из контракта пилота): ёмкость ≈ 5.24M ASCII-символов (замер Chromium 151, 2026-10-10; MDN — 5 MiB/origin); base64 ≈ ×4/3 к байтам; guardrails — лимит ≈400K симв/файл, бюджет ≈2.5M симв суммарно (~48% ёмкости — запас на энвелоуп). `setItem` аторен: переполнение блокирует ВСЮ запись энвелопа. Контракт — не на числах, а на `QuotaExceededError`: `persistProjects` ловит всё → `false` → тост `projectSaveError`, форма не теряет значения; закрепляется тестом. В rev.4 в localStorage уходят только короткие пути — этот риск для пилота больше не актуален, суперсет-схема (`data:` ветка) сохранена для совместимости старых данных.
- **File System Access API — только Chromium** (Chrome/Edge; Firefox/Safari — нет `showDirectoryPicker`): unsupported → алерт `projectFileUploadUnsupported`, форма без картинки; контракт данных не меняется — ручное редактирование пути через API сущности/сида остаётся возможным. Принятый риск владельца (2026-10-10).
- **Safari ITP: без визита ≥7 дней localStorage (всё приложение) может исчезнуть** (WebKit Tracking Prevention, 2020-03-24; реализация недетерминирована — bugs 211775/237350). Общий риск текущего localStorage-дизайна, не изобретение FileUpload; dataURL увеличивает цену потери.
- **Safari без webp в canvas** — молчаливый PNG-фолбэк рвёт бюджет; нейтрализован явным детектом → JPEG (критерий FileUpload).
- **Тихая потеря при гидрации** (ужесточение схемы → `safeParse` fail → сид) — нейтрализовано суперсет-принципом (критерий схемы).
- **Мёртвый вперёд компонент** (0 потребителей) — закрывается пилотом в `ProjectForm` (kit+пилот-конвенция).

## Открытые вопросы

Все закрыты вердиктами владельца (подтверждение рекомендаций rev.3, 2026-10-10; OPEN-6/OPEN-7 пересмотрены rev.4 там же).

- OPEN-1 (абсолютный URL): ✅ да, union; точнее — `https?://` (compat против тихого отката на сид).
- OPEN-2 (`//host`): ✅ отклонять `//host` и `/\host`.
- OPEN-3 (превью/URL-поле): ✅ отдельного блока нет; превью внутри FileUpload входит. rev.4: поле URL удалено совсем.
- OPEN-4 (имена файлов): ✅ kebab-case; rev.4 — санитизация на стороне kit (`sanitizeFileName`), расширение по фактическому типу blob.
- OPEN-5 (сжатие сида): ✅ как есть, >3 MB — вручную.
- OPEN-6 (куда уходят байты): ~~A (dataURL)~~ → **rev.4: запись в директорию через File System Access API** (вердикт владельца 2026-10-10: «файл должен помещаться в директорию проекта»); dataURL-ветка из контракта пилота убрана, `data:` в схеме осталась суперсетом. Аменди 2026-10-10: поддиректория выбирается/создаётся (default `projects`), git-шаг до сервера — коммит владельца.
- OPEN-7 (UX пилота): ~~поле URL остаётся~~ → **rev.4: FILE-ONLY, поле URL удалено**; показ текущего значения — строка «путь + превью».
