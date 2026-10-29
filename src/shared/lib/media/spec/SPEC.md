---
status: approved
epic: media-pipeline
issue: 336
created: '2026-10-29'
spec: SPEC.md
---

# SPEC — shared/lib/media (ключ вместо URL, PR-1b эпика `media-pipeline`)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md).
> Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/todo/plan-image-pipeline-migration.md`
> (status `ready`, approved 2026-10-29, §0 — strict auto).
> Companion: [TODO.md](./TODO.md). Язык: русский (правило владельца).
> Backend counterpart: `Konstantine899/resume-api#20` (PR-1a).

## Цель

Разорвать связь «значение в БД = URL с API-префиксом». В документе хранится
плоский **ключ** `<uuid>.<ext>` (или `<uuid>-<width>.webp` для варианта); URL
собирается на клиенте из `VITE_MEDIA_BASE_URL`. Legacy-значения
(`/...`, `http...`) продолжают рендериться до миграции. `uploadImage`
возвращает типизированный результат с ключом и метаданными, а не URL.

## Контекст (проверено 2026-10-29)

- `shared/lib/imageUpload/imageUpload.ts` — единственный seam загрузки;
  POST `/images`, ответ `{ url, filename }`, наружу отдаёт
  `path = API_BASE + url` (URL с префиксом попадает в документ).
- `features/AdminAbout/.../lib/uploadPortrait.ts` — обёртка над seam,
  возвращает `{ name, path }`; `AboutEditorList` сохраняет `path` в
  `portrait`.
- `shared/lib/imageDir/imageDir.ts` — Chromium-only FS Access API, содержит
  свой `API_BASE`; по плану (WU-3) приводится к общему base URL, поведение
  не меняется.
- `VITE_MEDIA_BASE_URL` ещё не объявлен; default — `VITE_API_BASE_URL`
  (без `/api`), который уже покрыт Vite-proxy `/api` — правок
  `buildServer.ts` не требуется.
- `entities/AboutContent` тип `portrait?: string`; в ответе `/about` уже
  есть `updatedAt`, но frontend-тип его не содержит.

## Требования

- **R-1 — resolver.** `src/shared/lib/media/`:
  - `mediaUrl(value)`: ключ → `${MEDIA_BASE}/${key}`; legacy `/...` → как
    есть; `http(s)://...` → как есть; пустая строка/undefined → `''`.
  - `mediaSrcSet(key, widths?)`: `"<url> <w>w, ..."` для вариантов
    `320|640|960`; для legacy/пустого — `undefined`.
  - `isMediaKey(value)`: true только для `<uuid>.<ext>` и
    `<uuid>-<320|640|960>.webp` (allowlist совпадает с backend).
  - Баррел `index.ts`; никаких импортов из `entities`/`features` (FSD).
- **R-2 — base URL.** Единая константа `MEDIA_BASE`:
  `import.meta.env.VITE_MEDIA_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'`.
  `imageUpload` и `imageDir` используют её же (без второго источника истины).
- **R-3 — upload seam (растр).** `uploadImage(file, kind = 'portrait')` →
  `POST /media?kind=...`; успех `{ ok: true, file: { key, width, height, variants } }`;
  ошибки — прежние `ImageUploadFailureReason` (`permission-denied`, `quota`,
  `security`, `write-failed`) + 409 → `conflict`; 415 → `security`.
  Refresh-и-повтор при 401 сохраняется.
- **R-3b — legacy seam для иконок.** Пока WU-6 (PR-3a) не мигрировал
  Skills/Technologies, их формы используют прежний `POST /images` seam со старым
  `{ url, filename }`-shape (отдельная функция/модуль). Это осознанный
  expand/contract: схемы `url`/`iconSvg` принимают только URL/`/images`-путь.
- **R-4 — растровые потребители.** `uploadPortrait` (About) и MyWork image
  сохраняют **ключ**, а не URL. Рендер — через `mediaUrl`/`mediaSrcSet`
  (About portrait через kit `Avatar`, `MyWork` — `backgroundImage`).
  Type-check обязан поймать каждого потребителя.
- **R-5 — About concurrency (PR-2b).** Frontend-тип получает `updatedAt` уже
  в PR-1b; отправка `expectedUpdatedAt` и обработка 409/`X-Replaced-Media-Key`
  включаются в PR-2b после backend-контракта в PR-2a.
- **R-6 — legacy.** Значения `/...`, `http...` и `/images/<key>` рендерятся
  как раньше; пустая строка — «нет значения». Миграция данных — PR-2a/2b, не здесь.

## Инварианты

- Документ никогда не содержит собранный URL от нового upload seam.
- Ключ не зависит от окружения; смена `VITE_MEDIA_BASE_URL` не требует
  миграции данных.
- Вариант (`-320/-640/-960`) не является значением документа.
- Один base URL на все медиа-потребители.

## Вне scope PR-1b

- `srcset` в UI — PR-2b (включается после backfill).
- `expectedUpdatedAt`/409-обработка — PR-2b (backend-контракт — PR-2a).
- Иконки Skills/Technologies и их схемы — PR-3a; до этого они на legacy seam.
- Скрипты миграции документов — PR-2a (`resume-api`).
- Удаление legacy-рендера и `/images` shim — PR-3b.

## Критерии

Наблюдаемые критерии и гейты — в [TODO.md](./TODO.md). Статус пары:
`approved` → `done` после зелёных `validate`/`check:spec` и merge PR-1b.
