---
status: approved
epic: project-images
issue:
created: '2026-10-10'
verified:
---

# SPEC — entities/Project (хранилище изображений + FileUpload)

> Единственная истина для этой фичи (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_project_images.md`, рев.3 (rev.2 включил FileUpload по вердикту владельца; rev.3 — верификация 2026-10-10: OPEN-1…7 закрыты вердиктами, правки M1–M8 внесены: суперсет-схема, webp→JPEG фолбэк, квота в символах, Safari ITP, проверяемые критерии квоты/a11y). Критерии живут ТОЛЬКО здесь; рабочие единицы — в [TODO.md](./TODO.md); решения и контекст — в плане vault.

## Цель

Изображения проектов хранить **файлами в репозитории**, а в данных — **путём** `/images/projects/<имя>`, вместо хрупкого внешнего URL. Путь нейтрален к хранилищу: сейчас его отдаёт vite из `public/` (копия из источника в `src/`), позже сервер отдаст его же с диска/базы — **данные мигрировать не нужно**. Мотив владельца (2026-10-10): внешний URL может умереть, и узнать об этом — слишком поздно (link rot).

**Вторая часть цели (rev.2, вердикт владельца «Однозначно создаем FileUpload»):** создать kit-компонент `FileUpload` (загрузка картинки с компьютера вместо ручного URL) с пилотом в `ProjectForm`. Куда уходят байты ДО появления сервера — OPEN-6 закрыт вердиктом **A** (dataURL после клиентского сжатия, кодек webp→JPEG фолбэк, лимиты в символах): контракт поля `image` при этом не меняется (storage-neutral).

## Контекст

- Поле `image` (`entities/Project/model/schemes/schema.ts`) — обязательное, сегодня `z.url()` **запрещает внутренние пути**; у `link` в том же файле уже есть union «https | `/…`» (`linkSchema`) — образец для правки. Внутри `z.url()` лежит `new URL()` — `javascript:` формально проходит; гасится union-правкой (WU-1).
- Потребители всего два: форма `AdminMyWork/ProjectForm` (plain `Input`, ошибка `projectImageInvalid`) и витрина `MyWork` → `ProjectCard` (проп `backgroundImage`, CSS background — битая картинка молча пустая).
- Сид: 7 картинок на `ext.same-assets.com` (живы на 2026-10-10, но это третья сторона).
- Хранилище данных — localStorage (бэкенда нет) ⇒ сид-файлы «лежат в проекте» (git), а файл, выбранный в браузере, в git попасть **физически не может** — отсюда OPEN-6 (куда уходят байты при загрузке с компьютера).
- **Архитектурный конвейер (единственный рабочий вариант):** источник в `src/shared/assets/images/projects/` (под git) → `vite-plugin-static-copy` кладёт в `public/images/projects/` на dev и на сборке. Альтернативы отвергнуты: положить в `public/` напрямую нельзя (сборка пустит `public/` — доказано опытно), импорт из `src` нельзя (в `[name].[hash].[ext]` путь переколлится).
- В `public/` уже лежит результат такой же копии — `public/locales` (прецедент `buildPlugins.ts`); SSOT путей — тип `BuildPath` (`config/vite/types/config.ts`) + сборка в `vite.config.ts` + фикстуры в `config/vite/__tests__/*`.
- **FileUpload:** в `shared/ui` компоненты нет (reuse-first проверено 2026-10-10); есть сирота-хук `shared/ui/Image/lib/hooks/useImageDragDrop.ts` — File API, валидация, FileReader → dataURL, **0 прод-потребителей**, хардкод английской строки `'Failed to read file'` (нарушение i18n-first/A2) — материал для компонента.
- Конвенция kit (Select/DataTable/EmptyState/Pagination): компонент идёт **с пилотом**, тестами, сторисами (en+ru, обе темы, инлайн-viewport 390px — встроенный `mobile1` = 320px), записью в каталог `wiki/ui-kit/components-list.md` и гейтом `axe-stories --filter=<Name>` (после новых сторис — со `--build`).

## Критерии приёмки

### Схема

- [ ] **Принцип суперсета:** всё правдоподобное, что принимала старая `z.url()`, остаётся валидным, кроме осознанных security-отклонений — иначе `readProjects` молча откатывает весь энвелоп к сиду (факт гидрации, план rev.3 / решение 5).
- [ ] `image` принимает внутренний путь `/images/projects/foo.webp` (тест schema: `safeParse` → success).
- [ ] `image` принимает абсолютный `https://…` **и `http://…`** (совместимость: `http://` валиден сегодня; старые данные в localStorage владельца и существующие тест-фикстуры валидны — OPEN-1, вердикт rev.3).
- [ ] `image` отвергает мусор: `javascript:alert(1)`, `ftp://…`, `file://…`, пустую строку, `not-a-url`; в форме это по-прежнему даёт `projectImageInvalid` (существующий маппинг не меняется).
- [ ] Протокольно-относительные пути `//host/x.png` **и `/\host/x.png`** отклоняются (вердикт OPEN-2 rev.3: бэкслэш нормализуется браузером в `//` — одного `!startsWith('//')` мало).
- [ ] `image` принимает `data:image/<mime>;base64,…` со **строгим префиксом** (`image/` обязателен, `data:text/html;base64,…` и «голый» `data:` — нет) и длиной ≤ ≈512K симв (защитный кап); ветка действует всегда (суперсет — вердикт OPEN-6 управляет только пилотом, не схемой).

### Перенос файлов (сид)

- [ ] 7 файлов сида лежат в источнике `src/shared/assets/images/projects/` и после `npm run build` присутствуют в `public/images/projects/` (сборка не уничтожает их — копия создаётся эмиссией).
- [ ] В dev-сервере `GET /images/projects/<имя>` отдаёт файл (static-copy dev mode — не только после сборки).
- [ ] Константы сида указывают `/images/projects/<имя>`; `grep -r "ext.same-assets" src/` → 0 вхождений.
- [ ] **Тест-страж:** каждый `image` из сида существует как реальный файл источника (`fs.existsSync`) — опечатка или переименование валит тест, а не молча ломает витрину.
- [ ] Имена файлов — kebab-case/lowercase, расширение сохранено (OPEN-4); размер каждого файла ≤ ~3 MB (OPEN-5).

### FileUpload (kit + пилот)

- [ ] Компонент по ARCH-1: `src/shared/ui/FileUpload/` (`ui/FileUpload/FileUpload.{tsx,module.scss,test,stories}` + `model/types.ts` + `lib/useImageDragDrop.ts` + barrel `index.ts`).
- [ ] **A2 — ни одной собственной строки:** лейблы, тексты ошибок и превью-подписи приходят пропсами от потребителя (`t()` формы); тест фиксирует отсутствие хардкода внутри компонента.
- [ ] `useImageDragDrop` перенесён из `shared/ui/Image` (у него 0 потребителей), английский хардкод `'Failed to read file'` устранён; у `shared/ui/Image` не осталось ссылок на хук.
- [ ] Поведение: кнопка выбора + drag&drop, превью выбранного; результат — чистый колбэк `onFileSelect(value)`, никакого RHF внутри (форма делает `setValue('image', v, { shouldDirty: true, shouldValidate: true })` — без `shouldValidate` ошибка формы не пересчитается до submit).
- [ ] **Кодек (OPEN-6=A rev.3):** webp при поддержке, иначе **явный JPEG** — детект `toDataURL('image/webp').startsWith('data:image/webp')`, нет поддержки → повторный ресайз + `image/jpeg` (Safari молча откатывается в PNG, фото-PNG рвёт бюджет); тест: mock `toDataURL` → не-webp → выбран jpeg.
- [ ] Reject-кейсы: не-изображение; файл сверх лимита (≈400K символов dataURL); **недекодируемое изображение (HEIC и т.п.) — через `img.onerror`** (`file.type` подделывается; arbiter — успех canvas-декода).
- [ ] **Квота:** тест с mock `localStorage.setItem` → throw `QuotaExceededError` → тост `projectSaveError`, форма не теряет значения (механизм `persistProjects` → `false` закреплён тестом, а не только кодом).
- [ ] **Доступность:** видимый label/accessible name у input и кнопки; ошибки — `role=alert` + `aria-describedby` (прецедент kit Input); кнопка выбора присутствует всегда — drag не единственный путь (WCAG SC 2.5.7/2.1.1); цели ≥24×24 (SC 2.5.8, прецедент Pagination); статус успеха — `aria-live="polite"`.
- [ ] Тесты: выбор/перетаскивание → `onFileSelect` с ожидаемым значением; все reject-кейсы (включая onerror); webp-фолбэк; клавиатура/focus; тексты — только от потребителя. Заметка: jsdom не реализует `DataTransfer` — dnd-путь через фейковый объект, основной путь — `input[type=file]`.
- [ ] Сторисы: en+ru, обе темы, инлайн-viewport 390px; запись в каталог `wiki/ui-kit/components-list.md` (включая сводную таблицу).
- [ ] Пилот `ProjectForm`: ручное поле URL сохраняется как есть (второй вход, OPEN-7); выбор файла → `setValue('image', …)` → валидация ок → сохранён в стор (тест пилота); новые i18n-ключи — в обе локали + parity-тест.
- [ ] `axe-stories --filter=FileUpload` — 0 violations.

### Отображение

- [ ] Витрина: `ProjectCard` получает значение `image` (путь) и отрисовывает background — при ручной проверке в браузере все 7 карточек сида показывают картинку, ни одной битой.
- [ ] Форма админки: ввод внутреннего пути проходит валидацию и сохраняется в стор (кейс в `ProjectForm.test`); остальные тесты форм/стора зелёны **без правок** (их https-фикстуры совместимы).

### Гейты

- [ ] `npm run validate` зелёный.
- [ ] `check:axe` — 0 регрессий против baseline (новый UI покрыт axe-stories).
- [ ] `axe-stories` — 0 violations по всем сторис, включая FileUpload.
- [ ] `check:bundle` в лимите 737280 B (картинки и dataURL в бюджет не входят — `check-bundle` смотрит только js/css; дельта = 0).
- [ ] `check:spec` — пара в статусе, проходящем гейт.

## Планируемые файлы

- `src/entities/Project/model/schemes/schema.ts` (+ `schema.test.ts`)
- `src/entities/Project/model/constants/constants.ts` (7 путей)
- `src/entities/Project/spec/SPEC.md`, `src/entities/Project/spec/TODO.md`
- `src/shared/assets/images/projects/*.{webp,png}` (7 файлов-источников, новые)
- `config/vite/types/config.ts`, `vite.config.ts`, `config/vite/buildPlugins.ts` (+ `config/vite/__tests__/buildPlugins.test.ts`, `buildViteConfig.test.ts`; сверить `.storybook/main.ts`)
- `src/shared/ui/FileUpload/**` (новый; сюда переезжает `useImageDragDrop`) + удалить `src/shared/ui/Image/lib/hooks/useImageDragDrop.ts`
- `src/features/AdminMyWork/ui/ProjectForm/ProjectForm.tsx` + `ProjectForm.test.tsx` (пилот и кейс внутреннего пути)
- `wiki/ui-kit/components-list.md` (каталог kit), локали `en.json`/`ru.json` (если нужны новые ключи пилота)
- vault: `wiki/plan/plan_project_images.md`; `memory.md`

## Что не входит

- Сервер, БД, эндпоинты загрузки — путь спроектирован как подмена механизма отдачи без миграции данных; при появлении сервера FileUpload меняет только свой выхлоп (data:/путь → путь с сервера).
- Превью-блок рядом с ручным полем URL (OPEN-3), изменение `link`/`linkSchema`, хэшированные импорты картинок, ручной resize-пайплайн файлов сида (OPEN-5).
- Аватарки/соцсети/прочие изображения — при необходимости отдельный план по тому же паттерну.

## Риски

- Битая картинка видна только глазами (CSS background не даёт ошибок) — закрывается тестом-стражем путей + браузерной проверкой критерия.
- git навсегда хранит скачанные байты — измерить размер до коммита (OPEN-5).
- dev и build ведут static-copy по-разному (serve из источника vs copy) — обе проверки обязательны (WU-2).
- `public/` стирается сборкой — исходников там по определению нет; регрессия = кто-то «упростит» до ручного положения в `public/` (зафиксировано в плане и TODO).
- **Квота localStorage при OPEN-6=A** (rev.3: числа измерены): ёмкость ≈ 5.24M ASCII-символов (замер Chromium 151, 2026-10-10; MDN — 5 MiB/origin); base64 ≈ ×4/3 к байтам; guardrails — лимит ≈400K симв/файл, бюджет ≈2.5M симв суммарно (~48% ёмкости — запас на энвелоуп). `setItem` атомарен: переполнение блокирует ВСЮ запись энвелопа. Контракт — не на числах, а на `QuotaExceededError`: `persistProjects` ловит всё → `false` → тост `projectSaveError`, форма не теряет значения; закрепляется тестом.
- **Safari ITP: без визита ≥7 дней localStorage (всё приложение) может исчезнуть** (WebKit Tracking Prevention, 2020-03-24; реализация недетерминирована — bugs 211775/237350). Общий риск текущего localStorage-дизайна, не изобретение FileUpload; dataURL увеличивает цену потери.
- **Safari без webp в canvas** — молчаливый PNG-фолбэк рвёт бюджет; нейтрализован явным детектом → JPEG (критерий FileUpload).
- **Тихая потеря при гидрации** (ужесточение схемы → `safeParse` fail → сид) — нейтрализовано суперсет-принципом (критерий схемы).
- **Мёртвый вперёд компонент** (0 потребителей) — закрывается пилотом в `ProjectForm` (kit+пилот-конвенция).

## Открытые вопросы

Все закрыты вердиктами владельца (подтверждение рекомендаций rev.3, 2026-10-10); критерии выше уже их отражают.

- OPEN-1 (абсолютный URL): ✅ да, union; точнее — `https?://` (compat против тихого отката на сид).
- OPEN-2 (`//host`): ✅ отклонять `//host` и `/\host`.
- OPEN-3 (превью/URL-поле): ✅ отдельного блока нет; превью внутри FileUpload входит.
- OPEN-4 (имена файлов): ✅ kebab-case, расширение как скачано.
- OPEN-5 (сжатие сида): ✅ как есть, >3 MB — вручную.
- OPEN-6 (куда уходят байты): ✅ **A (dataURL после клиентского сжатия)** с коррективами rev.3: webp-детект → явный JPEG; числа guardrails в символах; истина = `QuotaExceededError`; эвикция Safari ITP — принятый риск.
- OPEN-7 (UX пилота): ✅ поле URL остаётся, FileUpload — второй вход (`setValue` с `shouldDirty`+`shouldValidate`); ревью визуально на PR.
