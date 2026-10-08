---
status: draft
spec: SPEC.md
---

# TODO — shared/ui/Pagination

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] Фаза B (вручную): компонентная четвёрка по секции «Планируемые файлы» в SPEC — генератора для `shared` нет.
- [ ] WU-1 (TDD): сначала `Pagination.test.tsx` — `totalPages<=1` → null, крайние страницы отключены, окно соседей (5/10 → `1 … 4 5 6 … 10`), клик → `onPageChange(n)`, `aria-current="page"`; затем `Pagination.tsx` + `Pagination.module.scss` + `index.ts` с переиспользованием kit `Button`.
- [ ] WU-1 сторисы: 1 страница / много страниц / длинные названия на локалях, обе темы; `npm run validate` (CPU <45%, лог → файл, проверить `$?`, удалить лог) + storybook-test.
- [ ] WU-2 (i18n): ключи `pagination.nav` + aria-labels prev/next в `en.json` + `ru.json`, тест паритета; запись в `wiki/ui-kit/components-list.md`; dual-write gotcha в vault `memory.md` + AGENTS.md.
- [ ] WU-3 (пилот, OPEN-1): разбить админ-список Skills на страницы client-side срезом — контейнер владеет состоянием `page` + clamp к `totalPages` после удаления/фильтрации (план A2/§7); НЕТ DataTable в этом PR. Если владелец выберет вариант последовательности (б) из плана, удалить этот пункт и встроить пилот в PR DataTable.
- [ ] WU-3 гейты: `npm run validate`; axe `/admin/skills` 0 новых; `check:bundle` с worktree-дельтой относительно merge-base (лимит 737280 B).
- [ ] Git flow: ветка `feat/kit-pagination` от `dev` → DRAFT PR открывается в начале → `gh pr ready` при зелёных проверках → squash merge + удаление ветки только после одобрения владельца.
