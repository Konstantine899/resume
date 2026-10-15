---
status: approved
spec: SPEC.md
verified: '2026-10-15'
---

# TODO — features/AdminMyWork (аменда mywork-field-actions, issue #245, rev.3)

Вердикт владельца 2026-10-14 (question-tool): кнопки ✏️/🗑️ — в detail-таблице
карточки (отменяет OPEN-3=B; паритет AdminJobs #227). AUTO-режим. План:
vault `wiki/plan/plan_mywork_detail_table.md` §Аменда rev.3.

- [ ] **WU-1 Документация rev.3** — SPEC §Аменда rev.3 (R-B1..R-B7) +
      этот TODO + vault-план §Аменда rev.3.
- [ ] **WU-2 fieldSchemas TDD** — `ui/ProjectForm/lib/fieldSchemas.ts`:
      `EditProjectField` (scalar + `metric-${number}`), per-field zod-слайсы
      через делегирование к `ProjectFormDataSchema`/`ProjectFormSchema`
      (`.pipe`-паритет), `defaultValuesFor`, `toUpdateDto` →
      `Omit<ProjectUpdatePatch, 'id'>`. RED-тесты → GREEN.
- [ ] **WU-3 i18n** — 5 flat-ключей en+ru: `adminMyWorkEditFieldTitle`,
      `adminMyWorkClearField`, `adminMyWorkMetricUp`,
      `adminMyWorkMetricDown`, `adminMyWorkRemoveMetric` (parity-тест не
      правится: сверяет множество ключей).
- [ ] **WU-4 ProjectCard-действия TDD** — колонка `actions`:
      Pencil каждая строка (`project-field-actions-${id}-${row.key}`,
      `onEditField`), image — без Pencil; metric-N: Pencil+↑↓+Trash2
      (disabled-паритет bullets), redux+persist внутри карточки; скаляры:
      Trash2-очистка (year/link/description/role/techIcons/image/featured),
      скрыт на title/category/status; persist-THEN-dispatch §3.
- [ ] **WU-5 FieldEditForm TDD** — `ui/FieldEditForm/FieldEditForm.tsx`:
      инпуты активного поля (Input/Select/Textarea/chips/checkbox),
      resolver из fieldSchemas, Save disabled pristine, persist-fail тост
      + модалка открыта, Save → persist → dispatch → тост → onExitEdit,
      без h2 (имя диалога у страницы).
- [ ] **WU-6 Wiring + page-tests** — `AdminMyWorkPage`: форма
      `{ projectId?, field? }`, FieldEditForm `key="${id}-${field}"`,
      title `adminMyWorkEditFieldTitle` (карта label-ключей), stale-guard;
      `MyWorkEditorList` пробрасывает `onEditField`; page-test
      (prefilled-модалка по Pencil строки) + адаптация харнеса.
- [ ] **WU-7 Гейты** — validate (CPU-окно <45%), axe `/admin/mywork`
      0 регрессий, бандл в капе 786432, превью-смоук (Pencil →
      prefilled-модалка поля, очистка link, ↑↓/Trash2 метрик), public-api.
- [ ] **WU-8 Merge + burn-down** — PR `--base dev`, CI green, squash auto,
      burn-down-док (SPEC/TODO → done + closing note), план rev.3 → done,
      dual-write vault `memory.md` + AGENTS.md-готча при наличии.

## Известные проблемы (вне скоупа, не чинить)

- [ ] Кит не имеет Checkbox/Switch/Chip — Button-toggle techIcons и
      aria-pressed featured в ProjectForm остаются.
- [ ] `model/selectors/index.ts` — OPEN-8 repo-wide, не трогается.
