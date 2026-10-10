---
status: approved
spec: SPEC.md
---

# TODO — shared/ui/EmptyState

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] WU-2 (пилот, OPEN-1): заменить голый `<p>` на дашборде (`adminDashboardEmpty`) и пустое состояние админ Skills (`skillsListEmpty`) на компонент — **локальные ключи не меняются** (A2: ключи остаются в фичах; проверить, что для этих ключей нет диффа в `en.json`/`ru.json`).
- [ ] WU-2 гейты: `npm run validate`; axe `/admin` 0 новых; `check:bundle` с worktree-дельтой относительно merge-base (лимит 737280 B).
- [ ] WU-3: запись в `wiki/ui-kit/components-list.md`; dual-write gotcha в vault `memory.md` + AGENTS.md; `check:public-api` зелёный.
- [ ] Git flow: ветка `feat/kit-empty-state` от `dev` → DRAFT PR открывается в начале → `gh pr ready` при зелёных проверках → squash merge + удаление ветки только после одобрения владельца.
