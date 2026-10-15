---
status: done
spec: SPEC.md
verified: '2026-10-15'
---

# TODO — features/AdminMyWork (аменда mywork-row-actions, issue #242)

Закрыто 2026-10-15: squash `ae82555`, PR #243 (Closes #242), CI 8/8;
validate 3570/3570, axe 0 регрессий (`/admin/mywork` чист light+dark),
бандл 752.7 < 768 KiB (дельта +0.8 к rev.1), превью-смоук (7 строк с
кнопками, hover-тултип «Редактировать», prefilled-модалка со свёрнутой
строки, header-тултип, pageerrors: none). Пункты WU-1..4 сгорели:
(1) caption-actions ProjectCard 15/15, (2) тултипы header-а списка
19/19, (3) page-test R-A3 7/7 (expand-first харнес удалён), (4) гейты.
Контракт выполнен: `SPEC.md` (status: done, §Аменда rev.2 R-A1..R-A4)
и план `wiki/plan/plan_mywork_detail_table.md` §Аменда rev.2.

## Известные проблемы (вне скоупа, не чинить)

- [ ] FieldEditForm-паритет (per-field модалки) — отклонён rev.1 (OPEN-3);
      при запросе владельца — отдельный эпик.
- [ ] Кит не имеет Checkbox/Switch/Chip — Button-toggle techIcons и
      aria-pressed featured в ProjectForm остаются.
- [ ] `model/selectors/index.ts` — OPEN-8 repo-wide, не трогается.
