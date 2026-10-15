---
status: done
spec: SPEC.md
issue: 252
verified: '2026-10-16'
---

# TODO — features/AdminMyWork (mywork-parity-polish, issue #252)

Закрыто 2026-10-16: PR (Closes #252). Пункты WU-1..7 сгорели:

1. ProjectCard kit-варианты: строковый Pencil и метрики ↑↓ — outline, Trash2 (метрика + clear) — danger, иконки 16px → 20px (паритет JobCard).
2. MyWorkEditorList шапка: тултипы сброса/добавления `bottom` → `top`, кнопка сброса ghost → outline.
3. SCSS-ритм: `.headerActions` без `flex-wrap`; `FieldEditForm` `.form` без gap (kit Form gap="lg"), `.actions` — `flex-wrap` + gap `$spacing-3`.
4. i18n: удалены 5 мёртвых ключей `adminMyWorkTable{Title,Category,Status,Featured,Year}` (en+ru) и их записи в allowlist parity-теста.
5. ProjectCard: `testId` → `'data-testid'` (конвенция JobCard), тест обновлён.
6. AdminMyWorkPage: Modal формы получает `subtitle={record?.title}` в режиме правки (паритет AdminSkillsPage), create — без subtitle.
7. Пара spec перезаписана эпиком `mywork-parity-polish`.

Предыдущая пара (эпик `every-row-clear`, rev.4, PR #250) перезаписана — история в git.
