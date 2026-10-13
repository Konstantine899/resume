---
status: approved
epic: jobs-detail-table
created: '2026-10-13'
verified: ''
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

## Требования

### R-1 — Компонент JobCard (ARCH-1)

- [ ] Существует `ui/JobCard/` (`JobCard.tsx`, `JobCard.module.scss`,
      `JobCard.test.tsx`); импорт из `JobsList` — относительный sibling.
- [ ] Kit `Card` `variant="default" size="default" hoverable={false}`;
      `.strip.strip` (даблинг класса, 0,2,0) — паритет Skills.
- [ ] Collapse: default **collapsed**; caption СНАРУЖИ Card = компания;
      strip = whole-body expand `IconButton` `Plus` +
      `aria-expanded="true"` (quirk-паритет `SkillsEditorList.tsx:348`);
      `Minus` слева от h3 с `aria-expanded="false"` +
      `aria-controls={contentId}`; `contentId = job-card-content-${job.id}`.
- [ ] Header: h3 компания + Badge current (accent) + Badge featured
      (outline); справа `Pencil` → `onEditJob(job)` и `Trash2` →
      `onDeleteJob(job.id)` (confirm-модалка уровня списка, R-5).
- [ ] Тело (unmount при collapse) = kit `Table` с `caption`, `scope="col"`
      (kit), БЕЗ собственного scroll-контейнера.

### R-2 — Detail-таблица (все данные workHistory-карточки)

- [ ] Колонки `[Данные | Значение | Действия]`: заголовки
      `adminJobsTableField` / `adminJobsTableValue` / `adminJobsTableActions`
      (два первых — новые ключи); колонка действий правый прижим
      (`.actions`, паттерн Skills).
- [ ] Строки-скаляры (label → key): Должность `adminJobsTablePosition`,
      Период `adminJobsTablePeriod` (значение `job.period` как есть, A5),
      Локация `adminJobLocation`, URL `adminJobCompanyUrl`
      (kit `Link` external; строка рендерится ТОЛЬКО при наличии
      `companyUrl`), Технологии `adminJobTechnologies` (чипы/Badge-список).
      Действие скалярной строки: `Pencil` → `onEditJob(job)`.
- [ ] Строки-параграфы (по одному на каждый элемент
      `description[язык-интерфейса]`): значение — kit
      `Paragraph asChild size="xs" theme="primary" align="left"` на текст
      (классы `paragraph/xs/primary/left`); действия `↑ ↓ Trash2`.
- [ ] Disabled: `↑` на первом параграфе, `↓` на последнем, `Trash2` при
      `description[lang].length <= 1` (паритет `JobForm` ×).
- [ ] Пустой массив параграфов → строки-достижения отсутствуют (без
      заглушек); пустая строка URL отсутствует (honest data).

### R-3 — Inline-CRUD параграфов (persist-THEN-dispatch)

- [ ] `moveBullet`/`removeBullet` в `JobCard`: снимок `selectAllJobs`
      (insertion-order, R-2 прошлой rev) → `applyJobUpdate(job, { id,
    description })` → `persistJobs(next)` → `dispatch(updateJob({ id,
    description }))`; period пересчитывается из тех же дат (без сдвига).
- [ ] Persist-fail: тост `adminJobPersistError`, store не тронут.
- [ ] Подтверждения на удаление параграфа НЕТ (паритет inline-× в `JobForm`).
- [ ] RED-тест порядка: `persistJobs` вызван ДО `dispatch` и с массивом,
      где порядок параграфов изменён/удалён соответственно.

### R-4 — Сортировка списка (замена DataTable sort/page)

- [ ] Page-level kit `Select` в шапке: label `adminJobsSort`; варианты
      `adminJobsSortRecent` (default — `selectSortedJobs`, date-desc),
      `adminJobsSortCompany` (alpha по company),
      `adminJobsSortPosition` (alpha по position[язык]).
- [ ] Пагинация и `PageSizeGroup` удалены вместе с DataTable; карточки
      рендерятся все (для ≤15 записей это осознанный выбор).

### R-5 — Список JobsList (rewrite)

- [ ] Шапка: h2 `adminJobs` + правый блок (Select сортировки + `IconButton`
      Plus → `onAddJob`) — паттерн `SkillsEditorList.tsx:232-238`.
- [ ] Карточки в порядке текущей сортировки; `key = job.id`.
- [ ] `EmptyState adminJobsEmpty` при пустом списке (паритет R-4 rev.2).
- [ ] Confirm-modal удаления должности перенесён на Trash2 карточки:
      subtitle `adminJobConfirmDeleteName {{company}}`,
      `initialFocusRef` → «Отмена», persist-fail держит модалку открытой
      (все инварианты R-3 rev.2 сохранены, тесты переносятся).

### R-6 — Модалка JobForm: параграфы kit-оформлены

- [ ] Строка параграфа: `<Paragraph asChild size="xs" theme="primary"
    align="left">` на `<input>` — input несёт классы
      `paragraph/xs/primary/left` (fallback при конфликте kit-контракта:
      зеркальные декларации в `JobForm.module.scss` — решить по факту,
      зафиксировать здесь).
- [ ] Текстовые `↑↓×` → kit `IconButton` + lucide `ArrowUp/ArrowDown/X` +
      `Tooltip` (`showDelay={0}`); aria-label = `adminJobBulletUp` /
      `adminJobBulletDown` / `adminJobRemoveBullet` (ключи существуют).
- [ ] Поведение add/remove/move, disabled-состояния и zod-валидация —
      без изменений; существующие буллет-тесты зелёные.

### R-7 — i18n

- [ ] 8 новых ключей в ОБЕИХ локалей (flat, без точек):
      `adminJobsTableField`, `adminJobsTableValue`, `adminJobsSort`,
      `adminJobsSortRecent`, `adminJobsSortCompany`, `adminJobsSortPosition`,
      `adminJobCollapse` (`{{company}}`), `adminJobExpand` (`{{company}}`).
- [ ] `locales-parity.test.ts` зелёный БЕЗ правки (список `adminKeys` —
      existence-гард, не exhaustive).

### R-8 — Гейты эпика

- [ ] `npm run validate` зелёный (type-check + lint + lint:styles + тесты с
      coverage + public-api); запуск в CPU-окне <45%.
- [ ] axe-app `/admin/jobs`: 0 регрессий (маршрут в PATHS, baseline без
      новых fingerprint-ключей).
- [ ] Бандл-дельта worktree на merge-base ≤ капа 737280 (ожидание —
      отрицательная/нейтральная дельта: DataTable выпадает из витрины).
- [ ] Превью light+dark: collapse/expand, ↑↓× в витрине, add/delete через
      модалку, сортировка Select.
- [ ] Все критерии R-1..R-7 закрыты; [TODO.md](./TODO.md) выжжен.

## Критерии приёмки (итог)

Пользователь на `/admin/jobs` видит список свёрнутых по умолчанию карточек
(компания-подпись снаружи, strip с Plus); раскрытие показывает detail-таблицу
со всеми данными должности (включая локацию, ссылку, технологии и
достижения, которых не было в старой таблице); Pencil в строке/шапке
открывает модальную форму; Trash2 в строке параграфа удаляет его
(persist-THEN-dispatch), ↑↓ переставляют; Trash2 в шапке карточки
удаляет должность через confirm-модалку с названием компании и фокусом на
«Отмена»; модальная форма редактирует параграфы kit-оформленными строками
с иконочными кнопками; Select в шапке сортирует список; пустой список —
kit EmptyState; `npm run validate` и axe зелёные.
