---
status: draft
spec: SPEC.md
---

# TODO — shared/ui/DataTable

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] Предусловие: `shared/ui/Table` влит в `dev` (зависимость зафиксирована в «Контексте» SPEC); ветка `feat/kit-datatable` от свежего `dev`.
- [ ] Фаза B (вручную): компонентная четвёрка по секции «Планируемые файлы» в SPEC — генератора для `shared` нет.
- [ ] WU-1 (TDD): сначала `DataTable.test.tsx` — инверсия dir при клике сортировки, несортируемая колонка остаётся обычным текстом даже с `onSortChange`, нет `onSortChange` → нет кнопок, состояния `aria-sort`, компараторы `localeCompare` + `sortValue`, empty→`emptyState`, слот пагинации; затем `DataTable.tsx` (`DataTableColumn<T>` с `sortable?`/`sortValue?`, оборачивает Table) + `DataTable.module.scss` + `index.ts`.
- [ ] WU-1 сторисы: сортировка вкл/выкл, мок пагинации, пусто, загрузка, обе темы, 390px с `hideOnMobile`; `npm run validate` (CPU <45%, лог → файл, проверить `$?`, удалить лог) + storybook-test.
- [ ] WU-2: запустить `scripts/axe-stories-check.mjs` на сторисах DataTable (механика из Table WU-2) → 0 новых; если скрипт Table ещё не влит, сначала использовать разовый axe-cdn паттерн с Playwright.
- [ ] WU-3 (i18n): sr-only метки направления сортировки — решить в WU-1, достаточно ли `aria-sort` (тогда записать сюда «внутренних строк нет» и удалить этот пункт); ключи пилота: переиспользовать `skillsListEmpty`, добавить один ключ CTA в `en.json` + `ru.json` с тестом паритета.
- [ ] WU-4 (пилот, OPEN-3): `SkillsEditorList` div-строки → DataTable — колонка действий без `sortable`, сортировка по имени/категории, ячейки по Table A6 (нет заголовков в td), пусто → kit-состояние; последовательность: пилот Pagination вливается первым и попадает в слот `pagination` (или остаётся вне этого PR по вердикту владельца).
- [ ] WU-4 гейты: `npm run validate`; axe `/admin/skills` 0 новых; скриншот построчного визуального сравнения в PR; `check:bundle` с worktree-дельтой относительно merge-base.
- [ ] WU-5: запись в `wiki/ui-kit/components-list.md`; dual-write gotcha в vault `memory.md` + AGENTS.md; `check:public-api` зелёный.
- [ ] Git flow: DRAFT PR в начале → `gh pr ready` при зелёных проверках → squash merge + удаление ветки только после одобрения владельца.
