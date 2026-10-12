---
status: approved
spec: SPEC.md
---

# TODO — features/AdminMyWork (рефакторинг к паритету с AdminSkills, rev.1)

Компаньон к [SPEC.md](./SPEC.md) rev.1 (эпик `admin-mywork-refactor`). Исходный план:
vault `wiki/plan/plan_admin_mywork_refactor.md`. Правила: выполненный пункт УДАЛЯЕТСЯ
(не отмечается); пункт без критерия не ревьюивается. Статус `approved` — вердикт
владельца 2026-10-12 см. раздел «Решения (вердикт владельца 2026-10-12)» внизу.

## WU-7 — Гейты эпика (SPEC R-9)

- [ ] `npm run validate` в CPU-окне (<45%) зелёный.
- [ ] `npm run check:axe:stories` (со `--build`; сторисы опциональны).
- [ ] axe-app `/admin/mywork`: 0 регрессий против baseline.
- [ ] Бандл-дельта worktree на merge-base: в капе 737280.
- [ ] Секция R-8 «Известные проблемы вне скоупа» сверена с кодом —
      соответствует фактическому состоянию.
- [ ] SPEC.md: критерии R-1..R-7 закрыты, статус → `done`, дата `verified`.
- [ ] Дуал-райт: gotcha-записи в AGENTS.md/engram по итогам эпика.

## Решения (вердикт владельца 2026-10-12)

- OPEN-1 = A — форма переезжает в page-owned kit Modal на странице (паритет Skills).
- OPEN-2 = A — витрина полностью на kit DataTable: Table + Pagination + PageSizeGroup, сортировка → page=1.
- OPEN-3 = A — мёртвые экспорты баррела вырезаются: 12 значений + 2 типа; HomePage.test → deep-import.
- OPEN-4 = A — подтверждения релокируются: две confirm-модалки и кнопки reset/delete удаляются из ProjectForm; reset — шапка витрины, delete — списка; THEN-dispatch кейсы сохранить.
