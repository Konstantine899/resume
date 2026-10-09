---
status: draft
spec: SPEC.md
---

# TODO — shared/ui/PageSizeGroup

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [x] Фаза A: `spec/SPEC.md` + `spec/TODO.md` (phase A вручную — `shared` не покрывается генератором).
- [ ] Фаза B (вручную): компонентная четвёрка по секции «Планируемые файлы» SPEC + `model/types.ts`.
- [ ] WU (TDD): сначала `PageSizeGroup.test.tsx` (visible-подпись, `role=group` + имя через `aria-labelledby`, кнопки по `sizes`, `aria-pressed`, `onChange`, пустой `sizes` → null); затем `PageSizeGroup.tsx` + `PageSizeGroup.module.scss` + `index.ts`.
- [ ] WU: `PageSizeGroup.stories.tsx` (базовая, активный посередине, обе темы, 390px) — прогон storybook-test зелёный.
- [ ] Гейт: `scripts/axe-stories-check.mjs` по сторисам → 0 новых.
- [ ] Гейт: `npm run validate` (CPU <45%, лог → файл) + `check:public-api`.
- [ ] Git flow: коммит в `feat/kit-datatable` (ветка от `dev`, DRAFT PR открыт в начале работы).
