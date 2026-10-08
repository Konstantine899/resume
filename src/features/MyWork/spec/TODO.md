---
status: draft
spec: SPEC.md
---

# TODO — features/MyWork

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] WU-4 (гейты): `npm run validate` в окне CPU <45% (лог → файл, проверить `$?`, удалить); `npm run build` + `check:bundle` с записью main-дельты (Pagination в main); axe `/` — 0 новых; скриншот витрины до/после в описание PR.
- [ ] WU-5 (vault + дуал-врайт): план `wiki/plan/plan_mywork_pagination.md` → `done`; reconcile каталога `wiki/ui-kit/components-list.md` (найдено при планировании 2026-10-08: убрать 5 фантомов — FileUpload, Menu, Select, Slider, Tabs; добавить 5 пропущенных — Badge, Form, Calendar, DataTable, EmptyState; итог 33); запись в `memory.md` (решения: page-size не kit-компонент, виртуализация defer с порогом).
- [ ] Git flow: ветка `feat/mywork-pagination` от `dev` → DRAFT PR открывается в начале → `gh pr ready` при зелёных проверках → squash merge + удаление ветки по правилам auto-mode (одобрение плана владельцем — до старта кода).
