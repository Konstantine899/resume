---
status: approved
spec: SPEC.md
---

# TODO — features/AdminSkills (действия-иконки, rev.3)

Компаньон к [SPEC.md](./SPEC.md) rev.3 (эпик `skills-actions-polish`). Auto-режим
(вердикт владельца 2026-10-12): WU и гейты выполняются автоматически, squash merge +
удаление ветки — автоматически при зелёных проверках. Источник фактов и gotcha'ов:
vault `wiki/plan/plan_skills_actions_polish.md` (approved, OPEN-1..4 = A).
Предыдущие эпик'и сгорели: `admin-panel-edit` (PR #205), `skills-icon-upload` (PR #213).

- [ ] **Ветка и PR:** `feat/skills-actions-polish` от свежего `origin/dev`; DRAFT PR в `dev` сразу после первого коммита; conventional commits по WU.
- [ ] **WU-1 (TDD):** RED — тест тултипа (hover → виден, unhover → скрыт; focus визуальный тултип НЕ открывает — A14, hover-only по вердикту 2026-10-12) в `SkillsEditorList.test.tsx`; существующие `getByRole('button', { name: <ключ> })` остаются. GREEN — 7 кнопок → kit `IconButton` + kit `Tooltip` (`position="top"`, autoAdjust не отключать): шапка страницы `Plus`/`RotateCcw` md; блок `Pencil`/`Plus`/`Trash2` sm; строка `Pencil`/`Trash2` sm; иконки — kit `Icon`-обёртка `lucide-react` (паттерн `MyWorkEditorList:228-241`); `variant` 1:1 от текущих Button (`danger` — алиас kit, не переписывать); `ariaLabel` = `content` = прежний ключ; кнопки модалки — текстовые. SCSS: `.actions { justify-content: flex-end }` + правый прижим ячейки. Мини-гейт: type-check + целевой vitest.
- [ ] **WU-2:** блоки категорий → kit `Card` (`variant` default, `size="default"`, `hoverable={false}`, `className={styles.block}` c `height: auto`); `data-testid="skills-category-block-*"` пробросить; заголовок страницы — снаружи карточек; header-кнопки — IconButton+Tooltip. Мини-гейт: type-check + целевой vitest.
- [ ] **Гейты:** `npm run validate` (CPU<45%-окно), `npm run check:axe` (0 регрессий, `/admin/skills` light+dark), `npm run build` + `npm run check:bundle` (< 744 KiB / 737280), `npm run check:public-api` (37/37); preview-сверка: тултипы hover/focus light+dark, прижим, границы Card, outline-Badge в Card (A13). Axe-stories не применим (сторис нет).
- [ ] **Burn-down:** SPEC → `status: done` + `verified: '2026-10-12'`; этот TODO — закрывающая заметка (паттерн #205/#213); AGENTS.md — gotcha-запись + vault `memory.md` — секция; `gh pr ready` → checks watch → squash `--delete-branch` → fetch/prune.
