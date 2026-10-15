---
status: done
spec: SPEC.md
verified: '2026-10-15'
---

# TODO — features/AdminMyWork (карточки-проекты, mywork-detail-table)

Закрыто 2026-10-15: squash `d8896a2`, PR #240 (Closes #238), CI 8/8;
validate 3564/3564, axe 0 регрессий (light+dark, `/admin/mywork` чист),
бандл 751.9 < 768 KiB (дельта +3.3 к merge-base), превью desktop+mobile.
Вердикт владельца 2026-10-14: OPEN-1=A′ (карточки-записи), OPEN-2=A
(collapsed default), OPEN-3=B (field-edit отклонён), OPEN-4=A (заголовки
модалки adminAddProject/adminEditProject), OPEN-5=A (sort
storage/title/category/year). Пункты WU-1..3 сгорели (ProjectCard,
MyWorkEditorList sort+vitirna, страница), WU-4 = гейты — контракт
выполнен, см. `SPEC.md` (status: done) и план
`wiki/plan/plan_mywork_detail_table.md`. Оставался только burn-down.

## История инцидента (процесс, не код)

PR #239 (тот же контент) ошибочно смержился в `main`: base PR стал
дефолтной веткой репо (`main`), diff захватил 114 коммитов dev (515
файлов). Восстановление: эпик по правильному пути влит в dev через PR #240;
main возвращается revert-PR по инструкции владельца. Готча — в AGENTS.md
(`resume-pr-base-dev-default-main`).

## Известные проблемы (вне скоупа, не чинить)

- [ ] FieldEditForm-паритет (per-field модалки) — отклонён в этом
      эпике как «лишнее» (OPEN-3); при запросе владельца — отдельный
      эпик.
- [ ] Кит не имеет Checkbox/Switch/Chip — Button-toggle techIcons и
      aria-pressed featured в ProjectForm остаются (R-8 предыдущего
      эпика, действует).
- [ ] `model/selectors/index.ts` — OPEN-8 repo-wide, не трогается.
