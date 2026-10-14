---
status: approved
epic: mywork-detail-table
created: '2026-10-14'
---

# SPEC — features/AdminMyWork (карточки-проекты, mywork-detail-table)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> План: vault `wiki/plan/plan_mywork_detail_table.md`, rev.1 (2026-10-14). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Статус `approved` — вердикт владельца 2026-10-14: OPEN-1=A′ (карточки-проекты), OPEN-2=A (collapsed default), OPEN-3=B (field-edit не переносим), OPEN-4=A (заголовки модалки), OPEN-5=A (sort: storage/title/category/year).

## История (предыдущий эпик — содержание сохранено, тексты в git)

Пара SPEC/TODO до этого описывала эпик `admin-mywork-refactor` (status `done`,
verified 2026-10-12, PR #217, squash `ea1a015`): паритет с AdminSkills уровня
2026-10-12. Его закрытые результаты (всё ещё в силе и НЕ переоткрывается):

- ARCH-1 докрутка: `ui/ProjectForm/lib/projectFormSchema.ts` внутри компонентной директории; на верхнем уровне `ui/` нет посторонних файлов.
- Confirm-parity: subtitle `projectConfirmDeleteName {{name}}`, `initialFocusRef` → «Отмена», persist-fail держит модалку открытой (список + form-delete; form-delete позже релокирован в список).
- Пустое состояние → kit `EmptyState` (`noProjectsYet`).
- Форма в page-owned kit `Modal` (`AdminMyWorkPage`), h2+hint удалены из формы, `AdminMyWorkPage.test.tsx` создан (харнес AdminSkillsPage: реальный store, моки storage/i18n/toast).
- Витрина на kit DataTable (WU-5) — **именно этот слой заменяется настоящим эпиком**.
- Подтверждения релокированы из формы: delete — строки списка, reset — шапка витрины (shared confirm Modal).
- Баррел почищен: 6 production-символов + `removeProjects` (тест-правило tests-public-api-only) + guard `index.test.ts`.
- Гейты того эпика: validate 3464/3464, axe-stories 72/72, axe 0 регрессий, бандл 732.3 < 744.

Опровержения предыдущего эпика, подтверждённые и остающиеся в силе:
persist-order бага НЕТ (снимок везде из insertion-order `selectAllProjects`,
сортирующего селектора нет — selectors.ts:5-14); дрейф лимитов схемы
НЕВОЗМОЖЕН (делегирование через `.pipe()` в entities); axe-маршрут
`/admin/mywork` уже в PATHS (`scripts/purge-axe-check.mjs`).

## Цель

Заменить DataTable-витрину `MyWorkEditorList` на **карточки-проекты** —
зеркало эталона `jobs-detail-table` (AdminJobs #225, вариант A′): запись =
kit `Card` (collapsed по умолчанию), внутри — read-only detail-таблица
`[Данные | Значение | Действия]`; сортировка переезжает в page-level kit
Select (JobsList-паттерн); действия списка — kit IconButton + Tooltip
(Jobs #225 / Skills #221 паритет). Форма, model-слой, FileUpload-пилот и
showcase-витрина — **без изменений**. Критерий успеха: ВСЕ текущие
пользовательские сценарии `/admin/mywork` работают как прежде, меняется
только способ навигации по записям.

## Контекст (факты, проверено чтением кода 2026-10-14)

- Слой: ui/MyWorkEditorList.tsx (317 LOC: DataTable 6 колонок + пагинация
  5|10|20 + range-counter + text-кнопки Edit/Delete), ProjectForm.tsx (395
  LOC, RHF+zod, FileUpload+imageSubdir), model без изменений со #217;
  страница `src/pages/Admin/ui/AdminMyWorkPage/AdminMyWorkPage.tsx` (66
  LOC) + AdminMyWorkPage.test.tsx (6 its); лист-тест 18 its (425 строк);
  form-тест 587 строк.
- Семя `PROJECTS` = 7 записей (`entities/Project/model/constants`); поля
  Project: title, description{en,ru} (проза), techIcons[] (ключи),
  link|null, image, category, status, featured, role?{en,ru}, metrics?[],
  year?, createdAt?, updatedAt?.
- Эталоны: AdminJobs = JobCard (collapsible record-card, collapsed
  default, detail Table, Pencil/Trash2, inline bullet-CRUD, FieldEditForm
  per-field модалки, sort-Select в шапке) + AdminSkills (collapsible
  category-карточки, IconButton+Tooltip, DataTable внутри карточек).
- Скоуп дельты (D1..D5 плана): карточная витрина; IconButton+Tooltip;
  sort-Select; заголовок модалки create≠edit; пагинация уходит с
  DataTable (Jobs R-4 паритет, ≤15 записей render all).
- Переиспользуемые i18n: `projectField*` (все labels detail-строк),
  `projectEdit`/`projectDelete` (ariaLabel+Tooltip), `noProjectsYet`,
  `adminMyWorkTitle/Hint/Add`, `projectReset*`, `projectConfirmDeleteName`,
  `paginationRange` (kit — вне скоупа).
- НЕ проверено (отметка): точные CSS-значения JobCard.module.scss /
  JobsList.module.scss (читать при WU-1/WU-2 как референс); внутренности
  ProjectForm.test.tsx (ожидание — без изменений, проверка гейтом).

## Скоуп

Меняются: `src/features/AdminMyWork/ui/ProjectCard/**` (новый),
`ui/MyWorkEditorList/**`, `src/pages/Admin/ui/AdminMyWorkPage/**`,
локали `en.json`/`ru.json` (+11 ключей).

НЕ меняются: `model/**` целиком; `ui/ProjectForm/**`; баррел
`index.ts` + `index.test.ts`; `entities/Project/**`; `features/MyWork`
(Design C) и его тесты; `HomePage.tsx`/`HomePage.test.tsx`;
`storeReducers.ts`; kit-компоненты (DataTable остаётся для Skills);
axe-PATHS; `performance-budget.json`.

## Требования

### R-1 — ProjectCard (новый компонент, TDD)
- [ ] `ui/ProjectCard/ProjectCard.{tsx,module.scss,test.tsx}` по образцу
      JobCard: collapsed default (caption `project.title` снаружи,
      strip `Plus` fullWidth `.strip.strip`), expanded (Minus +
      `aria-expanded="false"` + `aria-controls` стабильный
      `mywork-project-content-${id}`, h3 + Badge status/featured,
      Pencil/Trash2 IconButtons с Tooltip `showDelay={0}`).
- [ ] Detail kit Table `[Данные | Значение | Действия]`: labels —
      существующие `projectField*`; строки honest-data (link/image/
      role/metrics/year только при наличии); technologies через запятую.
- [ ] Quirk-паритет: strip несёт `aria-expanded="true"` (не чинить,
      как JobCard.tsx:326).
- [ ] Инвариант: карточка НЕ пишет в store/хранилище (в отличие от
      JobCard с inline bullet-CRUD — у нас его нет, см. §Не переносим).
- [ ] Тесты RED→GREEN: collapsed default, expand/collapse roundtrip
      (stable aria-controls), onEdit/onDelete callbacks, honest-data
      строки (нет link-row при `link: null` и т.п.), Badge featured.

### R-2 — MyWorkEditorList rewrite (JobsList-паритет)
- [ ] Header: h2+hint + sort Select (`storage` default | `title` |
      `category` | `year` desc `?? 0`) + reset IconButton + add
      IconButton; сортировка = `useMemo`-копия над `selectAllProjects`
      (store/array не мутируется).
- [ ] Инвариант persist-THEN-dispatch из INSERTION-ORDER снимка
      `selectAllProjects` сохранён байт-в-байт; тест «delete при
      включённой сортировке persist-ит insertion-order».
- [ ] Список = EmptyState (пусто) + карточки; DataTable/PageSizeGroup/
      Pagination/range-counter и `STATUS_VARIANTS`/`PAGE_SIZE_OPTIONS`
      удалены из файла.
- [ ] Confirm-modal (delete `projectConfirmDeleteName` + reset) —
      логика без изменений (subtitle/focus/persist-fail-retry).
- [ ] Лист-тесты переписаны с сохранением смысла 18 its; порядок
      persist→dispatch — shared `calls`.

### R-3 — Страница (минимальный diff)
- [ ] (OPEN-4=A) Модалка: title `adminAddProject` / `adminEditProject`
      по режиму; `adminMyWorkTitle` остаётся на шапке витрины.
- [ ] `AdminMyWorkPage.test.tsx`: expand-first хелпер (имя
      `/^adminMyWorkExpand/` под identity t-mock) до клика
      `project-card-actions-${id}`; stale-guard/ESC/overlay/A12 и
      «Добавить на пустом списке» остаются зелёными.

### R-4 — i18n
- [ ] +11 ключей en+ru (flat): adminMyWorkSort, adminMyWorkSortStorage,
      adminMyWorkSortTitle, adminMyWorkSortCategory, adminMyWorkSortYear,
      adminMyWorkExpand (`{{title}}`), adminMyWorkCollapse (`{{title}}`),
      adminMyWorkTableField, adminMyWorkTableValue, adminAddProject,
      adminEditProject.
- [ ] Parity-тест зелёный без правок; старые adminMyWorkTableTitle/
      Category/Status/Featured/Year живут как labels detail-строк
      (вымирания ключей нет).

### R-5 — Гейты эпика
- [ ] `npm run validate` зелёный (type-check + lint + lint:styles +
      тесты + coverage + public-api); флэйки CPU — рераном файлов в
      изоляции, НЕ бампом timeout.
- [ ] axe-app `/admin/mywork`: 0 регрессий (маршрут в PATHS).
- [ ] `check:public-api` зелёный (состав баррела не меняется).
- [ ] Бандл-дельта worktree на merge-base в капе 786432; превью
      headed desktop+mobile (collapse/expand, sort, confirm, форма).

### R-6 — Не переносим (зафиксированный отказ, паритет-таблица плана §0)
- [x] FieldEditForm / per-field модалки — отклонены как «лишнее»
      (OPEN-3=B дефолт рекомендации); при вердикте «портировать» —
      отдельный эпик ПОСЛЕ этого.
- [x] Inline-CRUD строк (↑↓Trash2) — у Project нет параграфных
      массивов; description/role = проза в полной форме, metrics —
      читается в detail-таблице read-only.
- [x] Grouping по категориям (Skills) — новая UX-функция, не миграция.
- [x] FileUpload/imageSubdir, showcase MyWork, Design C — вне скоупа.

## Критерии приёмки (итог)

Пользователь на `/admin/mywork` видит свёрнутые карточки проектов
(подпись = название снаружи); expand открывает detail-таблицу полей;
Pencil — та же модальная форма (create/edit/ESC/overlay/stale-guard как
прежде); Trash2 — confirm с названием проекта, фокус «Отмена», при ошибке
persist модалка не закрывается; reset — в шапке под confirm; сортировка
перестраивает порядок карточек и НЕ искажает порядок в localStorage;
пустой список — EmptyState; «Добавить» доступна на пустом списке;
`npm run validate`, axe и бандл-кап зелёные.
