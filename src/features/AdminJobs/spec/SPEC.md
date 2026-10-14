---
status: approved
epic: job-status-select
created: '2026-10-14'
---

# SPEC — features/AdminJobs (карточки-записи, record detail table)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_jobs_detail_table.md`, rev.1 (approved, 2026-10-13). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> rev.3 (2026-10-13): вердикт владельца — вариант **A′** «record detail table»
> (строки = поля записи; отклонены B «только параграфы» и C «одна строка по
> колонкам»). Предыдущая rev.2 (epic `admin-jobs-refactor`, done, PR #216)
> выгорает вместе со своим TODO; model-слой, R-2/R-3/R-5 паритеты и
> `AdminJobsPage`-харнес остаются фундаментом и в этом эпике не меняются.
> **done (2026-10-14)**: WU-1..5 исполнены, squash `472bf8c`, PR #225, CI 8/8.
> Гейты: validate 3523/3523 (2 флэйка 5s-timeout при CPU 100%, зелёные в
> изоляции), axe-app 0 регрессий (light+dark), бандл 742.9 < 744 KiB
> (дельта +5.9 KiB от merge-base `7636814`), public-api 37/37, превью 19/19
> (collapse/expand, ↑↓× + persistence после reload, сортировка, CRUD-цикл,
> Paragraph-классы на bullet-input: 12px/primary/left, dark contrast ≥4.5:1).
> **rev.4 (2026-10-14):** эпик `job-field-edit` — пер-филд модальные окна
> (баг-репорт: все scalar-Pencil открывают одну полную модалку — misleading
> affordance; research 2026 inline-vs-modal; вердикт владельца 2026-10-14:
> **полевая модалка**, варианты B «true inline» и A «просто убрать Pencils»
> отклонены). План: vault `wiki/plan/plan_job_field_edit.md` (approved,
> auto-режим). §Требования R-1..R-8 rev.3 сгорели вместе с TODO (#225/#226);
> сохранены ниже для навигации. Живой контракт — §Требования rev.4.
> **Auto-режим (директива владельца 2026-10-14):** WU-1→WU-2→WU-3
> исполняются последовательно БЕЗ пауз и БЕЗ запроса подтверждений; гейты,
> squash auto-merge + удаление ветки, burn-down docs-PR и dual-write —
> автоматически; делегирование саб-агентам — по усмотрению оркестратора.
> **done (2026-10-14):** WU-1..3 исполнены, squash `e3a62b6`, PR #227, CI 2/2
> dev-раны. Гейты: validate 3545/3545, axe-app 0 регрессий (baseline 4),
> бандл 748.4 KiB — total-капа поднята 761856→786432 (auto-режим; main 97 KiB
> и vendor 290 KiB не тронуты, прирост только в lazy AdminJobsPage 40.3 KiB;
> gzip 233 KiB << 260), public-api 37/37, check:spec 15 ready, превью
> light+dark (период: 2 DatePicker + current-checkbox A6, end disabled;
> location-only; полная форма шапочным Pencil; ESC закрывает).
> **rev.5 (2026-10-14):** эпик `job-status-select` — два чекбокса (current/
> featured) в `JobForm` → один kit `Select` «Статус записи» с тремя опциями
> (`''` / `'current'` / `'featured'`); пустая опция — полноценный выбираемый
> элемент (валидное состояние «обычная запись»), не disabled-placeholder.
> Исследование утверждено владельцем 2026-10-14 («Отлично! меня все
> устраивает»): факты кода (`getFeaturedJobs` без потребителя — витрине
> уходят все записи через `selectSortedJobs`; фикстура `JobsList.test` с
> обоими флагами; A6 через `toggleCurrent`) + источники (GOV.UK Select
> «last resort», retrieved 2026-10-14; NN/g 2026-07-17; MDN 2026-10-08).
> Вердикт развилки — **вариант A**: взаимоисключение флагов в пределах
> записи, prefill «оба → `'current'`» (featured сбрасывается при следующем
> Save); отклонены B (4-я опция «оба») и C (селект + чекбокс). Трактовка
> «Избранная запись» = метка/продвижение (vitrina-эффект НЕ в скоупе).
> Режим сознательного отклонения: 3 опции → radio по гайдам, но модалка +
> паритет существующих Select'ов формы + директива владельца. План: vault
> `wiki/plan/plan_job_status_select.md` (draft, auto-режим предложен).
> §Требования rev.4 исполнены (PR #227/#228) — легаси-навигация; живой
> контракт — §Требования rev.5.

## Цель

Заменить плоскую DataTable-витрину `/admin/jobs` карточками-должностями:
каждое место работы = отдельная kit `Card` (collapse-логика зеркала
`SkillsEditorList` rev.4, default collapsed), внутри — detail-таблица
`[Данные | Значение | Действия]` со всеми данными `Card.workHistory`.
Витрина получает inline-CRUD достижений (↑ ↓ Trash2, persist-THEN-dispatch);
модалка `JobForm` оформляет параграфы kit `Paragraph`-классами.

## Контекст (факты, проверено 2026-10-13)

- Сегодня: `JobsList` — kit DataTable (колонки company/position/period/flags/
  actions, текстовые кнопки Edit/Delete, контролируемая сортировка+пагинация);
  в таблице НЕТ: location, companyUrl, description-параграфов, technologies.
- `WorkHistoryCard` (main page) показывает: title, company+url, period,
  periodBadge, location, achievements[], techStack.
- `JobForm` уже имеет add/remove/up/down параграфов (`<input>` + текстовые
  `↑↓×`); kit `Paragraph` поддерживает `asChild` (прецедент: error-span'ы).
- Kit `Table` — public API `columns/rows/getKey/caption/emptyState`,
  сам рендерит focusable scroll-region (axe A5 закрыт kit'ом).
- Skills rev.4 — эталон collapse: caption снаружи Card, strip = whole-body
  expand, `Minus` слева от h3, стабильный `contentId`, default collapsed.
- `UpdateJobDto extends Partial<CreateJobDto>` — `description` проходит
  `applyJobUpdate` штатно.

## Скоуп

Меняются: `src/features/AdminJobs/ui/JobsList/**` (rewrite),
`src/features/AdminJobs/ui/JobCard/**` (новый), `src/features/AdminJobs/ui/JobForm/**`
(bullet-editor restyle), локали `en.json`/`ru.json`.

НЕ меняются: `model/**` (slice/selectors/storage/seed), `AdminJobsPage`
(wiring onAddJob/onEditJob/onJobDeleted), `entities/Job`, kit-компоненты,
витрина `features/WorkHistory` (Design C), `storeReducers.ts`, feature barrel
(JobCard — внутренний компонент, не экспортируется).

## Требования (rev.3 — epic jobs-detail-table, закрыты; легаси-навигация)

> Критерии R-1..R-8 ниже исполнены 2026-10-14 (PR #225/#226) и сгорели
> вместе со своим TODO; секции сохранены как описание ЖИВОЙ витрины
> (карточки-записи), на которую надстраивается rev.4.

### R-1 — Компонент JobCard (ARCH-1)

- [x] Существует `ui/JobCard/` (`JobCard.tsx`, `JobCard.module.scss`,
      `JobCard.test.tsx`); импорт из `JobsList` — относительный sibling.
- [x] Kit `Card` `variant="default" size="default" hoverable={false}`;
      `.strip.strip` (даблинг класса, 0,2,0) — паритет Skills.
- [x] Collapse: default **collapsed**; caption СНАРУЖИ Card = компания;
      strip = whole-body expand `IconButton` `Plus` +
      `aria-expanded="true"` (quirk-паритет `SkillsEditorList.tsx:348`);
      `Minus` слева от h3 с `aria-expanded="false"` +
      `aria-controls={contentId}`; `contentId = job-card-content-${job.id}`.
- [x] Header: h3 компания + Badge current (accent) + Badge featured
      (outline); справа `Pencil` → `onEditJob(job)` и `Trash2` →
      `onDeleteJob(job.id)` (confirm-модалка уровня списка, R-5).
- [x] Тело (unmount при collapse) = kit `Table` с `caption`, `scope="col"`
      (kit), БЕЗ собственного scroll-контейнера.

### R-2 — Detail-таблица (все данные workHistory-карточки)

- [x] Колонки `[Данные | Значение | Действия]`: заголовки
      `adminJobsTableField` / `adminJobsTableValue` / `adminJobsTableActions`
      (два первых — новые ключи); колонка действий правый прижим
      (`.actions`, паттерн Skills).
- [x] Строки-скаляры (label → key): Должность `adminJobsTablePosition`,
      Период `adminJobsTablePeriod` (значение `job.period` как есть, A5),
      Локация `adminJobLocation`, URL `adminJobCompanyUrl`
      (kit `Link` external; строка рендерится ТОЛЬКО при наличии
      `companyUrl`), Технологии `adminJobTechnologies` (строка через запятую —
      вердикт исполнения WU-1, не чипы). Действие скалярной строки: `Pencil` → `onEditJob(job)`.
- [x] Строки-параграфы (по одному на каждый элемент
      `description[язык-интерфейса]`): значение — kit
      `Paragraph asChild size="xs" theme="primary" align="left"` на текст
      (классы `paragraph/xs/primary/left`); действия `↑ ↓ Trash2`.
- [x] Disabled: `↑` на первом параграфе, `↓` на последнем, `Trash2` при
      `description[lang].length <= 1` (паритет `JobForm` ×).
- [x] Пустой массив параграфов → строки-достижения отсутствуют (без
      заглушек); пустая строка URL отсутствует (honest data).

### R-3 — Inline-CRUD параграфов (persist-THEN-dispatch)

- [x] `moveBullet`/`removeBullet` в `JobCard`: снимок `selectAllJobs`
      (insertion-order, R-2 прошлой rev) → `applyJobUpdate(job, { id,
description })` → `persistJobs(next)` → `dispatch(updateJob({ id,
description }))`; period пересчитывается из тех же дат (без сдвига).
- [x] Persist-fail: тост `adminJobPersistError`, store не тронут.
- [x] Подтверждения на удаление параграфа НЕТ (паритет inline-× в `JobForm`).
- [x] RED-тест порядка: `persistJobs` вызван ДО `dispatch` и с массивом,
      где порядок параграфов изменён/удалён соответственно.

### R-4 — Сортировка списка (замена DataTable sort/page)

- [x] Page-level kit `Select` в шапке: label `adminJobsSort`; варианты
      `adminJobsSortRecent` (default — `selectSortedJobs`, date-desc),
      `adminJobsSortCompany` (alpha по company),
      `adminJobsSortPosition` (alpha по position[язык]).
- [x] Пагинация и `PageSizeGroup` удалены вместе с DataTable; карточки
      рендерятся все (для ≤15 записей это осознанный выбор).

### R-5 — Список JobsList (rewrite)

- [x] Шапка: h2 `adminJobs` + правый блок (Select сортировки + `IconButton`
      Plus → `onAddJob`) — паттерн `SkillsEditorList.tsx:232-238`.
- [x] Карточки в порядке текущей сортировки; `key = job.id`.
- [x] `EmptyState adminJobsEmpty` при пустом списке (паритет R-4 rev.2).
- [x] Confirm-modal удаления должности перенесён на Trash2 карточки:
      subtitle `adminJobConfirmDeleteName {{company}}`,
      `initialFocusRef` → «Отмена», persist-fail держит модалку открытой
      (все инварианты R-3 rev.2 сохранены, тесты переносятся).

### R-6 — Модалка JobForm: параграфы kit-оформлены

- [x] Строка параграфа: `<Paragraph asChild size="xs" theme="primary"
align="left">` на `<input>` — input несёт классы
      `paragraph/xs/primary/left` (путь asChild ПОДТВЕРЖДЁН: kit-контракт
      принимает single-element child, превью: 12px / `--color-text` / left;
      fallback-SCSS не понадобился; `.bulletInput` остался chrome-only,
      типографику владеет Paragraph).
- [x] Текстовые `↑↓×` → kit `IconButton` + lucide `ArrowUp/ArrowDown/X` +
      `Tooltip` (`showDelay={0}`); aria-label = `adminJobBulletUp` /
      `adminJobBulletDown` / `adminJobRemoveBullet` (ключи существуют).
- [x] Поведение add/remove/move, disabled-состояния и zod-валидация —
      без изменений; существующие буллет-тесты зелёные.

### R-7 — i18n

- [x] 8 новых ключей в ОБЕИХ локалей (flat, без точек):
      `adminJobsTableField`, `adminJobsTableValue`, `adminJobsSort`,
      `adminJobsSortRecent`, `adminJobsSortCompany`, `adminJobsSortPosition`,
      `adminJobCollapse` (`{{company}}`), `adminJobExpand` (`{{company}}`).
- [x] `locales-parity.test.ts` зелёный БЕЗ правки (список `adminKeys` —
      existence-гард, не exhaustive).

### R-8 — Гейты эпика

- [x] `npm run validate` зелёный (type-check + lint + lint:styles + тесты с
      coverage + public-api); запуск в CPU-окне <45%.
- [x] axe-app `/admin/jobs`: 0 регрессий (маршрут в PATHS, baseline без
      новых fingerprint-ключей).
- [x] Бандл-дельта worktree на merge-base ≤ капа 737280 (ожидание —
      отрицательная/нейтральная дельта: DataTable выпадает из витрины).
- [x] Превью light+dark: collapse/expand, ↑↓× в витрине, add/delete через
      модалку, сортировка Select.
- [x] Все критерии R-1..R-7 закрыты; [TODO.md](./TODO.md) выжжен.

## Требования rev.4 (epic job-field-edit, done 2026-10-14 — легаси-навигация)

Диагноз: scalar-строки detail-таблицы (R-2 rev.3) несут `Pencil`, который
открывает полную `JobForm` — misleading affordance (одна карточка = до 6
идентичных кнопок → одна модалка). Вердикт владельца 2026-10-14: полевая
модалка; инварианты R-3 (bullets persist-THEN-dispatch), R-5 (confirm
удаления), R-4 (сортировка) и Design C остаются фундаментом.

### R-1 (r4) — Общий lib-слой схем (условие D2)

- [x] Zod-срезы полей (position en+ru, даты period, location, companyUrl,
      technologies + их message-ключи) вынесены из `jobFormSchema` в
      переиспользуемый модуль; `jobFormSchema` пересобирается из срезов —
      существующие тесты `jobFormSchema.test` и `JobForm.test` зелёные БЕЗ
      правок (рефактор без поведенческого диффа).
- [x] `FieldEditForm` импортирует срезы ТОЛЬКО из этого модуля (нет второго
      источника min/max/сообщений).
- [x] Маппинг поле→label-ключ в одном месте: `position→adminJobsTablePosition`,
      `period→adminJobsTablePeriod`, `location→adminJobLocation`,
      `companyUrl→adminJobCompanyUrl`, `technologies→adminJobTechnologies`.

### R-2 (r4) — Компонент FieldEditForm (ARCH-1)

- [x] `ui/FieldEditForm/` (`FieldEditForm.tsx`, `.module.scss`, `.test.tsx`);
      проп `field: 'position' | 'period' | 'location' | 'companyUrl' |
'technologies'` + `job` + `onExitEdit`.
- [x] Инпуты по полям: position = `Input` en+ru; period = kit `DatePicker`
      ×2 + чекбокс «текущая» (end-инпут гасится при current — паритет
      JobForm через `setValue`); location = `Input`; companyUrl = `Input`;
      technologies = чип-редактор JobForm-паритета (add/remove).
- [x] RHF + per-field zod-схема из общего lib (R-1 r4); ошибки —
      `role="alert"`; Save disabled без `isDirty` (паритет JobForm).
- [x] Save: persist-THEN-dispatch ОДНОГО поля (D7): снапшот `selectAllJobs`
      → `applyJobUpdate(job, partial)` → `persistJobs(next)` →
      `dispatch(updateJob({ id, ...partial }))`; успех → тост
      `adminJobSaved` → закрытие; persist-fail → тост
      `adminJobPersistError`, модалка открыта, стор не тронут.

### R-3 (r4) — Wiring страницы

- [x] `JobCard`: `Pencil` скалярной строки → `onEditField(job, fieldKey)`;
      заголовочный `Pencil` → `onEditJob(job)` (без изменений).
- [x] `JobsList` пробрасывает `onEditField` (проп-паритет с `onEditJob`).
- [x] `AdminJobsPage`: state `{ job?, field? } | { job } | {} | null`; одна
      открытая модалка за раз (D8); контент: `FieldEditForm`
      (key=`${job.id}-${field}`) ИЛИ `JobForm` (key=`job.id` — Design C
      стейл-guard сохранён); title модалки: поле →
      `t('adminJobEditFieldTitle', { field: t(labelKey) })`, полная форма →
      `adminEditJob`/`adminAddJob` (прежние).

### R-4 (r4) — i18n

- [x] Новый flat-ключ `adminJobEditFieldTitle` в ОБЕИХ локалях: «Редактировать:
      {{field}}» / «Edit: {{field}}»; паритет-тест зелёный; захардкоженных
      строк нет.

### R-5 (r4) — Не регрессирует

- [x] Bullets ↑↓× в витрине и буллет-редактор полной формы — без изменений.
- [x] Create и полный edit записи — прежняя `JobForm` (key-parity).
- [x] Confirm-модалка удаления, сортировка, EmptyState — без изменений.

### R-6 (r4) — Гейты

- [x] `npm run validate` зелёный; `check:axe` 0 регрессий (light+dark,
      `/admin/jobs` в PATHS); `check:bundle` ≤ 737280; `check:public-api`
      37/37; `check:spec`.
- [x] Превью light+dark: каждый Pencil строки → СВОЯ модалка (5 полей),
      Save/Cancel/ESC, чипы technologies, период+current.
- [x] `AdminJobsPage.test`: пер-полевой prefill (в модалке поля — только его
      инпуты), заголовок «Редактировать: …», шапочный Pencil — полная
      форма; хелпер раскрывает карточку первой (`resume-jobs-detail-table`).

## Требования rev.5 (epic job-status-select, approved 2026-10-14)

Контекст: в `JobForm` два независимых чекбокса (`#job-form-current`,
`#job-form-featured`) управляют разными по уровню абстракции флагами —
сроком (A6) и меткой. Вердикт владельца 2026-10-14 — **вариант A**: один
селект, взаимоисключение в пределах записи. `FieldEditForm`, бейджи
`JobCard` и model-слой остаются фундаментом и не меняются.

### R-1 (r5) — Селект в JobForm (замена двух чекбоксов)

- [ ] kit `Select` `id="job-form-status"`, label `adminJobStatus`, три
      опции: `''` → `adminJobStatusNone`, `'current'` → `adminJobCurrent`,
      `'featured'` → `adminJobFeatured`; размещение — на месте бывшего
      current-чекбокса (сразу после блока дат, обёртка `.field` — паритет
      остальных Select'ов формы); оба чекбокса удалены; мёртвый
      `.checkRow` убрать из `JobForm.module.scss` (последние два
      использования — строки 350/447; `.checkRow` в `FieldEditForm.module.scss`
      — свой, не трогать).
- [ ] Пустая опция = ОБЫЧНАЯ option `value: ''` в `options` (НЕ
      `placeholder`-проп: placeholder семантически «ничего не выбрано», а
      пусто — валидное состояние). Kit поддерживает `value=""` —
      верифицировано по коду (`Select.tsx:76` рендерит option с пустым
      значением); React-`key=''` допустим.
- [ ] Маппинг при выборе: `''` → `{current:false, featured:false}`;
      `'current'` → `toggleCurrent(true)`-паритет (`current=true`,
      `endDate=''` + DatePicker disabled — A6); `'featured'` →
      `current=false, featured=true`, `endDate` не трогаем; все `setValue`
      — с `{shouldDirty: true}` (Save disabled без isDirty).
- [ ] Значение селекта — производное от булево (`values.current ?
'current' : values.featured ? 'featured' : ''`), строго
      контролируемый `value`/`onChange` (паттерн Select'ов формы,
      `JobForm.tsx:411-444`); форма хранит только boolean — дубля поля в
      RHF нет.

### R-2 (r5) — Prefill и submit-нормализация (вариант A закрыт на обоих путях)

- [ ] Правило отображения: `current && !featured` → `'current'`;
      `featured && !current` → `'featured'`; **оба true → `'current'`**
      (производное значение, приоритет функционального флага); иначе → `''`.
- [ ] **Submit-нормализация** (`handleSave`, `JobForm.tsx:110`): перед
      persist флаги берутся из производного значения селекта —
      `current = (status === 'current')`, `featured = (status ===
'featured')`. Без этого запись «оба» сохранялась бы как «оба» при
      нетронутом селекте (отображение врало бы). Гарантия: отображаемое =
      сохраняемому; «оба» после Save → только current.
- [ ] Zod-схема и тип формы **БЕЗ изменений**: `current`/`featured`
      остаются boolean в `jobFormSchema` (альтернатива «поле `status` в
      схеме» отклонена — лишний дифф); селект — UI-маппинг через
      `setValue`; `jobFormSchema.test` зелёный без правок.
- [ ] Create-дефолт: селект `''` = `{current:false, featured:false}` —
      паритет `emptyJobFormValues`.

### R-3 (r5) — Per-record семантика (несколько компаний)

- [ ] Селект действует в пределах одной записи: сохранение 2+ записей с
      `'current'` возможно, эксклюзивности между записями НЕТ (как
      сегодня); период «Present» у каждой current-записи.

### R-4 (r5) — FieldEditForm не трогаем

- [ ] Чекбокс «текущая» в поле Period (`FieldEditForm`) остаётся —
      field-scoped про даты, A6-паритет; в скоупе ревизии только `JobForm`.

### R-5 (r5) — i18n

- [ ] 2 новых flat-ключа в ОБЕИХ локалях: `adminJobStatus`
      («Статус записи» / «Record status»), `adminJobStatusNone`
      («Обычная запись» / «Standard entry»); `adminJobCurrent` /
      `adminJobFeatured` переиспользуются без изменений.
- [ ] `locales-parity.test.ts` зелёный БЕЗ правки; захардкоженных строк в
      компоненте нет.

### R-6 (r5) — Не регрессирует (инвентарь верифицирован по коду 2026-10-14)

- [ ] Бейджи `JobCard` (accent по `current`, outline по `featured`) — без
      изменений; «Present» в периоде, confirm-удаление, сортировка,
      инлайн-CRUD параграфов — без изменений.
- [ ] `FieldEditForm`/пер-филд модалки rev.4 и чекбокс Period — без
      изменений (R-4 r5): 3 теста `FieldEditForm.test` на
      `getByLabelText('adminJobCurrent')` (строки 113/180/226) зелёные
      БЕЗ правок.
- [ ] `locales-parity.test.ts` (adminKeys-гард), `AdminJobsPage.test`
      (0 упоминаний current/featured), `jobFormSchema.test`,
      `JobCard.test` — зелёные БЕЗ правок.
- [ ] **Паритет, который НЕ чиним:** дата окончания не восстанавливается
      после переключения `'current'` → (`'featured'`|`''`) — то же
      поведение, что у чекбокса (очистка в момент включения A6); не
      трактовать как регрессию.
- [ ] Ожидаемый red→green — ровно 3 теста `JobForm.test.tsx`: лейбл-список
      (:127, `getByLabelText('adminJobCurrent')`/`('adminJobFeatured')` →
      `adminJobStatus` + assert опций), A6-click (:164), A6-calendar
      (:180) — переписать на `fireEvent.change(select,
{target:{value:'current'}})`; тестов на `#job-form-current`/
      `#job-form-featured` id в репо НЕТ (проверено grep).

### R-7 (r5) — Гейты

- [ ] `npm run validate` зелёный (TDD: RED-тесты написаны ДО
      реализации; 3 переписываемых теста `JobForm.test` — ожидаемый
      red→green, R-6); `check:spec` (pass-set включает `approved`).
- [ ] `check:axe` 0 регрессий (light+dark, `/admin/jobs` в PATHS, baseline
      без изменений); бандл-дельта worktree ≤ капа 786432 (ожидание Δ 0 —
      kit Select уже в чанке формы); `check:public-api` 37/37.
- [ ] Превью light+dark: все 3 опции, A6-переходы туда-обратно, edit
      записей 4 типов (ни одного / current / featured / оба → показ
      `'current'`).

## Критерии приёмки (итог rev.5)

Пользователь в модалке добавления/редактирования записи видит ОДИН селект
«Статус записи» вместо двух чекбоксов: пусто = обычная запись (endDate
редактируем), «Всё ещё работаю здесь» = current (endDate очищен и
disabled), «Избранная запись» = featured (только метка). При открытии
существующей записи с обоими флагами селект показывает «Всё ещё работаю
здесь», и после Save запись становится только current. Несколько записей
одновременно в статусе current допустимы. Поле Period в пер-филд модалке,
бейджи карточек и весь CRUD-контракт rev.3/rev.4 не изменились;
`npm run validate`, axe и бандл-гейт зелёные.

## Критерии приёмки (итог rev.4, done 2026-10-14)

Пользователь на `/admin/jobs` видит карточки-записи (rev.3, без изменений);
`Pencil` строки «Период» открывает модалку ТОЛЬКО с датами и чекбоксом
«текущая», «Локации» — только с локацией, «Технологии» — с чип-редактором;
заголовок модалки называет поле («Редактировать: …»); Save правит ровно
одно поле (persist-THEN-dispatch, тост `adminJobSaved`), ошибка storage
держит модалку открытой; заголовочный `Pencil` карточки по-прежнему
открывает полную форму на всю запись; bullets ↑↓×, confirm удаления и
сортировка не изменились; `npm run validate` и axe зелёные.
