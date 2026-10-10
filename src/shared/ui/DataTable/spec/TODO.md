---
status: approved
spec: SPEC.md
---

# TODO — shared/ui/DataTable

Компаньон к [SPEC.md](./SPEC.md) (rev.6, WU-5 «Сортировка»). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки — в SPEC.md.

## Рабочие единицы

- [ ] WU-5b: сторисы сортировки (SortedAsc/SortedDesc/SortCycle) + axe-stories.
- [ ] WU-5c (после мержа PR #197 — файл конфликтует): пилот SkillsList (OPEN-3, плоские строки OPEN-5) — отдельный коммит.
- [ ] WU-5d: миграция MyWork на kit `PageSizeGroup` (вердикт: «не исключил»).
- [ ] Финальные гейты: `npm run validate` (CPU <45%), `check:axe` 0 регрессий, bundle worktree-дельта (cap 737280 B), `check:public-api`.
- [ ] Git flow: DRAFT PR → `gh pr ready` → squash + удаление ветки (auto по плану).
