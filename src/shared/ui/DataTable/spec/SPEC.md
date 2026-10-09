---
status: done
epic:
issue:
created: '2026-10-09'
verified: '2026-10-09'
---

# SPEC — shared/ui/DataTable

> Единственная истина для этого компонента (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> `approved` = вердикт владельца 2026-10-09 (путь «DataTable со встроенной пагинацией+размером»), vault `wiki/plan/plan_kit_datatable.md` rev.5 (A5-ревизия). Фаза A создана вручную — слой `shared` генератором не покрывается.

## Цель

Готовая таблица «в коробке»: семантическая разметка kit `Table` + **встроенная** пагинация kit `Pagination` + **встроенная** группа размера kit `PageSizeGroup`. Потребитель (админ-листы Skills/Jobs/Projects) передаёт полный массив строк и контролирует `page`/`pageSize` — вёрстка контролов и окно строк не дублируются в каждой фиче.

## Контекст

- Слой: `shared` (FSD); зависимости: kit `Table` (PR #191), kit `Pagination`, kit `PageSizeGroup` (PR #195), — все компоненты одного слоя, импорт через per-component `index.ts` (корневого барреля `src/shared/ui/index.ts` НЕТ).
- **`Table` не трогается** — его контракт «никогда не рендерит пагинацию» (SPEC Table, план A2) остаётся в силе; DataTable — слой ПОВЕРХ.
- Состояние снаружи (план A2, rev.5): `page`/`pageSize`/колбэки — пропсы контролируемого компонента; clamp и окно — render-derivation (`safePage`, `effectivePageSize`), никакого setState-in-effect (react-hooks v7); готовит page⇄URL.
- Правила показа контролов — директива владельца 2026-10-09 («не должны исчезать», зеркало MyWork): при **непустом** списке (`rows.length > 0`), включая одну страницу (kit Pagination рендерит `‹ 1 ›`); пустой список → `emptyState`, без контролов.
- Раскладка — зеркало MyWork (утверждено владельцем 2026-10-09, план rev.5 OPEN-6): группа размера — **над** таблицей, прижата вправо; навигация — **под** таблицей, по центру.
- Скролл на смену страницы — НЕ в kit (решение A10): свойство витрины/фичи, не таблицы.

## API

```ts
export interface DataTableProps<T> extends Omit<TableProps<T>, 'emptyState'> {
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

- Сортировка (`DataTableColumn`, `aria-sort`) — следующий WU плана (rev.5, A9; эскиз API rev.3).
- Kit-стиль `emptyState` (заголовок + CTA, план `plan_kit_empty_state.md`) — пока pass-through слота Table.
- Миграция `SkillsList`/`MyWork` на DataTable/PageSizeGroup — пилоты отдельными шагами (план rev.5, WU-5).
- Скролл-контроль на смену страницы — контейнер/фича (решение A10).
- Выбор строк (multi-select) — OPEN-4: нет в этом плане.

## Риски

- Расхождение визуала с MyWork (инлайн-контролы) до миграции фичи — допустимо; раскладка скопирована дословно, риски низкие.
- Bundle: три kit-компонента в series; на MVP-срезе потребителей в app нет → main-чанк витрины не растёт (маркер-тест в WU-4).
