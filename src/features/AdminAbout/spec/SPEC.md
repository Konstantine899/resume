---
status: done
epic: admin-about-table
created: '2026-10-19'
verified: '2026-10-20'
---

# SPEC — features/AdminAbout (витрина на kit Table, эпик `admin-about-table`)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_about_refactor.md`, rev.3 (§0-§5). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Вердикт владельца 2026-10-19 («утверждаю»): OPEN-1 = (а), OPEN-2 = да, OPEN-3 = да, OPEN-4 = да (см. «Решения») — все четыре закрыты вердиктом, спорных вопросов не осталось.
> **Статус `done` 2026-10-20**: эпик поставлен в PR #315 (см. «Итог» внизу).

## Цель

Директива владельца 2026-10-19: «использовать таблицу как и во всей админке». Инлайн-форма `AboutEditorForm` превращается в **edit-only витрину** на kit `Table` по образцу Contact (#283/#286) и Jobs/MyWork (field-actions #227/#246): строка = поле документа, ячейки EN/RU = значения локалей, Pencil = field-scoped модалка редактирования. Контракт документа остаётся фиксированным — строки правятся, НЕ добавляются и НЕ удаляются. **Выполнено**: `ui/AboutEditorForm/` удалена, вместо неё `ui/AboutEditorList/` (витрина) + `ui/AboutFieldEditForm/` (модалка поля).

## Контекст (факты, проверено 2026-10-19; сверено с кодом 2026-10-20)

- Контракт: `descriptions` = `z.tuple([3×])` (`entities/AboutContent/model/services/schema.ts:30`), `stats` = ровно 4 `StatKey` (`entities/AboutContent/model/types/types.ts:14,29`), `fullName` — скаляр RU-only (:18,27), `ctaLabel` — `LocalizedText` (:30). add/remove строк сломали бы витрину `features/About` (Design C) — запрещены.
- Слайс менять не нужно: `updateAboutContent` — FULL REPLACE (`model/slices/aboutContentSlice.ts:28-30`); частичное обновление = снапшот → merge → `persistAboutContent` → dispatch полного дока (паттерн #246/#227, persist-THEN-dispatch).
- Инварианты: lazy-RHF чанк `/admin/about` (модалки — та же фича); витрина `features/About` не трогается; `/admin/about` в axe PATHS (`scripts/purge-axe-check.mjs:45`); баррел-пин `index.test.ts`.
- Конфликт-зависимость PR #314 (миксин `locale-row`) — РЕШЕНА: #314 смержен в `dev` (`a758b11`), ветка эпика влила свежий `dev` (коммиты `e337320`, `c13f269`).

## Решения (вердикт владельца 2026-10-19 — все закрыты, исполнены)

- **OPEN-1 = (а)**: чистый эталон — вся страница = vitrina + модалки; инлайн-форма умерла.
- **OPEN-2 = да**: `AboutEditorForm` → `AboutEditorList` (+ баррел `index.ts`, `AdminAboutPage`, тесты) — выполнено.
- **OPEN-3 = да**: `fullName` — отдельный скаляр-блок над таблицей с inline Save (Contact email-прецедент) — выполнено (`AboutEditorList.tsx:203+`).
- **OPEN-4 = да**: R2 rev.3 влит в эпик — `useConfirmAction` на Reset-confirm (WU-7) — выполнено (`AboutEditorList.tsx:103`).

## Скоуп

Меняются: `ui/AboutEditorForm/` → `ui/AboutEditorList/` (витрина; SCSS — уход от `.localeRow`/`.field` к vitrina-layout), новые `ui/AboutFieldEditForm/` (+ `lib/fieldSchemas.ts`, `lib/saveAboutField.ts`), баррел `index.ts`, `pages/Admin/ui/AdminAboutPage/`, локали en/ru, тесты фичи и страницы.
НЕ меняются: `model/**` (слайс/services/selectors/types), `entities/AboutContent`, витрина `features/About`, Design C (prop от HomePage), deep-import `storeReducers.ts`/`HomePage.tsx`, kit-контракты. **Подтверждено diff'ом: model и entities не тронуты.**

## Требования (все выполнены 2026-10-20)

- **R-1 Витрина.** kit `Table`, колонки [Поле | EN | RU | Действия]; 8 строк (description ×3, stat ×4, ctaLabel); подпись строки = `t(key)`, `aria-label` та же строка (Contact-приём C2); ячейки действий — `.cellActions` nowrap (resume-table-cell-actions-row); в колонке действий только Pencil (add/remove запрещены — честные данные, фиксированный контракт). ✔
- **R-2 Скаляр `fullName`** — отдельный блок над таблицей с inline Save. ✔
- **R-3 Редактирование.** Pencil → kit Modal с формой одного поля: descriptions → kit `Textarea` (maxLength 600), stats/ctaLabel → kit `Input` (60/40), fullName → kit `Input` (80); pristine → Save disabled; zod-слайсы полей в `lib/fieldSchemas.ts` — единственный источник капов/валидации; save-путь: снапшот → merge → `persistAboutContent` → `updateAboutContent(merged)`; persist-fail → error-тост, модалка открыта, стор не двигается. ✔ (`ui/AboutFieldEditForm/`)
- **R-4 Reset** документа к seed: кнопка в шапке vitrina, kit-Modal-confirm (subtitle `{{name}}` = fullName, `initialFocusRef` → «Отмена»); `useConfirmAction` владеет state-machine (решение OPEN-4). ✔
- **R-5 Весь Save умирает** вместе с инлайн-формой; каждое поле сохраняется своим модал-Save; `fullName` — своим inline-Save. ✔
- **R-6 i18n**: 4 новых ключа (`aboutFieldDescriptions/Stats/Cta/FullName`, en+ru, parity-тест); сырых ключей нет (preview-смоук light+dark). ✔
- **R-7 Тесты**: `AboutEditorList.test.tsx` (23), `AboutFieldEditForm.test.tsx` (15), `lib/fieldSchemas.test.ts` (22), `AdminAboutPage.test.tsx` (4) — на реальном сторе (харнесс `renderAdminPage`); старый `AboutEditorForm.test.tsx` умер вместе с формой; баррел-пин обновлён; мёртвый SCSS (`.field`/`.localeRow`) удалён. ✔

## Итог (2026-10-20, PR #315)

Эпик поставлен squash-ем в PR #315 (`feat/admin-about-table`, base `dev`): WU-1..8 выполнены (см. git-историю), WU-9 = подъём капа бандла + burn-down этой пары. Гейты:

- `npm run validate` — EXIT 0, 3882/3882 тестов (239 файлов), public-api 37/37.
- `npm run check:axe` — 0 регрессий против baseline (4 known); `/admin/about` light+dark чист.
- `npm run check:bundle` — 840.4 KiB < 841.0 KiB (кап `total.maxSize` 860160 → 861184 поднят по слову владельца 2026-10-20: measured 860537 B, +377 B; main/vendor/gzip не тронуты).
- preview-смоук — 18/18 (скриншоты во temp-директории агента, владелец смотрит локально).

## Критерии приёмки (итог)

Пользователь на `/admin/about` видит таблицу полей документа (EN|RU) как во всей админке; Pencil открывает модалку одного поля с правильным типом контроля; сохранение пишет в storage ДО стора и переживает persist-fail; Reset ведёт себя как сейчас (машина — `useConfirmAction`); add/remove строк недоступны; витрина `features/About` не изменилась; гейты зелёные. **Всё подтверждено гейтами WU-8/WU-9.**
