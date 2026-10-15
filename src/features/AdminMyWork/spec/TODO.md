---
status: done
spec: SPEC.md
issue: 249
verified: '2026-10-15'
---

# TODO — features/AdminMyWork (every-row-clear, rev.4, issue #249)

Закрыто 2026-10-15: PR #250 (Closes #249). Пункты WU-1..5 сгорели:

1. Контракт rev.4 (schema.ts + types.ts, TDD RED 6 → GREEN 30/30) — `b0065fd`.
2. ProjectCard: CLEARABLE 10 скаляров, conditional-push title/category/status, image Pencil+clear, снят disabled последней метрики (RED 9 → GREEN 32/32) — `1baaeee`.
3. Guard'ы: сортировка category `?? ''`, status-badge omitted — в том же коммите.
4. Форма: `fieldSchemas` image-slice + `FieldEditForm` image-кейс; тесты ProjectForm/storage/fieldSchemas перевёрнуты (51/51).
5. Гейты: tsc/eslint/stylelint 0, public-api 37/37, check:spec 15, axe 0 регрессий, бандл 762.1 < 768, превью-смоук по договорённости — в CI/локально (флейки по CPU реранами в изоляции).

Предыдущая пара (эпик `mywork-field-actions`, rev.3, PR #246) перезаписана — история в git.
