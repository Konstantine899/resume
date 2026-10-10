---
status: approved
spec: SPEC.md
---

# TODO — entities/Project (хранилище изображений + FileUpload)

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] **WU-5 Гейты и PR**: `npm run validate`; `check:axe` (0 регрессий); `axe-stories` (все сторис, включая FileUpload); `check:bundle` (737280 не меняется); `check:spec`; git flow: ветка `feat/project-images-storage` от `dev` → DRAFT PR → ready при зелёных → squash + удаление ветки (auto-режим, общее решение 2026-10-05).

## Заметки

- Главный подвох плана: `public/` = outDir, и сборка его пустит (опытно: маркер-файл уничтожен `npm run build`, 2026-10-10) — исходники только в `src/`, в `public/` ничего не кладём руками.
- FileUpload ВКЛЮЧЁН вердиктом владельца (2026-10-10, rev.2 плана); OPEN-6=A с коррективами rev.3: webp-детект → явный JPEG-фолбэк (Safari молча откатывается в PNG), guardrails в символах (лимит ≈400K/файл, бюджет ≈2.5M суммарно при ёмкости ≈5.24M — замер Chromium 151), истина = `QuotaExceededError` → тост `projectSaveError` (закрепить тестом). Схема — суперсет: `https?://` и `data:image/` всегда (защита от тихого отката на сид при гидрации). Общий риск: Safari ITP удаляет localStorage через 7 дней без визита — принят владельцем.
- Пара живёт в `entities/Project`, а не в `features/` — изменение контракта данных сущности; правило 9 допускает spec вне features, сканер `check:spec` берёт `src/**/spec/SPEC.md`. Перед коммитом проверить `git check-ignore` (gotcha `resume-gitignore-md` — `*.md` в `.gitignore` глобально).
