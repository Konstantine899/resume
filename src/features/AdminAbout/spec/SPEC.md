---
status: approved
epic: admin-about-table
created: '2026-10-19'
verified: '2026-10-20'
---

# SPEC — features/AdminAbout (витрина на kit Table, эпик `admin-about-table`)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_about_refactor.md` (rev.3 + rev.4 §7). Companion: [TODO.md](./TODO.md).
> Язык: русский. Все user-facing строки — i18n-ключи en+ru.
> **Статус `approved`** — директива владельца 2026-10-20 (аменда: add/delete строк, Avatar-вариант, загрузка портрета). Ранее открытые OPEN-1..4 закрыты 2026-10-19 (а/да/да/да).

## Цель

Редактор About — edit-only витрина на kit `Table` [Поле | EN | RU | Действия] (Contact #283/#286, Jobs #225/#227 эталоны). **Аменда 2026-10-20**: строки теперь можно СОЗДАВАТЬ (кнопка рядом с «Сбросить» → модалка-форма) и УДАЛЯТЬ (Trash2 в каждой строке) — это ОТМЕНЯЕТ прежний R-1 «add/remove запрещены» (фиксированный контракт). Плюс: портрет [Image 1] переводится на переиспользуемый компонент `Avatar` (новый вариант), и в админке появляется загрузка портрета (.jpg/.png) через kit `FileUpload` с записью данных через RTK Query (имя файла в будущем — в БД Nest.js).

## Контекст (факты, проверено 2026-10-20)

- Было: `descriptions` = `z.tuple([3×])` (`entities/AboutContent/model/services/schema.ts:30`), `stats` = ровно 4 `StatKey`, `ctaLabel` обязателен, `fullName` скаляр RU-only. Портрет витрины: статический `Firefly_RemoveBackground.webp` через kit `Image variant="transparent"` (`features/About/ui/About/About.tsx:94-103`), СТИЛИ = `About.module.scss .portrait` — ЗАПРЕЩЕНО менять.
- Слайс: `updateAboutContent` = FULL REPLACE; persist-THEN-dispatch seam `lib/saveAboutField.ts` остаётся для скалярных правок.
- RTK Query: `src/shared/api/apiSlice.ts` уже в сторе (reducer+middleware), core-subpath `@reduxjs/toolkit/query` (НЕ /query/react — груз; initiate()-диспатч), `stubBaseQuery` = 503.
- Загрузка файлов: kit `shared/ui/FileUpload` + `shared/lib/imageDir` (getOrCreateSubdir/saveImageToDir → `/images/<dir>/<name>`) — паттерн ProjectForm/Skills #213/#209.
- Avatar: `AvatarVariant = 'circle' | 'square' | 'portrait'` (`shared/ui/Avatar/model/types.ts`, `portrait` добавлен WU-13), внутренний маппинг на Image в `Avatar.tsx`, логика в `lib/hooks/useAvatar.ts`.

## Решения (директива владельца 2026-10-20)

- **D10 — контракт v2 (замена R-1)**: `descriptions: LocalizedText[] (≤600/локаль)` (был tuple; старые данные = валидный подмножество → миграция НЕ нужна, envelope остаётся v:1); `stats: z.record(key, localizedText(60))` — открытая запись (суперсет старых 4 ключей → 0 миграций); НОВОЕ `statLabels?: Record<key, LocalizedText(60)>` — метки только для кастомных ключей (известные 4 — i18n, паритет vitrina); `ctaLabel: localizedText(40) | null` (null = удалён); НОВОЕ `portrait?: string` — путь файла портрета (в будущем — имя в БД Nest).
- **D11 — add-row**: кнопка в шапке рядом с «Сбросить» → kit Modal + kit Select вида строки [«Описание» | «Показатель»]; Описание → EN/RU Textarea ≤600, метка авто `«Описание N»` (существующий паттерн label = `t('aboutFieldDescriptions') + N`); Показатель → метка EN/RU ≤60 + значение EN/RU ≤60, ключ = slug из EN-метки (uniqueness), пишется в `stats` + `statLabels`.
- **D12 — delete-row**: Trash2 в КАЖДОЙ строке (включая cta/fullName-строки витрины — cta удаляется в null, fullName НЕ в таблице и не удаляется); подтверждение kit Modal с именем сущности (#286 Contact-parity); persist-THEN-dispatch тот же seam (merged/удалённый документ).
- **D13 — vitrina features/About динамическая**: descriptions/статы рендерятся map'ом по фактическим данным (без контента — прежние 3 дефолтных абзаца + 4 дефолтных стата, DOM идентичен старому); удалённая запись исчезает; кастомный стат рендерится как значение (label на главной не нужен); cta null → ссылка скрыта. **Стили `features/About` не меняются НИ СТРОКОЙ** — только TSX-логика, при дефолтных данных DOM идентичен.
- **D14 — Avatar вариант `portrait`**: `AvatarVariant += 'portrait'` → Image `variant="transparent" objectFit="contain" size="full"` (без border-radius/скруглений, fill-container); витрина About переводится `Image → Avatar variant="portrait"` (About.module.scss НЕ трогаем — `.portrait` (0,2,0) перебивает размеры). Storybook stories для нового варианта обязательны.
- **D15 — загрузка портрета**: kit FileUpload, accept СТРОГО .jpg/.png (MIME + расширение; иначе — ошибка, файл не берётся) → `saveImageToDir(root, blob, name, 'about')` → RTK Query мутация `updateAboutPortrait({ name })` (apiSlice, локальный queryFn: пишет `portrait` в localStorage-конверт + persist, возвращает обновлённый документ; UI dispatch по возвращённому) — свап-точка на Nest.js: queryFn → `fetchBaseQuery` PUT `/about/portrait`, имя файла в БД. Логика формы НЕ знает, где лежит файл.
- **D16 — отображение**: `content.portrait ?? static webp` в витрине About (дефолт = прежний вид); превью в админке — тот же Avatar-вариант.
- **D17 — R2 (useConfirmAction) уже выполнен** в rev.3 (WU-7); эта аменда не трогает Reset.

## Открытые ограничения (приняты, не блокеры)

1. Удалённую ИЗВЕСТНУЮ стат-запись (aboutStatYears…) нельзя пересоздать «как была» — только как кастомную с меткой; полное восстановление — Reset.
2. `statLabels` — только для кастомных ключей; известные метки всегда i18n.
3. Файлы портрета зависят от File-System-Access root (Chromium, как у ProjectForm) — принятый риск эпика #209/#213.
4. Портрет: если файл удалён из images-каталога вручную — путь станет битым (Image уходит в placeholder); авто-очистки нет.

## Скоуп

Меняются: `entities/AboutContent` (schema/types/seed-совместимость), `features/About/ui/About/About.tsx` (TSX-логика + Avatar; **SCSS НЕ ТРОГАТЬ**), `features/AdminAbout/ui/AboutEditorList/…` (add/delete), `shared/ui/Avatar` (вариант + stories), `shared/api/apiSlice.ts` (endpoint), баррелы/локали/тесты.
НЕ меняются: SCSS `features/About/**`, `model/slices` (FULL REPLACE достаточен), Design C, kit-контракты (FileUpload/Avatar расширяются БЕЗ breaking changes), `storeReducers`/deep-import инвариант lazy-chunk.

## Требования

- **R-1 (v2, supersede)** Витрина: те же колонки; строки в порядке документа — база = 8 (3 описания + 4 показателя + CTA; fullName живёт отдельным скаляр-блоком, R-5); после add/delete строк больше или меньше (последнюю удалять можно — пустая витрина терпима, R-3); `.cellActions` nowrap.
- **R-2 add**: кнопка «Добавить строку» рядом со «Сбросить»; модалка: Select вида, поля по D11; валидация zod-слайсами (капы 600/60); pristine → Save disabled; успешный add → persist-THEN-dispatch, строка появилась; persist-fail → error-тост, модалка открыта.
- **R-3 delete**: Trash2 в каждой строке витрины; confirm-модалка (имя строки в subtitle, фокус на «Отмена»); удаление описания/статов/cta; последняя строка удалима (витрина терпит пустоты: пустые блоки, скрытая cta-ссылка); persist-THEN-dispatch, fail → error-тост, документ не изменился.
- **R-4 edit**: прежний Pencil → AboutFieldEditForm (без изменений контракта, кроме динамических индексов/ключей).
- **R-5 fullName**: скаляр-блок как был (не удаляется).
- **R-6 Avatar**: `variant='portrait'` (transparent/contain/fill, без скруглений); витрина About использует его; SCSS features/About байтово неизменен (проверка: git diff пуст по `*.module.scss`); stories в Storybook показывают вариант.
- **R-7 портрет**: FileUpload принимает ТОЛЬКО .jpg/.png (MIME+extension, оба условия); другие форматы → отказ; saveImageToDir('about') → RTK Query `updateAboutPortrait` → документ `portrait` → превью в админке и витрина на главной (fallback на статику без портрета); `model/slices` не меняется (возврат документа из мутации + updateAboutContent).
- **R-8 i18n**: все новые строки — ключи en+ru, flat, parity + existence-guard зелёные.
- **R-9 тесты**: контракт v2 (add/delete/массивы/record/null-cta/portrait), витрина динамика (дефолтный DOM идентичен), add/delete UI (persist-fail ветки), Avatar-вариант, FileUpload-валидация jpg/png, RTK Query-мутация; page-тест; баррел-пины.

## Гейты

`npm run validate` · `check:spec` · `check:axe` (PATHS: `/`, `/admin` и все админ-страницы включая `/admin/about`, light+dark, baseline 4) · `check:bundle` (мерить: кап 861184, запас на старте эпика ~647 B — ПРЕВЫШЕНИЕ = стоп, капу НЕ поднимать без слова владельца; фактический замер — в отчёте WU-16) · storybook-сторис нового Avatar-вариanta прогон · preview-смоук light+dark (скриншоты в temp) · squash `--base dev` без мержа.

## Критерии приёмки

Владелец видит: кнопку добавления → модалка → новая строка в таблице и на главной; Trash2 → confirm → строка исчезла из таблици и из vitrina (дефолтный вид главной БЕЗ данных не изменился); портрет в About — через Avatar-вариант (SCSS блока байтово нетронут), stories показывают вариант; админ загружает .jpg/.png портрет (другое — отказ), превью и главная показывают его, имя файла уходит в RTK Query-мутацию (свап на Nest.js = замена queryFn). Гейты зелёные.
