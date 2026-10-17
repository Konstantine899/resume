---
status: done
spec: SPEC.md
---

# TODO — features/AdminContact (эпик admin-contact-migration, rev.1)

Эпик `admin-contact-migration` ЗАКРЫТ 2026-10-17: WU-0..5 исполнены и выжжены
(выполненные пункты удаляются — правило эпика). Итоги гейтов: `npm run
validate` EXIT 0 (public-api 37/37), точечный vitest 66/66, бандл
779.3 < 784 KiB, axe 0 регрессий (baseline 4), CI PR 8/8. Трек A плана
rev.2 (R1 комментарии, R2-α barrel, D6-фиксация в SPEC) выполнен; трек B
(RTK Query) отложен до backend-API-спецификации (решение D1, §5.1 плана).
Контракт и критерии — [SPEC.md](./SPEC.md) (status `done`,
`verified: '2026-10-17'`). Merge: squash `e1d5ef3` (PR #277), issue #276
закрыт вручную.
