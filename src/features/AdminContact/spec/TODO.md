---
status: approved
spec: SPEC.md
---

# TODO — features/AdminContact (паритет с gold standard админ-семьи, rev.1)

Компаньон к [SPEC.md](./SPEC.md) rev.1 (эпик `admin-contact-refactor`). Исходный
план: vault `wiki/plan/plan_admin_contact_refactor.md`. Правила: выполненный
пункт УДАЛЯЕТСЯ (не отмечается); пункт без критерия не ревьюивается. Вердикт
владельца 2026-10-12 принят без изменений (см. раздел «Решения» внизу).

## WU-4 — axe: `/admin/contact` в PATHS (SPEC R-4)

- [ ] `scripts/purge-axe-check.mjs:37`: PATHS += `'/admin/contact'`
      (комментарий в стиле :34-36).
- [ ] Прогон axe-app; при новых fingerprint'ах страницы — регенерация
      baseline на чистом прогоне (`--update-baseline`).

## WU-5 — Гейты эпика (SPEC R-6)

- [ ] `npm run validate` в CPU-окне (<45%) зелёный.
- [ ] axe-app `/admin/contact`: 0 регрессий против обновлённого baseline.
- [ ] Бандл-дельта worktree на merge-base: в капе 737280.
- [ ] Секция R-5 «Известные проблемы вне скоупа» сверена с кодом —
      соответствует фактическому состоянию.
- [ ] SPEC.md: критерии R-1..R-4 закрыты, статус → `done`, дата `verified`.
- [ ] Burn-down: TODO выжжен по шаблону `DataTable/spec/TODO.md`.
- [ ] Дуал-райт: gotcha-записи в AGENTS.md/engram по итогам эпика.

## Решения (вердикт владельца 2026-10-12)

Рекомендации агента приняты без изменений.

- OPEN-1=A — reset-confirm через kit Modal вместо нативного `window.confirm`.
- OPEN-2=B — форма остаётся инлайн на странице; тест страницы — smoke
  инлайн-компонент (Modal-ассерты формы не требуются).
- OPEN-3=A — публичный API баррела: остаётся только `ContactEditorForm`,
  5 мёртвых экспортов + 2 deep-import-дубля вырезаются.
- OPEN-4=B — email max length: зафиксировано как известная проблема,
  entity-схема не меняется.
