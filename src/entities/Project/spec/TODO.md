---
status: done
spec: SPEC.md
---

# TODO — entities/Project (хранилище изображений + FileUpload)

**Закрыт (2026-10-11):** все WU выполнены; аменди rev.4 (поддиректории, shared `imageDir`) влит в `dev` через PR #209 (`6a690d1`, squash; CI 8/8; локальные гейты зелёные: validate, axe 0 регрессий, axe-stories FileUpload 20/20, bundle 725.2 < 744.0, spec gate 10/10). Ветка `feat/file-upload-dir-write` удалена. Burn-down завершён.

## Заметки

- Главный подвох плана: `public/` = outDir, и сборка его пустит (опытно: маркер-файл уничтожен `npm run build`, 2026-10-10) — исходники только в `src/`, в `public/` ничего не кладём руками.
- FileUpload ВКЛЮЧЁН вердиктом владельца (2026-10-10, rev.2 плана); **rev.4 (вердикт владельца там же) заменил OPEN-6=A**: файл пишется в директорию через File System Access API (Chromium-only, unsupported → алерт), контракт kit — `{ blob, name }`, поле URL удалено. История rev.3 (dataURL, guardrails в символах) сохранена в SPEC как историческая. **Аменди 2026-10-10:** поддиректория выбирается/создаётся на загрузку (default `projects`); до сервера записанный файл — untracked в `src/shared/assets/images/<dir>/`, коммитит владелец.
- Пара живёт в `entities/Project`, а не в `features/` — изменение контракта данных сущности; правило 9 допускает spec вне features, сканер `check:spec` берёт `src/**/spec/SPEC.md`. Перед коммитом проверить `git check-ignore` (gotcha `resume-gitignore-md` — `*.md` в `.gitignore` глобально).
