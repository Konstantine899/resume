---
status: done
spec: SPEC.md
epic: admin-about-table
created: '2026-10-19'
verified: '2026-10-20'
---

# TODO — features/AdminAbout (витрина на kit Table, rev.1)

Эпик `admin-about-table` ЗАКРЫТ 2026-10-20 (PR #315): WU-0..9 исполнены и выжжены
(выполненные пункты удаляются — правило эпика). Итоги гейтов: `npm run validate`
3882/3882 (public-api 37/37), axe-app 0 регрессий (baseline 4 known), бандл
840.4 < 841.0 KiB (кап `total.maxSize` поднят 860160 → 861184 по слову владельца
2026-10-20: measured 860537, +377 B; main/vendor/gzip не тронуты), preview-смоук
18/18. Контракт и критерии — [SPEC.md](./SPEC.md) (status `done`,
`verified: '2026-10-20'`). Вердикт владельца 2026-10-19: OPEN-1=а, OPEN-2=да,
OPEN-3=да, OPEN-4=да (все закрыты, см. «Решения» SPEC).

## Решения (вердикт владельца 2026-10-19)

- OPEN-1 = (а) — чистый эталон: вся страница = vitrina + модалки, инлайн-форма умирает.
- OPEN-2 = да — переименование `AboutEditorForm` → `AboutEditorList` (+ баррел, страница, тесты).
- OPEN-3 = да — `fullName`: отдельный скаляр-блок над таблицей с inline Save.
- OPEN-4 = да — `useConfirmAction` на Reset-confirm.
