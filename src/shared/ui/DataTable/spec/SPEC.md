---
status: approved
epic:
issue:
created: '2026-10-09'
verified: '2026-10-09'
---

# SPEC — shared/ui/DataTable

> Единственная истина для этого компонента (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> `approved` = вердикт владельца 2026-10-09 (путь «DataTable со встроенной пагинацией+размером»), vault `wiki/plan/plan_kit_datatable.md` rev.5 (A5-ревизия). Фаза A создана вручную — слой `shared` генератором не покрывается.
> **rev.6 (2026-10-10): WU-5 «Сортировка»** — вердикт владельца 2026-10-10: OPEN-1 = контролируемая сортировка; OPEN-2 `sortValue` = да; OPEN-3 пилот SkillsList = да (отдельным шагом — после мержа PR #197); OPEN-5 плоские строки = да. Статус снова `approved` (допуск на WU-5), `verified` сверяется заново по новым критериям.

## Цель

Готовая таблица «в коробке»: семантическая разметка kit `Table` + **встроенная** пагинация kit `Pagination` + **встроенная** группа размера kit `PageSizeGroup`. Потребитель (админ-листы Skills/Jobs/Projects) передаёт полный массив строк и контролирует `page`/`pageSize` — вёрстка контролов и окно строк не дублируются в каждой фиче.

## Контекст

- Слой: `shared` (FSD); зависимости: kit `Table` (PR #191), kit `Pagination`, kit `PageSizeGroup` (PR #195), — все компомпоненты одного слоя, импорт через per-component `index.ts` (корневого барреля `src/shared/ui/index.ts` НЕТ).
- **`Table` почти не трогается** — его контракт «никогда не рендерит пагинацию» и «никакого поведения сортировки» (SPEC Table, план A2) остаётся в силе; DataTable — слой ПОВЕРХ. Исключение (WU-5): в `Column` добавляется **одно разметочное** поле `ariaSort?: 'ascending' | 'descending' | 'none'` — pass-through атрибута `aria-sort` на `<th>` (специфика APG требует его на `<th>`, DataTable до `<th>` не дорисовывает). Логика «какая колонка/направление» живёт в DataTable; Table только печатает атрибут — поведенческий контракт Table не нарушен, SPEC Table дополняется этим же пунктом.
- Состояние снаружи (план A2, rev.5): `page`/`pageSize`/колбэки — пропсы контролируемого компонента; clamp и окно — render-derivation (`safePage`, `effectivePageSize`), никакого setState-in-effect (react-hooks v7); готовит page⇄URL.
- Правила показа контролов — директива владельца 2026-10-09 («не должны исчезать», зеркало MyWork): при **непустом** списке (`rows.length > 0`), включая одну страницу (kit Pagination рендерит `‹ 1 ›`); пустой список → `emptyState`, без контролов.
- Раскладка — зеркало MyWork (утверждено владельцем 2026-10-09, план rev.5 OPEN-6): группа размера — **над** таблицей, прижата вправо; навигация — **под** таблицей, по центру.
- Скролл на смену страницы — НЕ в kit (решение A10): свойство витрины/фичи, не таблицы.

## API

```ts
export type SortDirection = 'asc' | 'desc';

/** Controlled sort descriptor — `null` = исходный порядок строк. */
export interface SortState {
  key: string; // column.key
  direction: SortDirection;
}

/** Table column + sorting metadata (WU-5). */
export interface DataTableColumn<T> extends Column<T> {
  /** Renders the header as a sort toggle button; omittable per column. */
  sortable?: boolean;
  /**
   * Comparator source for non-string values (dates/numbers). Without it the
   * comparator falls back to `String(row[key])` + `localeCompare` (plan A3).
   */
  sortValue?: (row: T) => string | number;
}

export interface DataTableProps<T> extends Omit<TableProps<T>, 'emptyState' | 'columns'> {
  columns: DataTableColumn<T>[];
  /** Pass-through slot of Table: rendered instead of the body when `rows` is empty. */
  emptyState?: ReactNode;
  /** Controlled 1-based page index. */
  page: number;
  /** Controlled window size. Clamped to `>= 1` at render time. */
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Sizes for the kit PageSizeGroup (e.g. `[5, 10, 20]`). Group renders only when BOTH this and `onPageSizeChange` are given. */
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  /** Controlled sort (OPEN-1): state lives outside, ready for sort⇄URL. */
  sort?: SortState | null;
  /** Called with the next cycle step — see «Цикл сортировки» below. */
  onSortChange?: (next: SortState | null) => void;
}
```

## Критерии приёмки

- [x] Окно строк: `page=1, pageSize=5` при 7 строках → строки 1–5 видны, 6–7 нет; `page=2` → 6–7 видны, 1–5 нет.
- [x] Clamp: `page=99` → рендерится последняя страница (строки 6–7), без крашей; навигация отдаёт `onPageChange` в границах.
- [x] `rows.length > 0` при `totalPages=1` → **оба** контрола видны (группа размера при заданных options; навигация — ряд «1») — директива «не должны исчезать».
- [x] `rows=[]` → рендерится `emptyState` (pass-through), оба контрола отсутствуют.
- [x] `pageSizeOptions` **и** `onPageSizeChange` заданы → kit `PageSizeGroup` над таблицей справа; клик → `onPageSizeChange(size)`.
- [x] `pageSizeOptions` без `onPageSizeChange` (или без options) → группа не рендерит; навигация при этом работает.
- [x] Клик по номеру/стрелке навигации → `onPageChange(nextPage)`.
- [x] `caption` pass-through: `getByRole('table', { name })` находит таблицу; `loading` pass-through: `aria-busy="true"` и скелетоны (поведение Table).
- [x] Порядок в DOM: группа размера → таблица → навигация (compareDocumentPosition).
- [x] (Примечание к гейтам) `check:axe:stories` сегодня красный по advisory-правилу `region` на 26+ сканах СУЩЕСТВУЮЩИХ kit-компонентов (Card/Badge/Paragraph/Heading, div-корни); скрипт не CI-wired. DataTable/PageSizeGroup добавляют тот же класс — это не регрессия; репо-уровневый фикс (SHELL_RULES или landmarks у хостов) отдельной задачей.
- [x] `effectivePageSize` = `max(1, trunc(pageSize) || 1)` — защита от 0/отрицательных значений без крашей.
- [x] Сторисы: Default (page 1), SecondPage, WithSizeGroup, Empty, Loading; обе темы; storybook-test 8/8 зелёные (включая PageSizeGroup).
- [x] `npm run validate` (3221/3221) + `check:public-api` (32/32) зелёные; маркеры `DataTable`/`PageSizeGroup` отсутствуют во всех чанках витрины (нет потребителей в app); `check:bundle` 695.8 < 720 KiB; `check:axe` 0 регрессий (4 known).

### WU-5 — Сортировка (рев.6, вердикт владельца 2026-10-10)

**Цикл сортировки** (переходы по клику на sortable-заголовке):

```
null --клик--> asc --клик--> desc --клик--> null
(для ДРУГОГО ключа: всегда asc)
```

- [ ] `sortable`-колонка рендерит `<button>` внутри `<th>`; не-sortable — голый текст (кнопок нет).
- [ ] Клик → `onSortChange` со следующим шагом цикла: `null→asc`, `asc→desc`, `desc→null`; другой ключ → всегда `asc`.
- [ ] Контролируемость (OPEN-1): клик НЕ мутирует `rows` и НЕ меняет отрисовку без смены пропса `sort` — рендер следует только за `sort`.
- [ ] Сортировка применяется ДО пагинационного окна: `sort` + `page=2` → окно берётся из отсортированного массива.
- [ ] Строки: `localeCompare` по `String(row[key])` без `sortValue` (план A3).
- [ ] `sortValue` (OPEN-2): колонка с `sortValue` сравнивается по его значению — числа/даты сортируются численно (`10 < 9` как числа, не как строки).
- [ ] `aria-sort` на `<th>`: `ascending`/`descending` по активной колонке, у остальных — атрибут отсутствует (паттерн APG).
- [ ] `sort`-состояние НЕ трогает `pageSize`: смена сортировки не сбрасывает страницу (страницу сбрасывает контейнер, если хочет — вне kit).
- [ ] Пустой `rows`/`loading` — сортировка не интерферирует (emptyState/скелетоны как раньше).
- [ ] Новые i18n-строки НЕ добавляются: доступное имя кнопки = `header` колонки, направление несёт `aria-sort` (kit не хранит строк).

## Планируемые файлы

<!-- Фаза B для `shared` выполняется вручную. -->

- `index.ts`
- `ui/DataTable/DataTable.tsx`
- `ui/DataTable/DataTable.module.scss`
- `ui/DataTable/DataTable.test.tsx`
- `ui/DataTable/DataTable.stories.tsx`
- `model/types.ts` (flat — convention `shared/**`)
- `spec/SPEC.md`, `spec/TODO.md` (созданы вручную до кода)

## Что не входит

- ~~Сортировка (`DataTableColumn`, `aria-sort`)~~ — **перенесено в API, WU-5 (рев.6)**; оставалось из MVP-среза rev.5.
- Kit-стиль `emptyState` (заголовок + CTA, план `plan_kit_empty_state.md`) — пока pass-through слота Table.
- Миграция `SkillsList`/`MyWork` на DataTable/PageSizeGroup — пилоты отдельными шагами (план rev.5, WU-5; пилот SkillsList ждёт мержа PR #197 — оба правят `SkillsEditorList.tsx`).
- Скролл-контроль на смену страницы — контейнер/фича (решение A10).
- Выбор строк (multi-select) — OPEN-4: нет в этом плане.
- Мульти-сортировка, сортировка на сервере — нет: A2/A3 фиксируют клиентскую одиночную сортировку.

## Риски

- Расхождение визуала с MyWork (инлайн-контролы) до миграции фичи — допустимо; раскладка скопирована дословно, риски низкие.
- Bundle: три kit-компонента в series; на MVP-срезе потребителей в app нет → main-чанк витрины не растёт (маркер-тест в WU-4).
