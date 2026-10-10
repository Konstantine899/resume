---
status: approved
spec: SPEC.md
---

# TODO — shared/ui/DataTable

Компаньон к [SPEC.md](./SPEC.md) (rev.6, WU-5 «Сортировка»). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки — в SPEC.md.

## Рабочие единицы

- [ ] Финальные гейты: `npm run validate`, `check:axe` 0 регрессий, bundle worktree-дельта (cap 737280 B), `check:public-api`.
- [ ] Git flow: DRAFT PR → `gh pr ready` → squash + удаление ветки (auto по плану).
