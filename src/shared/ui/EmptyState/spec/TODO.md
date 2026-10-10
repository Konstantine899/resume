---
status: approved
spec: SPEC.md
---

# TODO — shared/ui/EmptyState

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] WU-2 гейты: `npm run validate` (CPU <45%); axe `/admin` 0 новых; `check:bundle` с worktree-дельтой относительно merge-base (лимит 737280 B).
- [ ] Git flow: `gh pr ready` при зелёных гейтах → squash merge + удаление ветки (auto по плану).
