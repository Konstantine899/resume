---
status: approved
spec: SPEC.md
---

# TODO — features/AdminMyWork (аменда mywork-row-actions, issue #242)

Эпик-аменда rev.2 (AUTO): действия на каждой строке витрины + тултипы.
Предыдущий эпик `mywork-detail-table` закрыт (PR #240, squash `d8896a2`;
записи сгорели, см. git-историю файла). Контракт: `SPEC.md` §Аменда
rev.2 (R-A1..R-A4). План: vault `plan_mywork_detail_table.md` §Аменда rev.2.

- [ ] **WU-1 — ProjectCard: caption-actions + тултипы (TDD)**
      R-A1: свёрнутый caption несёт Pencil sm + Trash2 sm (Tooltip
      `projectEdit`/`projectDelete`, клики = onEdit(project)/onDelete(id)).
      RED: collapsed-строка содержит кнопки, клики бьют в callbacks, hover
      показывает подсказки. Expanded-шапка не меняется. i18n 0 новых.

- [ ] **WU-2 — MyWorkEditorList: тултипы header-кнопок (TDD)**
      R-A2: reset (`projectReset`) и add (`adminMyWorkAdd`) оборачиваются
      в `<Tooltip>`; RED: hover показывает подсказку; существующие
      ariaLabel-тесты не трогаются.

- [ ] **WU-3 — Page-test: collapsed-Pencil → prefilled-модалка**
      R-A3: новый тест (свёрнутая строка → Pencil → модалка
      `adminEditProject` с prefilled title первой записи); харнес
      edit/delete без expand-first (expand-покрытие detail-таблицы —
      отдельный тест остаётся).

- [ ] **WU-4 — Гейты + burn-down**
      R-A4: validate зелёный; axe `/admin/mywork` 0 регрессий; бандл-дельта
      в капе; burn-down пары (SPEC/TODO → done) + плана rev.2; PR → dev.

## Известные проблемы (вне скоупа, не чинить)

- [ ] FieldEditForm-паритет (per-field модалки) — отклонён rev.1 (OPEN-3);
      при запросе владельца — отдельный эпик.
- [ ] Кит не имеет Checkbox/Switch/Chip — Button-toggle techIcons и
      aria-pressed featured в ProjectForm остаются.
- [ ] `model/selectors/index.ts` — OPEN-8 repo-wide, не трогается.
