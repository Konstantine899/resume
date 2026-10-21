---
status: done
epic: mywork-metrics-bullet-rows
created: '2026-10-21'
verified: '2026-10-21'
---

# SPEC — features/AdminMyWork (mywork-metrics-bullet-rows)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Предыдущая пара (эпик `mywork-field-image-fileupload`, issue #273, done, 2026-10-17) перезаписана — история в git (`git log -- src/features/AdminMyWork/spec/`).
> **Режим исполнения: AUTO** (директива владельца).

## Контекст и цель

Директива владельца «выполни средние» (2026-10-21), задача A из трёх: метрики `ProjectForm` перевести на bullet-строки по конвенции `JobForm`.

Сейчас метрики — это kit `Textarea` в `ui/ProjectForm/ProjectForm.tsx` (поле `metrics`), где одна метрика = одна строка (`splitMetricLines` в `ui/ProjectForm/lib/projectFormSchema.ts`). Это осознанное решение прошлого эпика, зафиксированное в SPEC («метрики = Textarea осознанно, bullet-строки → отдельный эпик») — эпик настал.

Эталон-конвенция: `features/AdminJobs/ui/JobForm/JobForm.tsx` — bullet-строки через kit `Paragraph asChild` (обёртка инпута) + kit `IconButton` (ArrowUp/ArrowDown/X, outline sm) в kit `Tooltip`, кнопка добавления; паритетные решения — `features/AdminJobs/ui/JobCard/` (инлайн-CRUD ↑↓Trash2).

## Требования

### R-1 Bullet-строки вместо Textarea (паритет JobForm)

- [ ] Kit `Textarea` метрик из `ProjectForm.tsx` удалена (прежний блок `styles.field` с label `projectFieldMetrics`).
- [ ] Вместо неё блок `data-testid="project-metrics"`: `Heading level={3}` `projectFieldMetrics`, по одной строке на метрику — kit `Paragraph asChild` (size xs / theme primary / align left) вокруг `input[type="text"]` (`maxLength=40`, `aria-label` = `projectFieldMetrics-<N>`), kit `IconButton` outline/sm в kit `Tooltip` (↑ ArrowUp, ↓ ArrowDown, X), кнопка `projectMetricAdd` (outline, sm).
- [ ] Рендер строк: edit — по строке на каждую метрику из `defaultValues` (значения видны в инпутах); create — ровно одна пустая строка.
- [ ] Матрица disabled (паритет JobForm): ↑ disabled на первой строке, ↓ disabled на последней, X disabled при одной строке.

### R-2 add / remove / move

- [ ] `projectMetricAdd` добавляет пустую строку в конец — `setValue('metrics', …, { shouldDirty: true })`.
- [ ] X удаляет свою строку; последняя строка не удалима (X disabled).
- [ ] ↑/↓ переставляют строку на ±1; на границах списка кнопка disabled.
- [ ] Критерий: edit с метриками ['A','B'] → клик ↓ по первой → в инпутах порядок ['B','A']; обратный ↑ возвращает ['A','B'].

### R-3 Контракт не меняется (entity untouched; вход формы = string[])

- [ ] Вход формы `ProjectFormValues.metrics`: `string[]` (был склеенный через `\n` строковый блок) — `z.array(z.string())` + transform: trim + выброс пустых строк (логика `splitMetricLines` сохранена: одна метрика = одна строка, пустая строка не метрика) + пусто → `undefined` → `.pipe(ProjectFormDataSchema.shape.metrics)`.
- [ ] `entities/Project` (схема `metrics: z.array(z.string().max(40)).optional()`, типы) без изменений; выход формы — прежний `string[] | undefined`.
- [ ] Per-field модалка `metric-N` (`ui/FieldEditForm`, `ui/ProjectForm/lib/fieldSchemas.ts`) не тронута и работает — её тесты зелёные без правок.
- [ ] Строка >40 символов → один `role="alert"` `projectMetricInvalid` (block-level, под списком строк — прежнее поведение).

### R-4 Save / pristine-паритет

- [ ] Save disabled пока pristine — add/remove/move ставят `shouldDirty: true`.
- [ ] §3-конвейер без изменений: persist → dispatch → toast → exit; пустые строки отбрасываются трансформом → в записи `metrics: undefined`.
- [ ] kit (`src/shared/ui/**`) не изменён; стили только в `ProjectForm.module.scss` (`.metricBlock` / `.metricRow` / `.metricInput`, геометрия `.bulletBlock` / `.bulletRow` / `.bulletInput` JobForm).

### R-5 i18n

- [ ] 4 новых ключа en+ru: `projectMetricAdd`, `projectMetricUp`, `projectMetricDown`, `projectMetricRemove` (семья `projectMetric*`); `projectFieldMetrics` / `projectMetricInvalid` переиспользуются.
- [ ] `locales-parity.test` + `t-key-existence.test` зелёные (обе локали, значения непустые).

### R-6 Пара spec

- [ ] `spec/SPEC.md` + `spec/TODO.md` перезаписаны эпиком `mywork-metrics-bullet-rows`.

## Решения / Отклонения

- **Вход формы стал `string[]`** — bullet-строки не могут жить в склеенной строке (порядок и пустые строки имели бы два источника истины). `.pipe()` к `ProjectFormDataSchema.shape.metrics` сохранён, поэтому выход/контракт сущности идентичен. Альтернатива «хранить строку, разбирать по строкам UI» отклонена.
- **Ошибки остаются block-level** (один alert `projectMetricInvalid` под списком), а не per-row как в JobForm: схема метрик не несёт per-item i18n-ключей (сообщение зода ≠ ключ, i18n-first), а `maxLength=40` закрывает ввод длинных строк на уровне UI. Per-row alert'ы дали бы два `role="alert"` на одну ошибку.
- **Create-старт = одна пустая строка** (паритет JobForm `['']`): «ноль строк + голая кнопка Add» — худший первый опыт.
- **`FieldEditForm` / `ProjectCard` не трогаем** — per-field `metric-N` и инлайн-CRUD уже работают с массивом.

## Известные ограничения (осознанные)

- Перестановка меняет DOM-порядок строк (ключи по индексу) — фокус следует за браузером по порядку рендера, как в JobForm.
- Подпись строки — `aria-label` вида `Metrics-<N>` (перевод + номер), паритет `adminJobDescriptionEn-<N>` JobForm.

## Гейты (2026-10-21, ВЫПОЛНЕНО)

- `npx vitest run src/features/AdminMyWork src/pages/Admin` — 18 файлов / 221 тест зелёный (6 новых: RED 6 → GREEN 221/221).
- `npx vitest run src/shared/lib/i18n` — 13/13 (locale parity + t-key-existence с 4 новыми ключами).
- `npm run validate` (type-check + lint + lint:styles + unit + coverage + check:public-api) — зелёный: 240 файлов / **4002 теста**, public-api 37/37.
- `npx prettier --check` (изменённые файлы) и `npm run check:spec` (16 spec ready) — зелёные.
- `npm run build` + `npm run check:bundle` — total **859.0 KiB** < 875.3 KiB (кап `total.maxSize` 896256 НЕ поднимался).
