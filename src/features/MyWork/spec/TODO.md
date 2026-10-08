---
status: draft
spec: SPEC.md
---

# TODO — features/MyWork

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] WU-1 (данные, TDD): сначала тесты — `HomePage.test` (wiring `selectAllProjects` вместо `selectFeaturedProjects`, видны все 7 заголовков сида) и `MyWork.test` (fallback = все `PROJECTS`); затем `HomePage.tsx` (`content={selectAllProjects}`) и `MyWork.tsx` (fallback `content ?? PROJECTS`, убрать `getFeaturedProjects` из импортов). Гейт: `npm run validate`.
- [ ] WU-2 (пагинация, TDD): красные тесты в `MyWork.test` — окно ровно 5 карточек / на странице 2 ровно 2, оба контрола скрыты при `totalPages <= 1`, выбор размера сбрасывает на страницу 1, группа имеет `role="group"` и `aria-pressed`; затем реализация в `MyWork.tsx` (`useState` page/pageSize, slice, строка контролов под сеткой: слева группа 5|10|50 на kit `Button`, справа kit `Pagination`) + `MyWork.module.scss`. Гейт: `npm run validate`.
- [ ] WU-3 (i18n): ключ aria-label группы в `en.json` + `ru.json`, тест паритета зелёный. Гейт: `npm run validate`.
- [ ] WU-4 (гейты): `npm run validate` в окне CPU <45% (лог → файл, проверить `$?`, удалить); `npm run build` + `check:bundle` с записью main-дельты (Pagination в main); axe `/` — 0 новых; скриншот витрины до/после в описание PR.
- [ ] WU-5 (vault + дуал-врайт): план `wiki/plan/plan_mywork_pagination.md` → `done`; reconcile каталога `wiki/ui-kit/components-list.md` (найдено при планировании 2026-10-08: убрать 5 фантомов — FileUpload, Menu, Select, Slider, Tabs; добавить 5 пропущенных — Badge, Form, Calendar, DataTable, EmptyState; итог 33); запись в `memory.md` (решения: page-size не kit-компонент, виртуализация defer с порогом).
- [ ] Git flow: ветка `feat/mywork-pagination` от `dev` → DRAFT PR открывается в начале → `gh pr ready` при зелёных проверках → squash merge + удаление ветки по правилам auto-mode (одобрение плана владельцем — до старта кода).
