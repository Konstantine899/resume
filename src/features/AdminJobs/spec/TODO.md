---
status: approved
epic: jobs-detail-table
created: '2026-10-13'
spec: SPEC.md
---

# TODO — AdminJobs карточки-записи (rev.3)

> План сгорает по мере работы (выполненный пункт удаляется, не отмечается).
> Вердикт владельца 2026-10-13: A′. Auto-mode: WU идут подряд, merge + burn-down автоматом.

## WU-1 — Компонент JobCard (TDD)

- [ ] RED: `JobCard.test.tsx` — скалярные строки (должность/период/локация/тех),
      скрытая URL-строка без `companyUrl`, Pencil в скалярной строке вызывает
      `onEditJob`, default collapsed (caption снаружи, таблица отсутствует в DOM),
      expand → таблица + `contentId`, roundtrip collapse/expand (ARA).
- [ ] RED: disabled-состояния параграфов (`↑` первый / `↓` последний /
      Trash2 при 1 параграфе); move/remove персистят: `persistJobs` до
      `dispatch`, состав массива = ожидаемый (insertion-order снимок).
- [ ] GREEN: `JobCard.tsx` + `JobCard.module.scss` (Card default,
      `.strip.strip`, `.blockHeader`/`.headerMain`/`.actions`/`.caption` —
      зеркало Skills), kit Table с колонками `[adminJobsTableField |
    adminJobsTableValue | adminJobsTableActions]`, inline-CRUD
      persist-THEN-dispatch, тост persist-fail.
- [ ] `npx prettier --write` JobCard-файлы; `npm run type-check` + целевые
      vitest зелёные.

## WU-2 — JobsList rewrite (TDD)

- [ ] RED: переписать `JobsList.test.tsx`: карточки по числу записей в
      порядке сортировки; Select `adminJobsSort` (recent default / company /
      position) реально переставляет; Trash2 карточки → confirm-modal
      (subtitle `{{company}}`, фокус «Отмена», persist-fail держит открытой,
      порядок persist→dispatch) — тесты rev.2 переносятся; EmptyState;
      `onAddJob`/`onEditJob` колбэки.
- [ ] GREEN: `JobsList.tsx` — шапка (h2 + Select + IconButton Plus), список
      JobCard, confirm-Modal; удалить DataTable/PageSizeGroup/Pagination.
- [ ] Удалить мёртвые SCSS-классы DataTable-эры; `npx prettier --write`;
      type-check + целевые vitest зелёные.

## WU-3 — JobForm bullet-editor restyle (TDD)

- [ ] RED: строка параграфа несёт kit-Paragraph-классы на input (fallback —
      зеркальные декларации SCSS, зафиксировать в SPEC R-6); IconButtons
      `ArrowUp/ArrowDown/X` с aria-label `adminJobBulletUp/BulletDown/RemoveBullet`;
      существующие буллет-тесты (add/remove/move/disabled/zod) остаются зелёными.
- [ ] GREEN: `renderBulletEditor` — `Paragraph asChild size="xs" theme="primary"
    align="left"` + kit IconButton + Tooltip; удалить `.bulletIcon`-текстовые кнопки.
- [ ] i18n: добавить 8 ключей в `en.json`/`ru.json`; parity-тест зелёный.
- [ ] `npx prettier --write`; type-check + целевые vitest зелёные.

## WU-4 — Гейты

- [ ] `npm run validate` в CPU-окне <45% (полный gate, включая public-api).
- [ ] axe-app `/admin/jobs`: 0 регрессий.
- [ ] Бандл-дельта worktree на merge-base ≤ 737280.
- [ ] Превью (preview/build, light+dark): collapse/expand, ↑↓×, add/delete
      через модалку, сортировка.

## WU-5 — Merge + burn-down

- [ ] DRAFT PR → checks green → squash-merge в `dev`, ветка удалена.
- [ ] SPEC: все пункты закрыты, `status: done`, `verified: 'YYYY-MM-DD'`;
      TODO выжжен до closing-note (паттерн #199/#214).
- [ ] План в vault → `status: done`; dual-write: AGENTS.md gotcha
      (`resume-jobs-detail-table`) + vault `memory.md` + engram (если доступен).
