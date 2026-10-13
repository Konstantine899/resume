---
status: approved
spec: SPEC.md
---

# TODO — features/AdminSkills (сворачивание карточек, rev.4)

Компаньон к [SPEC.md](./SPEC.md) rev.4 (эпик `skills-card-collapse`, **approved 2026-10-12** — вердикты OPEN-1..4 = A/B1/A/A). Auto-режим: WU и гейты автоматически, squash merge + удаление ветки — автоматически при зелёных проверках. Предыдущие эпик'и сгорели: `skills-actions-polish` (PR #221), `skills-icon-upload` (PR #213), `admin-panel-edit` (PR #205).

- [ ] **Ветка и PR:** `feat/skills-card-collapse` от свежего `origin/dev`; DRAFT PR в `dev` сразу после первого коммита; conventional commits по WU.
- [ ] **WU-1 (TDD):** RED — тесты: сворачивание (клик «Свернуть» → h3/таблица/footer скрыты, подпись + полоска с `+` видны), разворачивание (клик по полоске → карточка восстановлена, подпись исчезла), ARIA (`aria-expanded`/`aria-controls`), имена `t('skillsCollapseCategory'/'skillsExpandCategory', {name})`, независимость карточек. GREEN — `Record<category, boolean>` в `SkillsEditorList`, unmount контента (A16), полоска = кнопка (A17); новые ключи `en.json`/`ru.json` (parity).
- [ ] **WU-2:** SCSS — полоска (поверхность, радиус, hover), `+` слева, подпись над полоской (label/muted), иконка сворачивания слева от h3; превью light+dark.
- [ ] **Гейты:** `npm run validate` (CPU<45%), `npm run check:axe` (0 регрессий), `npm run build` + `npm run check:bundle` (< 744 KiB), `npm run check:public-api` (37/37); preview-сверка свернуть/развернуть light+dark.
- [ ] **Burn-down:** SPEC → `status: done` + `verified`; этот TODO — закрывающая заметка (паттерн #205/#213/#221); AGENTS.md gotcha + vault `memory.md`; `gh pr ready` → checks watch → squash `--delete-branch` → fetch/prune.
