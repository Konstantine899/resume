---
status: approved
spec: SPEC.md
---

# TODO — features/AdminJobs (рефакторинг к паритету с AdminSkills, rev.2)

Компаньон к [SPEC.md](./SPEC.md) rev.2 (эпик `admin-jobs-refactor`). Исходный план:
vault `wiki/plan/plan_admin_jobs_refactor.md`. Правила: выполненный пункт УДАЛЯЕТСЯ
(не отмечается); пункт без критерия не ревьюивается. Вердикт владельца 2026-10-11:
OPEN-1=A (модалка), OPEN-2=A (DataTable), OPEN-3=B (срез мёртвых экспортов),
OPEN-4=B («Present» отдельным pass).

## WU-8 — Гигиена (SPEC R-8)

- [ ] Удалить ключ `adminJobPosition` из `en.json`/`ru.json` и из allowlist
      `locales-parity.test.ts:124`; parity-тест зелёный.
- [ ] Вырезать из `index.ts` мёртвые экспорты (`toggleCurrent`,
      `applyJobToggle`, `resetToDefaults`, `removeJobs`, `selectJobById`,
      `selectCurrentJob`); пересмотреть их тесты; `check:public-api` зелёный.

## WU-9 — Гейты эпика (SPEC R-10)

- [ ] `npm run validate` в CPU-окне (<45%) зелёный.
- [ ] `npm run check:axe:stories` (со `--build`; сторисы опциональны).
- [ ] axe-app `/admin/jobs`: 0 регрессий против baseline.
- [ ] Бандл-дельта worktree на merge-base: в капе 737280.
- [ ] SPEC.md: критерии R-1..R-8 закрыты, статус → `done`, дата `verified`.
- [ ] Дуал-райт: gotcha-записи в AGENTS.md/engram по итогам эпика.
