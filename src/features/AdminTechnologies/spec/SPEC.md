---
status: done
epic: technologies-crud
issue: 258
created: '2026-10-16'
verified: '2026-10-16'
spec: 1
---

# SPEC — features/AdminTechnologies (админ-каталог технологий проектов)

> Единственная истина для этого эпика (spec-driven workflow: AGENTS.md, раздел
> Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Источник:.issue #258 + утверждённый план (решения D1–D7 закреплены владельцем).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Companion: [TODO.md](./TODO.md).

## Цель

Каталог иконок технологий проектов сегодня ЗАХАРДКОЖЕН в
`src/entities/Project/model/constants/constants.ts` (`TECH_ICONS`, 14 записей
`{url, invertInDark?}` с devicon CDN). Добавление/правка/удаление технологии
требует правки кода и пересборки. Эпик переводит каталог в динамические данные:
новая сущность `entities/Technology` + админ-страница `/admin/technologies`.

## Контекст (факты, проверены 2026-10-16)

- Хардкод: `entities/Project/model/constants/constants.ts:7-61` — `TECH_ICONS`
  (14 ключей: react, nextjs, typescript, javascript, tailwind, css, html, sass,
  nodejs, python, postgresql, redux, framer, d3js), `satisfies Record<string, TechIcon>`,
  `TechIcon` из `@/shared/ui/Card`.
- Потребители `TECH_ICONS`: `entities/Project/model/schemes/schema.ts:25,29`
  (`TECH_ICON_KEYS` — zenum для `techIcons`), `entities/Project/lib/utils.ts:3`
  (`resolveTechIcons` — defensive skip + `console.warn` для неизвестных ключей),
  `entities/Project/index.ts:12` (баррел), `AdminMyWork/ui/ProjectForm/ProjectForm.tsx:115`
  и `AdminMyWork/ui/FieldEditForm/FieldEditForm.tsx:114` (`Object.keys` → toggle-кнопки),
  тесты `constants.test.ts` / `utils.test.ts` / `schema.test.ts:87`.
- `resolveTechIcons` вызывается в `features/MyWork/ui/MyWork/MyWork.tsx:101`
  (публичная витрина) и передаётся в kit `Card` (`ProjectCard` рендерит
  `<img src={tech.url}>`; `invertInDark` применяется фильтром в dark-теме на
  стороне потребителя — см. `SkillItem.module.scss .invertInDark`).
- Сид `PROJECTS` (с `techIcons: ['react', …]`) НЕ мигрирует — остаётся в `entities/Project`.
- Store: `src/storeReducers.ts` — глубокие импорты слайсов фич/сущностей
  (НЕ баррелы, `resume-lazy-rhf-chunk`); файл вне FSD-слайсов (rule-exempt).
- Маршруты: `src/pages/routerConfig.tsx:39-98` — 7 lazy-детей `/admin`;
  `AppRouter.test.tsx:68`assertCount `toHaveLength(7)` → станет 8.
- Сайдбар: `AdminLayout.tsx:65-85` — 7 хардкодных `<Link>`, i18n-ключи `adminNav*`.
- Axe: `scripts/purge-axe-check.mjs:39-46` — `PATHS` из 7 путей → добавить
  `'/admin/technologies'`.
- FSD (`ALLOWED_IMPORTS`): `features → [entities, shared]` (фича↔фича ЗАПРЕЩЕНО);
  `entities → [shared]` (сущность↔сущность ЗАПРЕЩЕНО);
  `pages → [app, pages, widgets, features, entities, shared]`.
- ARCH-1 (issue #178/#181): каждый компонент в своём каталоге
  `ui/<Name>/<Name>.{tsx,test.tsx,module.scss}`; `model/` — ТОЛЬКО подкаталоги с
  самоназванными файлами, БЕЗ index-баррелов внутри model; баррел — корневой `index.ts`.

## Решения (закреплены, D1–D7)

- **D1** — новая сущность `src/entities/Technology/` владеет: типами, zod-контрактом,
  сидом (= 14 записей `TECH_ICONS` перенесены дословно, те же ключи), localStorage
  (ключ `technologies`), RTK-слайсом, селекторами и `resolveTechIcons`.
  Обоснование: 3 фичи-потребителя (AdminTechnologies CRUD, AdminMyWork формы,
  MyWork витрина) — таблица решений FSD. Стор: `storeReducers.ts` +=
  `technologies: technologiesReducer` через ГЛУБОКИЙ импорт
  `@/entities/Technology/model/slices/technologiesSlice`.
- **D2** — контракт `entities/Project`: `techIcons` ослабляется до
  `z.array(z.string()).max(20)` (сущности не импортируют сущности). Проверка
  «ключ ∈ каталог» переезжает на уровень фичи: `projectFormSchema.ts` становится
  фабрикой `makeProjectFormSchema(validKeys)` (zod `.refine`), то же для
  techIcons-слайса в `AdminMyWork/ui/ProjectForm/lib/fieldSchemas.ts`. Тесты
  обновляются: `schema.test.ts:87` ПЕРЕПИСЫВАЕТСЯ (type/boundary-ассерты),
  membership-тесты добавляются на уровне форм-схем фичи.
- **D3** — ключи сида не меняются → миграции данных НЕТ; `TECH_ICONS` удаляется
  из `entities/Project` (константа + тесты + баррел + устаревшие комментарии);
  `resolveTechIcons` переезжает в `entities/Technology/lib/utils.ts` (читает
  каталог: localStorage → fallback на сид; defensive skip + warn сохраняются;
  СИГНАТУРА ТА ЖЕ: `resolveTechIcons(keys: string[]): TechIcon[]`); его тесты
  переезжают в `entities/Technology/lib/utils.test.ts`; импорт в
  `features/MyWork/ui/MyWork/MyWork.tsx:101` переключается на `@/entities/Technology`.
- **D4** — селекторы `selectAllTechnologies` / `selectTechnologyKeys` возвращают
  FALLBACK НА СИД, когда слайса нет в сторе (Storybook без StoreProvider; голые
  тесты). Никогда не бросать на отсутствующем состоянии.
- **D5** — ленивая гидрация слайса: первая операция редьюсера делает
  `state ?? readTechnologies() ?? seedTechnologies()` (НЕ на импорте модуля —
  `resume-rtk-lazy-hydration`); действия add/update/remove;
  persist-THEN-dispatch (`persistTechnologies(...)` → dispatch).
- **D6** — guard удаления: ключ, используемый ЛЮБЫМ проектом, удалить нельзя —
  ошибка ВНУТРИ confirm-модалки, модалка остаётся открыта, ничего не происходит.
  Список фичи получает проп `usedKeys: ReadonlySet<string>` от
  `AdminTechnologiesPage`, который строит его из `selectAllProjects(state)`
  (`projects.flatMap(p => p.techIcons)`); pages могут импортировать фичи — легально.
- **D7** — ключ в edit-режиме неизменяем (Input `disabled` + zod edit-схема
  исключает смену ключа).

## Структура интерфейса (цель)

```
Section (data-testid="admin-technologies")
├─ ErrorBoundary
├─ Шапка: Heading(h2) + Paragraph(hint) | IconButton «Добавить» (Plus, md, Tooltip top)
├─ Список: DataTable (плоские строки, PAGE_SIZE = 12, сортировка по ключу):
│   ├─ колонки: Иконка (<img src={iconUrl}>, invertInDark — dark-инверсия как в SkillItem)
│   │           | Ключ | Действия (Pencil outline + Trash2 danger, size=sm,
│   │           Tooltip position=top showDelay=0, aria-label = контент;
│   │           ОБЁРТКА ЯЧЕЙКИ — .cellActions c flex-wrap: nowrap, PR #256)
│   └─ пустой каталог → EmptyState (слоты title/description/action; kit НЕ навязывает heading)
├─ Модалка формы (ВЛАДЕЛЕЦ — страница): page держит form: {mode, record} | null;
│   заголовок модалки = accessible name диалога (aria-dialog-name); у формы СВОЕГО h2/интро НЕТ
└─ Модалка confirm-delete: subtitle называет удаляемый ключ,
    initialFocusRef → «Отмена», guard-ошибка и storage-ошибка держат модалку открытой,
    тело {null} (kit ModalProps.children обязателен)
```

## UI-паритет (владелец: стиль AdminJobs/AdminSkills)

- **TechnologyForm** зеркалит `features/AdminSkills/ui/TechnologyForm/`: RHF +
  `zodResolver(makeTechnologyFormSchema(existingKeys, mode))`, mode = record ? 'edit' : 'create';
  поля: `key` (slug: строчные буквы/цифры/дефисы, уникален в create, неизменяем в edit),
  `iconUrl` (абсолютный https:// URL), `invertInDark` (kit `Select`, две опции да/нет).
  Корень — kit `<Form gap="lg">`; в module.scss НЕ задавать `gap` на `.form`
  (конфликт с kit gap → 24px); `.actions` = `display:flex; flex-wrap:wrap; gap:$spacing-3`.
  zod-ошибки — ВНЕ kit-контролов, `Paragraph role="alert"`; нативных `<label>` нет.
  Save = kit `Button` (`loading`; компонента ButtonLoader в kit НЕТ).
- **TechnologiesList** — витрина по образцу `SkillsEditorList`: kit `DataTable`
  (плоские строки, `PAGE_SIZE = 12`), колонки [Иконка | Ключ | Действия],
  row-действия Pencil (outline) + Trash2 (danger) `size="sm"` в Tooltip top;
  `.cellActions` (nowrap) ТОЛЬКО для cell-renders, `.actions` (wrap) — для шапки;
  шапка: kit `Heading` + `IconButton size="md"` (add) с Tooltip top;
  `EmptyState` при пустом каталоге.
- **Модалки** — gold standard (#205/#216-#220): форма на СТРАНИЦЕ (page-owned),
  confirm: subtitle называет сущность, `initialFocusRef` → «Отмена», storage-ошибка
  держит модалку открытой, тело `{null}`.
- **i18n**: ВСЕ новые строки через `t()`, ПЛОСКИЕ ключи (без точек — i18n
  `keySeparator` сломает), в ОБЕИХ `en.json` и `ru.json` (parity-тест сверяет
  множество ключей). Префикс — согласованно с `adminSkills*`/`adminJob*`:
  `adminNavTechnologies`, `adminTechnologiesTitle`, `adminTechnologiesHint`,
  `adminTechnologiesAdd`, `adminTechnologiesEmpty`, `adminTechKeyLabel`,
  `adminTechIconUrlLabel`, `adminTechInvertLabel`, `adminTechInvertYes`,
  `adminTechInvertNo`, `adminTechKeyInvalid`, `adminTechKeyExists`,
  `adminTechUrlInvalid`, `adminTechSave`, `adminTechCancel`,
  `adminTechnologiesEdit`, `adminTechnologiesDelete`, `adminTechConfirmDelete`
  (subtitle подставляет ключ), `adminTechDeleteInUse` (guard),
  `adminTechFormSubtitle`, `adminTechSaved`, `adminTechDeleted`,
  `adminTechPersistError`, `adminTechTableIcon`, `adminTechTableKey`,
  `adminTechTableActions`.

## Критерии готовности (наблюдаемые исходы)

- [ ] Ветка `feat/258-technologies-crud` отрезана от `origin/dev`; DRAFT PR
      открыт с `--base dev` в момент старта работ.
- [ ] `src/features/AdminTechnologies/spec/SPEC.md` + `TODO.md` существуют,
      статус SPEC `approved` до старта WU-1; оба файла в индексе git
      (проверено `git status` / `git diff --cached` — негация `.gitignore`).
- [ ] `npm run check:spec` — exit 0 (pass-set `approved|done`).
- [ ] `entities/Technology` существует по ARCH-1: `model/types/types.ts`,
      `model/schemes/schema.ts` + тест, `model/constants/constants.ts` (сид 14),
      `model/services/storage.ts` + тест (ключ `technologies`),
      `model/slices/technologiesSlice.ts` + тест (ленивая гидрация D5),
      `model/selectors/selectors.ts` (D4), `lib/utils.ts` + тест, корневой `index.ts`.
- [ ] `storeReducers.ts` содержит `technologies: technologiesReducer` (глубокий импорт).
- [ ] Первый редьюсер слайса гидрирует из localStorage, а не на импорте модуля
      (тест: пустой стор после `persistTechnologies([...])` в localStorage →
      состояние = записанные данные уже при `configureStore`).
- [ ] Селекторы при отсутствии `state.technologies` возвращают сид (тест), не бросают.
- [ ] `TECH_ICONS` удалён из `entities/Project`: grep по репо — 0 упоминаний;
      `resolveTechIcons` живёт в `entities/Technology/lib/utils.ts`, сигнатура прежняя;
      импорт в `MyWork.tsx` переключён.
- [ ] `ProjectSchema.techIcons` = `z.array(z.string()).max(20)`: принимает
      произвольную строку-ключ (например `'cobol'`), отклоняет >20 элементов и
      не-строки (тест `schema.test.ts` ПЕРЕПИСАН, не удалён).
- [ ] Membership-тесты на уровне форм-схем фичи: `makeProjectFormSchema(validKeys)`
      отклоняет ключ вне `validKeys`; `ProjectForm`/`FieldEditForm` рендерят
      toggle-кнопки из `selectTechnologyKeys` (не из `Object.keys(TECH_ICONS)`).
- [ ] `features/MyWork` витрина рендерит те же иконки, что и до эпика (сид
      идентичен) — смоук-тест `resolveTechIcons` по сид-проектам зелёный.
- [ ] `/admin/technologies` — lazy-ребёнок в `routerConfig.tsx`;
      `AppRouter.test.tsx` — `toHaveLength(8)`.
- [ ] Сайдбар `AdminLayout` содержит ссылку `adminNavTechnologies`; тест
      `AdminLayout.test.tsx` её находит.
- [ ] `AdminTechnologiesPage.test.tsx` (харнес как в `AdminSkillsPage.test`:
      реальный `configureStore({reducer: storeReducers})`, мок только storage,
      identity-`t`, toast-контекст) покрывает: create-Save закрывает модалку,
      Cancel/ESC/оверлей закрывают, ровно ОДНА модалка открыта, edit сохраняет
      ключ строки, guard: удаление используемого ключа → `adminTechDeleteInUse`
      ВНУТРИ модалки, модалка открыта, стор/хранилище не тронуты,
      storage-ошибка → модалка открыта, стор не тронут.
- [ ] `TechnologiesList.test.tsx`: рендер строк из стора, Pencil вызывает
      `onEditTechnology`, Trash2 открывает confirm, confirm называет ключ в
      subtitle, пустой каталог → EmptyState.
- [ ] i18n: `en.json`/`ru.json` содержат все новые ключи; `locales-parity.test`
      зелёный (множества ключей равны).
- [ ] `scripts/purge-axe-check.mjs` PATHS содержит `'/admin/technologies'`.
- [ ] Гейты (WU-5, по порядку): prettier-check по тронутым файлам →
      `npm run validate` → `npm run check:spec` → `npm run build` +
      `npm run check:bundle` (подъём ТОЛЬКО `total.maxSize` при необходимости,
      с комментарием эпик+PR) → `npm run check:axe` (0 регрессий).
- [ ] PR переведён в ready (`gh pr ready`), CI зелёный, squash-merge с
      `--delete-branch`, issue #258 закрыт вручную.

## Вне скоупа

- Миграция сид `PROJECTS` и любые изменения данных витрины.
- Правка budget-капов кроме `total.maxSize` (см. WU-5).
- Backend/NestJS — storage остаётся localStorage (swap-note как у других CRUD).
- Изменение контракта `TechIcon` kit `Card` (тип переиспользуется как есть).

## Связи

- Gold standard: PR #205 (AdminSkills), #216–#220 (refactor-цепь).
- Уроки: `resume-lazy-rhf-chunk`, `resume-rtk-lazy-hydration`,
  `resume-fsd-cross-slice` (D2 — membership на уровне фичи), `resume-table-cell-actions-row`
  (`.cellActions` nowrap), `resume-pr-base-dev-default-main` (PR всегда `--base dev`).

## Итог

Доставлено без девиаций: контракт D1–D7 исполнен как написано, эпик закрыт
PR #259 (squash `4b3ff39`, verified 2026-10-16).
