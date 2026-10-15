---
status: approved
spec: SPEC.md
---

# TODO — features/AdminMyWork (карточки-проекты, mywork-detail-table, rev.1)

Эпик `mywork-detail-table` **approved** — вердикт владельца 2026-10-14:
OPEN-1=A′ (карточки-проекты), OPEN-2=A (collapsed default), OPEN-3=B
(field-edit НЕ портируем), OPEN-4=A (заголовки модалки
adminAddProject/adminEditProject), OPEN-5=A (sort storage/title/category/
year). План vault `wiki/plan/plan_mywork_detail_table.md` rev.1.
**Режим исполнения: AUTO** (директива владельца 2026-10-14): все WU,
гейты, merge и burn-down выполняются автоматически, без пофазных
подтверждений; вмешательство владельца — только при нештатной ситуации
(ошибка гейта, неоднозначность). Выполненные пункты УДАЛЯЮТСЯ, не
отмечаются (правило эпика). Burn-down — отдельным docs-PR (паттерн
#214/#228/#236).

## WU-1 — ProjectCard (TDD)

- [ ] RED-тесты `ProjectCard.test.tsx`: collapsed default; expand/
      collapse roundtrip со стабильным `aria-controls`; Pencil →
      `onEdit(project)`; Trash2 → `onDelete(id)`; honest-data строки
      (нет link-row при `link: null`, нет role-row при отсутствии
      `role`, нет metrics-row при пустом массиве, нет year-row при
      `undefined`); Badge featured при `featured: true`; quirk
      `aria-expanded="true"` на strip.
- [ ] `ProjectCard.tsx` + `ProjectCard.module.scss` (референс:
      `AdminJobs/ui/JobCard/*`): caption снаружи, strip Plus
      (`.strip.strip`), expanded header (Minus + h3 + Badge status
      `STATUS_VARIANTS` переезжает сюда + featured + Pencil/Trash2
      IconButtons + Tooltip), detail kit Table `[Данные | Значение |
Действия]` (labels — существующие `projectField*`; technologies
      через запятую; колонка Действия пустая у полей — field-edit
      отклонён).
- [ ] i18n в этом WU: `adminMyWorkExpand`/`adminMyWorkCollapse`
      (`{{title}}`), `adminMyWorkTableField`, `adminMyWorkTableValue`
      (en+ru).

## WU-2 — MyWorkEditorList rewrite

- [ ] Header + sort Select (`storage` default | `title` | `category` |
      `year` desc `?? 0`, `useMemo`-копия над `selectAllProjects`) +
      reset/add IconButtons; i18n sort-ключей (5, en+ru).
- [ ] Список: EmptyState + карточки; удалить DataTable/PageSizeGroup/
      Pagination/range-counter/`STATUS_VARIANTS`/`PAGE_SIZE_OPTIONS`.
- [ ] Confirm-modal (delete/reset) перенесён без логических изменений.
- [ ] Переписать `MyWorkEditorList.test.tsx` (18 its) под карточный
      DOM; сохранить: исчезновение записи, persist→dispatch (shared
      `calls`), persist-fail не закрывает, subtitle с именем, фокус
      «Отмена», reset, empty state, add-доступность, sort-порядок,
      «delete при включённой сортировке persist-ит insertion-order».

## WU-3 — Страница

- [ ] `AdminMyWorkPage.tsx`: title модалки `adminAddProject` /
      `adminEditProject` (OPEN-4=A); i18n +2 ключа.
- [ ] `AdminMyWorkPage.test.tsx`: expand-first хелпер
      (`/^adminMyWorkExpand/`) до `project-card-actions-${id}`;
      обновить assertions заголовков; stale-guard/ESC/overlay/A12/
      «Добавить на пустом списке» остаются зелёными.

## WU-4 — Гейты

- [ ] `npm run validate` зелёный (public-api включительно); флэйки
      CPU — реран файлов в изоляции (шаблон resume-jobs-detail-table).
- [ ] axe-app `/admin/mywork`: 0 регрессий.
- [ ] Бандл-дельта worktree на merge-base в капе 786432.
- [ ] Превью headed desktop+mobile: collapse/expand, sort, confirm
      delete/reset, модалка формы (create+edit), EmptyState.
- [ ] Burn-down docs-PR: SPEC→done+verified, этот TODO выжечь,
      план→done.

## Известные проблемы (вне скоупа, не чинить)

- [ ] FieldEditForm-паритет (per-field модалки) — отклонён в этом
      эпике как «лишнее» (OPEN-3); при запросе владельца — отдельный
      эпик.
- [ ] Кит не имеет Checkbox/Switch/Chip — Button-toggle techIcons и
      aria-pressed featured в ProjectForm остаются (R-8 предыдущего
      эпика, действует).
- [ ] `model/selectors/index.ts` — OPEN-8 repo-wide, не трогается.

---

## Предыдущий эпик (закрыт, содержание сохранено)

Эпик `admin-mywork-refactor` ЗАКРЫТ 2026-10-12 (PR #217): WU-1..7 исполнены
и выжжены. Гейты: validate 3464/3464, axe-stories 72/72, axe 0 регрессий,
бандл 732.3 < 744, public-api 37/37. Вердикт владельца 2026-10-12:
OPEN-1=A (форма в page-owned Modal), OPEN-2=A (DataTable — слой, заменяемый
настоящим эпиком), OPEN-3=A (баррел −12 значений −2 типа, HomePage.test →
deep-import с соблюдением tests-public-api-only: `removeProjects` остаётся
в барреле), OPEN-4=A (подтверждения релокированы из формы). История в git
(`ea1a015` и родные коммиты ветки); сводка — vault
`plan_admin_mywork_refactor.md` (done) и запись dual-write 2026-10-12 в
`memory.md`.
