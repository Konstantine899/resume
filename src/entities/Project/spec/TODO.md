---
status: done
spec: SPEC.md
---

# TODO — entities/Project (хранилище изображений + FileUpload)

Компаньон к [SPEC.md](./SPEC.md). Все рабочие единицы сгорены (WU-1…WU-5 выполнены 2026-10-10, PR #207).

## Заметки

- Главный подвох плана: `public/` = outDir, и сборка его пустит (опытно: маркер-файл уничтожен `npm run build`, 2026-10-10) — исходники только в `src/`, в `public/` ничего не кладём руками.
- FileUpload ВКЛЮЧЁН вердиктом владельца (2026-10-10, rev.2 плана); OPEN-6=A с коррективами rev.3: webp-детект → явный JPEG-фолбэк (Safari молча откатывается в PNG), guardrails в символах (лимит ≈400K/файл, бюджет ≈2.5M суммарно при ёмкости ≈5.24M — замер Chromium 151), истина = `QuotaExceededError` → тост `projectSaveError` (закрепить тестом). Схема — суперсет: `https?://` и `data:image/` всегда (защита от тихого отката на сид при гидрации). Общий риск: Safari ITP удаляет localStorage через 7 дней без визита — принят владельцем.
- Пара живёт в `entities/Project`, а не в `features/` — изменение контракта данных сущности; правило 9 допускает spec вне features, сканер `check:spec` берёт `src/**/spec/SPEC.md`. Перед коммитом проверить `git check-ignore` (gotcha `resume-gitignore-md` — `*.md` в `.gitignore` глобально).
