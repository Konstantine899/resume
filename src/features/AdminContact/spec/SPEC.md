---
status: done
epic: admin-contact-refactor
created: '2026-10-11'
verified: '2026-10-12'
---

# SPEC — features/AdminContact (паритет с gold standard админ-семьи)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел
> Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_contact_refactor.md`, rev.1
> (draft, 2026-10-11). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде —
> i18n-ключи en+ru.
> Статус `approved` — вердикт владельца 2026-10-12 принят без изменений.

## Цель

Закрыть фактические разрывы `features/AdminContact` с золотым стандартом
админ-семьи (`features/AdminSkills`, план `plan_admin_panel_edit.md`, PR #205):
destructive Reset через kit Modal-confirm вместо нативного `window.confirm`,
тест страницы, `/admin/contact` в axe-PATHS, гигиена публичного API баррела.
Model-слой (slice/storage/seed) и entity-контракт `ContactContent` эталонные
и не меняются. Contact — единичный документ: списочно-списочные паттерны
(DataTable/EmptyState/пагинация) не применимы и не вводятся.

## Контекст (факты, проверено 2026-10-11)

- Слой: `features/AdminContact` (13 файлов, 968 LOC, 35 тестов), композиция —
  `src/pages/Admin/ui/AdminContactPage` (тонкая, инлайн-форма), данные —
  entity-контракт `entities/ContactContent` + слайс `contactContent` +
  storage `resume.contact.content` (persist-THEN-dispatch).
- ARCH-1 соблюдён (`ui/ContactEditorForm/`, model-поддиректории); единственный
  формальный шероховатость — `model/selectors/index.ts` = repo-wide OPEN-8.
- Форма: RHF + `zodResolver` ОБЩЕЙ entity-схемы (ContactEditorForm.tsx:110,
  schema.ts:28-52) — дрейф лимитов исключён по построению; persist-fail
  держит значения (:121-124); ошибки через пропс `error` kit-инпутов.
- Разрыв: Reset = `window.confirm` (ContactEditorForm.tsx:132); gold — kit
  Modal-confirm (SkillsEditorList.tsx:361-381; MyWork ProjectForm.tsx:13-14
  «never window.confirm»). `removeContactContent(): void` (storage.ts:52-58) —
  ветки persist-fail у Reset нет.
- Страница без тестов; `/admin/contact` вне axe-PATHS
  (scripts/purge-axe-check.mjs:37); баррел (index.ts:16-29) — 5 мёртвых
  снаружи + 2 deep-import-дубля, production-потребитель один
  (`ContactEditorForm`, AdminContactPage.tsx:11).
- i18n: 14 ключей `adminContact*`/`contact*`, все потреблены, en/ru 293/293,
  мёртвых нет; для Modal-confirm нужен новый ключ `contactCancel`.

## Скоуп

Меняются: `src/features/AdminContact/ui/ContactEditorForm/**` (Modal-confirm),
`src/features/AdminContact/index.ts`,
`src/pages/Admin/ui/AdminContactPage/AdminContactPage.test.tsx` (новый),
локали `en.json`/`ru.json` (+ `contactCancel`),
`scripts/purge-axe-check.mjs` (PATHS += `/admin/contact`),
`src/pages/Home/ui/HomePage/HomePage.test.tsx` (barrel → deep-import).

НЕ меняются: `model/` AdminContact целиком (+ тесты);
`entities/ContactContent/**` (заморожен, включая email-max);
`features/Contact/**` и его 3 голых `Contact.test` (Design C);
`storeReducers.ts`, `HomePage.tsx` (их deep-imports — resume-lazy-rhf-chunk);
`ContactEditorForm`-контракт props; поведение формы кроме Reset-подтверждения;
публичные контракты kit-компонентов.

## Требования

### R-1 — Reset-confirm через kit Modal
- [x] Кнопка «Сбросить» открывает kit `Modal`: title `t('contactReset')`,
      subtitle `t('contactResetConfirm')` (generic — единичному документу
      `{{name}}` не нужен, прецедент `skillsResetConfirm`), `children={null}`,
      footer: «Отмена» (outline) + «Сбросить» (danger).
- [x] `initialFocusRef` → кнопка «Отмена» (Modal model/types.ts:197).
- [x] `window.confirm` в форме отсутствует; подтверждение выполняет
      remove → dispatch `resetToDefaults` → `reset(createContactSeed())`
      (порядок сохранён); Cancel/ESC/overlay — закрывает без side-эффектов.
- [x] Новый i18n-ключ `contactCancel` (en+ru); en/ru parity-тест зелёный.
- [x] Комментарий в коде: ветки persist-fail нет —
      `removeContactContent(): void`, never-throws (storage.ts:52-58);
      синхронный поток, `deleting`-state не вводится.
- [x] Тесты зелёные (переписанные :179-207 + новые): открытие без
      `window.confirm`; Cancel не трогает storage; подтверждение — порядок
      remove→dispatch по `invocationCallOrder` и form ← seed; фокус на
      «Отмена».

### R-2 — Тест страницы
- [x] Существует `AdminContactPage.test.tsx` с реальным
      `configureStore({reducer: storeReducers})`, моки только
      storage/i18n/toast (харнес `AdminSkillsPage.test.tsx:25-66`).
- [x] Smoke инлайн-компонента: форма рендерится,
      `data-testid="admin-contact"`, email prefilled = `CONTACT_EMAIL`
      (seed-гидрация через реальный slice); Modal-ассерты формы
      (ESC/overlay/«единственный диалог») не требуются.

### R-3 — Публичный API баррела
- [x] `index.ts` оставляет только символы с реальным баррел-потребителем:
      `ContactEditorForm`(+Props) — lazy `/admin/contact`, и трио
      `createContactSeed`/`persistContactContent`/`removeContactContent` —
      `HomePage.test` (`fsd-imports/tests-public-api-only` требует, чтобы тест
      брал кросс-слайсовые символы через баррел; идентичное трио держат
      AdminAbout/AdminMyWork). Удалены 7 мёртвых: `CONTACT_CONTENT_STORAGE_KEY`,
      `readContactContent`, `resetToDefaults`, `updateContactContent`,
      `ContactContentRootState`, `selectContactContent`,
      `contactContentReducer`; NOTE в `index.ts` переписан; guard
      `index.test.ts` пинит live-набор.
- [x] Deep-import в `HomePage.test.tsx` НЕВОЗМОЖЕН по правилу
      `tests-public-api-only` (ESLint-пробой WU-3: 2 errors «bypassing its
      public API») — исходное требование снято как ошибочное.
- [x] `npm run validate` зелёный (`check:public-api` включительно) —
      3502/3502, public-api 37/37.

### R-4 — axe: `/admin/contact` в PATHS
- [x] `scripts/purge-axe-check.mjs` PATHS содержит `'/admin/contact'`.
- [x] axe-app: 0 регрессий; новые fingerprint'ы страницы приняты регенерацией
      baseline на чистом прогоне (`--update-baseline`); showcase-known
      нарушения не тронуты.

### R-5 — Известные проблемы вне скоупа (зафиксировать, не чинить)
- [x] Email в `ContactContentSchema` без max (`entities/ContactContent`:
      `z.string().trim().pipe(z.email())`) при form `maxLength=120` —
      **решение владельца D6 = R3-γ (2026-10-17)**: лимит держится ТОЛЬКО
      на уровне формы, entity-контракт остаётся открытым; схема валидирует
      и запись, и чтение, поэтому `.max(120)` молча затёр бы уже
      сохранённый документ с длинным email (seed-fallback) — осознанно
      не вводится. Было: известная проблема / OPEN-4=B.
- [x] ~~`window.confirm` в `AboutEditorForm.tsx:126`~~ — УСТАРЕЛО: починено
      в эпике admin-about-refactor (PR #218, 2026-10-12).
- [x] ~~`model/selectors/index.ts` — OPEN-8 repo-wide, не трогается~~ —
      УСТАРЕЛО: barrel удалён решением D5=R2-α (2026-10-17), потребители
      (`ContactEditorForm.tsx`, `HomePage.tsx`) переведены на явный путь
      `model/selectors/selectors`; `HomePage` остался deep-импортом
      (lazy-инвариант resume-lazy-rhf-chunk). Остаток OPEN-8 в сиблингах
      (AdminMyWork/AdminJobs) — вне скоупа (D7).
- [x] DataTable/EmptyState/пагинация — не применимы к единичному документу.

### R-6 — Гейты эпика
- [x] `npm run validate` зелёный (type-check + lint + lint:styles + тесты с
      coverage + public-api) — 3502/3502, public-api 37/37.
- [x] axe-app `/admin/contact`: маршрут в PATHS, 0 регрессий; baseline
      НЕ обновлялся — новых fingerprint-ключей не было (осталось 4 known,
      `/admin/contact` light+dark чист).
- [x] Бандл-дельта в капе `performance-budget.json` (737280) — 733.5 KiB
      < 744 KiB; UI-правки, новых зависимостей нет.
- [x] Все критерии R-1..R-4 закрыты; [TODO.md](./TODO.md) выжжен
      (выполненные пункты удалены, не отмечены).

## Критерии приёмки (итог)

«Сбросить» в админ-форме Contact открывает kit-модалку подтверждения с
фокусом на «Отмена» (нативного `window.confirm` в коде нет); подтверждение
сбрасывает storage/store/форму в seed-порядке; страница `/admin/contact`
покрыта тестом с реальным store; маршрут сканируется axe-app; публичный API
фичи не тащит мёртвых/дублируемых экспортов; `npm run validate`
и en/ru parity зелёные; model-слой и entity-контракт не изменены.
