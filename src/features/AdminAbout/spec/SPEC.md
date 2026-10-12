---
status: done
epic: admin-about-refactor
created: '2026-10-11'
verified: '2026-10-12'
---

# SPEC — features/AdminAbout (рефакторинг к паритету с AdminSkills)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_about_refactor.md`, rev.1 (draft, 2026-10-11). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Статус `approved` — вердикт владельца 2026-10-12: OPEN-1 = B, OPEN-2 = A, OPEN-3 = A (рекомендации приняты без изменений).

## Цель

Привести `features/AdminAbout` к паритету с отрефакторенным `AdminSkills`
(план `plan_admin_panel_edit.md`, PR #205) в точках, где About реально
отстаёт: нативный `window.confirm` на reset → kit Modal confirm с именем
сущности и фокусом на «Отмена», тест потребительской страницы, axe-покрытие
маршрута, гигиена баррела. Model-слой (slice/storage/seed) эталонный и не
меняется; бюджет-контракт lazy-RHF deep-import не нарушается.

## Контекст (факты, проверено 2026-10-11)

- Слой: `features/AdminAbout` (13 файлов, 926 LOC, 34 теста фичи + 15
  тестов entity-схемы), композиция страницы —
  `src/pages/Admin/ui/AdminAboutPage` (инлайн-форма, без Modal); данные —
  документ `AboutContent` + слайс `aboutContent` + storage
  `resume.about.content` (persist-THEN-dispatch).
- ARCH-1 layout СОБЛЮДЁН (`ui/AboutEditorForm/`, model-поддиректории);
  единственный компонент — форма-редактор ОДНОГО документа, витрины-списка
  нет (read-only `PROFILE_STACK`-превью вне CRUD, §5). DataTable / EmptyState
  / persist-order-баг сортированного селектора — неприменимы.
- Схема — общая `AboutContentSchema` из `entities/AboutContent`
  (zodResolver формы, AboutEditorForm.tsx:99): дрейф лимитов невозможен,
  HTML maxLength = капы схемы (80/600/60/40).
- Разрыв паритета: reset-подтверждение — нативный `window.confirm`
  (AboutEditorForm.tsx:126), тогда как Skills/MyWork/Jobs — kit Modal
  confirm («§6, never window.confirm»). Confirm не называет сущность, фокус
  не управляется.
- `AdminAboutPage` без теста; `/admin/about` не в axe PATHS
  (`scripts/purge-axe-check.mjs:37`); 7 из 12 экспортов баррела без
  внешних потребителей.
- Бюджет-контракт (resume-lazy-rhf-chunk): `storeReducers.ts:12` и
  `HomePage.tsx:4` — deep-import в model; barrel экспортирует
  `AboutEditorForm` только для ленивой страницы (routerConfig.tsx:58).

## Скоуп

Меняются: `src/features/AdminAbout/ui/AboutEditorForm/` (reset-confirm,
тесты), `src/features/AdminAbout/index.ts` (срез 7 мёртвых экспортов),
локали `en.json`/`ru.json` (значение `aboutResetConfirm` + ключ `aboutCancel`),
`src/pages/Admin/ui/AdminAboutPage/` (тест), `scripts/purge-axe-check.mjs`
(PATHS += `/admin/about`).

НЕ меняются: `model/**` (slices/services/selectors/types + тесты —
заморожены), deep-import в `storeReducers.ts` и `HomePage.tsx`
(resume-lazy-rhf-chunk), экспорт `AboutEditorForm` из баррела, поведение
Save/валидации/RHF-петли, `<ul>` PROFILE_STACK (вне CRUD), витрина
`features/About`, `entities/AboutContent` (типы/схема/тесты), публичные
контракты kit-компонентов.

## Требования

### R-1 — Reset-confirm на kit Modal (паритет §6)

- [x] `AboutEditorForm` открывает kit `Modal` по кнопке `aboutReset`;
      `window.confirm` отсутствует (AboutEditorForm.tsx:126 удалён).
- [x] Subtitle модалки называет сущность: ключ `aboutResetConfirm` (en+ru)
      содержит `{{name}}` и подставляет текущий `fullName` из формы;
      title = `aboutReset`; label кнопки-подтверждения ≠ текст subtitle.
- [x] `initialFocusRef` → кнопка «Отмена» (новый ключ `aboutCancel`,
      en+ru); ESC/overlay закрывает модалку без действий.
- [x] Подтверждение: `removeAboutContent()` → dispatch `resetToDefaults()` →
      `reset(seed)` — порядок сохраняется; `remove` never-throws, ветки
      persist-fail у reset нет (задокументировано комментарием).
- [x] Тесты формы: declined/ESC не вызывают remove; confirmed соблюдает
      порядок remove→dispatch и возвращает поля к seed; subtitle содержит
      текущий fullName; фокус на «Отмена». Старые 2 confirm-теста
      (AboutEditorForm.test.tsx:175-204) переписаны.
- [x] `locales-parity.test.ts`: `aboutCancel` в allowlist; `aboutResetConfirm`
      симметричен en/ru.

### R-2 — Тест страницы AdminAboutPage

- [x] Существует `src/pages/Admin/ui/AdminAboutPage/AdminAboutPage.test.tsx`
      с реальным `configureStore({ reducer: storeReducers })` (харнес
      `AdminSkillsPage.test.tsx:25-66`; моки только storage/i18n/toast).
- [x] Кейсы: рендер формы на странице; prefill из storage (lazy hydration);
      save-smoke (persist→dispatch); reset-кнопка видна.

### R-3 — axe-покрытие маршрута

- [x] `'/admin/about'` добавлен в PATHS
      (`scripts/purge-axe-check.mjs:37`); axe-app — 0 регрессий (вскрывшиеся
      нарушения чинятся в эпике).

### R-4 — Гигиена баррела

- [x] Из `index.ts` удалены 7 мёртвых экспортов
      (`selectAboutContent`, `ABOUT_CONTENT_STORAGE_KEY`, `readAboutContent`,
      `aboutContentReducer`, `resetToDefaults`, `updateAboutContent`,
      `AboutContentRootState`); сохранены `AboutEditorForm`(+Props),
      `createAboutSeed`, `persistAboutContent`, `removeAboutContent`
      (потребитель — `HomePage.test.tsx:9`); `check:public-api` зелёный;
      deep-import `storeReducers.ts:12`/`HomePage.tsx:4` не тронуты.

### R-5 — Известные ограничения (зафиксировать, не чинить)

- [x] `AdminContact` несёт тот же `window.confirm`
      (`src/features/AdminContact/ui/ContactEditorForm/ContactEditorForm.tsx:132`) —
      отдельный эпик (admin-contact-refactor); `model/selectors/index.ts` —
      OPEN-8 repo-wide; портрет/stack (`types.ts` deliberately absent) —
      stage-2. Select error-prop в AdminAbout не применяется (форма Select
      не использует) — family-wide волна живёт в OPEN-5 AdminJobs.
- [x] Компонентные тесты формы остаются на react-redux моке
      (задокументирован, FSD-запрет features→app); real-store покрытие даёт
      R-2 на уровне страницы.

### R-6 — Гейты эпика

- [x] `npm run validate` зелёный (type-check + lint + lint:styles + тесты с
      coverage + public-api) — 3485/3485, public-api 37/37.
- [x] axe-app (PATHS с `/admin/about`): 0 регрессий (baseline 4 known;
      `/admin/about` dark 1080/1279 class rules, 0 violations).
- [x] Бандл-дельта в капе `performance-budget.json` (737280) — 733.3 KiB
      < 744 KiB; UI-правки, новых зависимостей нет.
- [x] en/ru parity-тест зелёный (в составе validate).
- [x] Все критерии R-1..R-4 закрыты; [TODO.md](./TODO.md)
      выжжен (выполненные пункты удалены, не отмечены).

## Критерии приёмки (итог)

Пользователь на `/admin/about` видит ту же инлайн-форму; кнопка «Сбросить»
открывает kit-модалку подтверждения, которая называет имя, держит фокус на
«Отмена», закрывается по ESC и без действий; подтверждение сбрасывает документ
к seed в порядке remove→dispatch→reset-формы; страница покрыта реальным
store-тестом; маршрут в сканировании axe; баррел не содержит мёртвых
экспортов; `npm run validate` зелёный, bundle в капе.
