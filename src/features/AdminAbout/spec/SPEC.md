---
status: approved
epic: admin-about-table
created: '2026-10-19'
verified: '2026-10-19'
---

# SPEC — features/AdminAbout (витрина на kit Table, эпик `admin-about-table`)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_about_refactor.md`, rev.3 (§0-§5). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> **Статус `approved`** — вердикт владельца 2026-10-19 («утверждаю»): OPEN-1 = (а), OPEN-2 = да, OPEN-3 = да, OPEN-4 = да (см. «Решения»).

## Цель

Директива владельца 2026-10-19: «использовать таблицу как и во всей админке». Инлайн-форма `AboutEditorForm` превращается в **edit-only витрину** на kit `Table` по образцу Contact (#283/#286) и Jobs/MyWork (field-actions #227/#246): строка = поле документа, ячейки EN/RU = значения локалей, Pencil = field-scoped модалка редактирования. Контракт документа остаётся фиксированным — строки правятся, НЕ добавляются и НЕ удаляются.

## Контекст (факты, проверено 2026-10-19)

- Контракт: `descriptions` = `z.tuple([3×])` (`entities/AboutContent/model/services/schema.ts:30`), `stats` = ровно 4 `StatKey` (`entities/AboutContent/model/types/types.ts:14,29`), `fullName` — скаляр RU-only (:18), `ctaLabel` — `LocalizedText`. add/remove строк сломали бы витрину `features/About` (Design C) — запрещены.
- Слайс менять не нужно: `updateAboutContent` — FULL REPLACE (`model/slices/aboutContentSlice.ts:28-30`); частичное обновление = снапшот → merge → `persistAboutContent` → dispatch полного дока (паттерн #246/#227, persist-THEN-dispatch).
- Инварианты: lazy-RHF чанк `/admin/about` (модалки — та же фича); витрина `features/About` не трогается; `/admin/about` в axe PATHS; баррел-пин `index.test.ts`.
- Конфликт-зависимость: PR #314 (DRAFT, миксин `locale-row`) правит `AboutEditorForm.module.scss` — перед PR эпика сделать rebase на свежий `dev`.

## Решения (вердикт владельца 2026-10-19)

- **OPEN-1 = (а)**: чистый эталон — вся страница = vitrina + модалки; инлайн-форма умирает.
- **OPEN-2 = да**: переименование `AboutEditorForm` → `AboutEditorList` (+ баррел `index.ts`, `AdminAboutPage`, тесты).
- **OPEN-3 = да**: `fullName` — отдельный скаляр-блок над таблицей с inline Save (Contact email-прецедент).
- **OPEN-4 = да**: R2 rev.3 влит в эпик — `useConfirmAction` на Reset-confirm (WU-7).

## Скоуп

Меняются: `ui/AboutEditorForm/` → `ui/AboutEditorList/` (витрина; SCSS — уход от `.localeRow`/`.field` к vitrina-layout), новые `ui/AboutFieldEditForm/` (+ `lib/fieldSchemas.ts`), баррел `index.ts`, `pages/Admin/ui/AdminAboutPage/`, локали en/ru, тесты фичи и страницы.
НЕ меняются: `model/**` (слайс/services/selectors/types), `entities/AboutContent`, витрина `features/About`, Design C (prop от HomePage), deep-import `storeReducers.ts:12`/`HomePage.tsx:4`, kit-контракты.

## Требования

- **R-1 Витрина.** kit `Table`, колонки [Поле | EN | RU | Действия]; 8 строк (description ×3, stat ×4, ctaLabel); подпись строки = `t(key)`, `aria-label` та же строка (Contact-приём C2); ячейки действий — `.cellActions` nowrap (resume-table-cell-actions-row); в колонке действий только Pencil (add/remove запрещены — честные данные, фиксированный контракт).
- **R-2 Скаляр `fullName`** — отдельный блок над таблицей с inline Save.
- **R-3 Редактирование.** Pencil → kit Modal с формой одного поля: descriptions → kit `Textarea` (maxLength 600), stats/ctaLabel → kit `Input` (60/40), fullName → kit `Input` (80); pristine → Save disabled; zod-слайсы полей в `lib/fieldSchemas.ts` — единственный источник капов/валидации; save-путь: снапшот `selectAboutContent` → merge → `persistAboutContent` → `updateAboutContent(merged)`; persist-fail → error-тост, модалка открыта, стор не двигается.
- **R-4 Reset** документа к seed: кнопка в шапке vitrina, текущая kit-Modal-confirm (subtitle `{{name}}`, `initialFocusRef` → «Отмена») — поведение не меняется; `useConfirmAction` владеет state-machine (решение OPEN-4).
- **R-5全身 Save умирает** вместе с инлайн-формой (`isDirty`/submit-кнопка); каждое поле сохраняется своим модал-Save; `fullName` — своим inline-Save.
- **R-6 i18n**: все новые строки — ключи en+ru (parity-тест); сырых ключей нет (preview-смоук light+dark).
- **R-7 Тесты**: витрина/модалки/page-тест на реальном сторе (харнесс `renderAdminPage`); старый `AboutEditorForm.test.tsx` переписывается под `AboutEditorList`; баррел-пин обновляется; мёртвый SCSS удаляется.

## Гейты

`npm run validate` · `check:spec` · `check:axe` (`/admin/about` в PATHS, baseline 4 known) · `check:bundle` (мерить; запас ≈20 KiB при капе 860160; kit Table уже в shared-чанке; подъём капов — только по слову владельца) · squash `--base dev` · burn-down пары · ручное `gh issue close`.

## Критерии приёмки (итог)

Пользователь на `/admin/about` видит таблицу полей документа (EN|RU) как во всей админке; Pencil открывает модалку одного поля с правильным типом контроля; сохранение пишет в storage ДО стора и переживает persist-fail; Reset ведёт себя как сейчас (машина — `useConfirmAction`); add/remove строк недоступны; витрина `features/About` не изменилась; гейты зелёные.
