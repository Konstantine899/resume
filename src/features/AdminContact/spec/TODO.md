---
status: done
spec: SPEC.md
---

# TODO — features/AdminContact (паритет с gold standard админ-семьи, rev.1)

Эпик `admin-contact-refactor` ЗАКРЫТ 2026-10-12 (PR #219): WU-1..5 исполнены и выжжены
(выполненные пункты удаляются — правило эпика). Итоги гейтов: `npm run validate`
3502/3502, axe-app 0 регрессий (PATHS += `/admin/contact`, baseline не менялся),
бандл 733.5 < 744 KiB, public-api 37/37. Отклонение от плана: deep-import в
`HomePage.test` запрещён `tests-public-api-only` — баррел сохранил трио
seed/persist/remove (как AdminAbout/AdminMyWork), SPEC R-3 поправлен.
Контракт и критерии — [SPEC.md](./SPEC.md) (status `done`,
`verified: '2026-10-12'`). Вердикт владельца 2026-10-12: OPEN-1=A, OPEN-2=B,
OPEN-3=A, OPEN-4=B (см. «Решения» внизу).

## Решения (вердикт владельца 2026-10-12)

Рекомендации агента приняты без изменений.

- OPEN-1=A — reset-confirm через kit Modal вместо нативного `window.confirm`.
- OPEN-2=B — форма остаётся инлайн на странице; тест страницы — smoke
  инлайн-компонент (Modal-ассерты формы не требуются).
- OPEN-3=A — публичный API баррела: остаётся только `ContactEditorForm`,
  5 мёртвых экспортов + 2 deep-import-дубля вырезаются.
- OPEN-4=B — email max length: зафиксировано как известная проблема,
  entity-схема не меняется.
