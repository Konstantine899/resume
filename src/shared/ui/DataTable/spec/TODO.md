---
status: draft
spec: SPEC.md
---

# TODO — shared/ui/DataTable

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [x] Фаза A: `spec/SPEC.md` + `spec/TODO.md` (phase A вручную — `shared` не покрывается генератором).
- [ ] Фаза B (вручную): компонентная четвёрка по секции «Планируемые файлы» SPEC + `model/types.ts`.
- [ ] WU (TDD): сначала `DataTable.test.tsx` (окно строк page1/page2, clamp `page=99`, «контролы не исчезают» при одной странице, пустой `rows` → emptyState без контролов, options+колбэк → группа снаружи/клик, options без колбэка → без группы, caption/loading pass-through, DOM-порядок группа→таблица→навигация, `effectivePageSize`-защита); затем `DataTable.tsx` + `DataTable.module.scss` + `index.ts`.
- [ ] WU: `DataTable.stories.tsx` (Default, SecondPage, WithSizeGroup, Empty, Loading) — storybook-test зелёный.
- [ ] Гейт: `scripts/axe-stories-check.mjs` по сторисам DataTable + PageSizeGroup → 0 новых.
- [ ] Гейт: `npm run validate` (CPU <45%, лог → файл) + `check:public-api` + `check:axe` (0 регрессий).
- [ ] Git flow: коммит в `feat/kit-datatable` (DRAFT PR #195 открыт).
