---
status: approved
spec: SPEC.md
---

# TODO — shared/ui/Calendar (+ DatePicker)

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] Гейты (запуск при CPU <45%): `npm run validate` (лог → файл, проверить `$?`, удалить лог) + `test:storybook` + axe-проверка сторисов (`--filter=Calendar`, скрипт Table WU-2 или axe-cdn fallback).
- [ ] Гейты WU-4: `check:axe` `/admin/jobs` → 0 новых (baseline 4); `check:bundle` с worktree-дельтой относительно merge-base (лимит 737280 B; ленивый админ-чанк, витрина не тронута).
- [ ] Git flow: ветка `feat/kit-calendar` от `dev` → DRAFT PR открывается в начале → `gh pr ready` при зелёных проверках → squash merge + удаление ветки только после одобрения владельца.
