---
status: draft
spec: SPEC.md
---

# TODO — shared/ui/Table

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] Фаза B (вручную): создать компонентную четвёрку по секции «Планируемые файлы» в SPEC — `npm run generate:slice` не покрывает `shared` (отклонение зафиксировано в шапке SPEC).
- [ ] WU-1a: миксин `.visually-hidden` в `src/shared/styles/mixins/` (сегодня его нет) — нужен для caption до того, как будет отрендерена первая таблица.
- [ ] WU-1b (TDD): сначала `Table.test.tsx` — columnheaders, именованная таблица, `aria-busy`, empty→`emptyState`, рендер по умолчанию, модификаторы `align`, отсутствие заголовков в td, фокусируемая область прокрутки; затем `Table.tsx` + `Table.module.scss` + `index.ts` (токены для границ/hover/зебры, обе темы; область прокрутки вне таблицы).
- [ ] WU-1c: `Table.stories.tsx` — пять фикстур с реальными ячейками (иконка по `SkillItem.tsx:66-74`, бейдж по `STATUS_VARIANTS`, двухстрочная по `JobsList.tsx:101-103`, ссылка, действия) + темы/загрузка/пусто/390px; `npm run validate` (CPU <45%, лог → файл, проверить `$?`, удалить лог) + storybook-test зелёный.
- [ ] WU-2: `scripts/axe-stories-check.mjs` — Playwright + axe-core с CDN (gotcha `resume-axe-cdn`), сканирует сторисы в обычном и 390px вьюпортах; добавить `check:axe:stories` в `package.json` (локальный гейт, не CI); запуск → 0 новых нарушений.
- [ ] WU-3: запись в `wiki/ui-kit/components-list.md`; dual-write любого релевантного для агента gotcha в vault `memory.md` + AGENTS.md.
- [ ] Гейт: `npm run build` + `check:bundle` (лимит 737280 B) — дельта меряется относительно merge-base через `git worktree`; убедиться, что маркера Table нет в main-чанке витрины.
- [ ] Гейт: `check:axe` на приложении — 0 регрессий относительно базовой линии (4 известных).
- [ ] Git flow: ветка `feat/kit-table` от `dev` → DRAFT PR открывается в начале → `gh pr ready` при зелёных проверках → squash merge + удаление ветки только после одобрения владельца.
