---
status: approved
spec: SPEC.md
---

# TODO — features/AdminContact (эпик admin-contact-migration, rev.1)

Контракт и критерии — [SPEC.md](./SPEC.md). План: vault
`wiki/plan/plan_admin_contact_migration.md` rev.2, решения D1–D7 от
2026-10-17, режим **auto**. Выполненные пункты УДАЛЯЮТСЯ (правило эпика).

Сожжено до этой ревизии (эпик в процессе, история в git):
WU-0 (план → auto + §5.1), WU-1 (R1 комментарии), WU-2 (R2-α barrel),
WU-3 (D6 в SPEC), WU-4 (гейты: validate EXIT 0, vitest 66/66,
бандл 779.3 < 784, axe 0 регрессий, CI 8/8).

## WU-5 — выдача

- [ ] DRAFT PR #277 (`--base dev`) → ready, CI зелёный.
- [ ] Merge (auto при зелёных чеках) + удаление ветки.
- [ ] `gh issue close 276` (Closes #N в не-default-ветку не работает).
- [ ] Burn-down: `status: done` в паре + плане; dual-write vault + AGENTS.md.
