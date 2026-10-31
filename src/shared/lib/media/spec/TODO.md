---
status: approved
epic: media-pipeline
issue: 336
created: '2026-10-29'
spec: SPEC.md
---

# TODO — shared/lib/media: PR-1b (план сгорает по мере работы; выполненный пункт удаляется)

Чек-лист = WU-3 + механическая адаптация потребителей плана
`plan-image-pipeline-migration.md` (§0 auto-режим, approved 2026-10-29).
Каждый пункт → пункт реализации; статус пары: `approved` → `done` после
зелёного `npm run validate`/`check:spec` и merge PR-1b в `dev`.

## WU-3 — resolver и upload seam

- [ ] F-0. Структура: ветка `feat/media-pipeline-pr1b` от `dev`; новая пара
      `src/shared/lib/media/spec/`; PR `--base dev` → `dev`.
- [ ] F-1. `src/shared/lib/media/`: `mediaUrl`, `mediaSrcSet`, `isMediaKey`,
      `MEDIA_BASE` (+ `index.ts`). Unit-тесты: ключ/вариант/legacy `/...`/
      `http...`/пусто/undefined/невалидный ключ. → SPEC R-1, R-2.
- [ ] F-2. `imageUpload`: POST `/media?kind=...`, успех
      `{ key, width, height, variants }`; mapping 400/409/413/415/507;
      refresh-и-повтор при 401 сохраняется. Legacy `POST /images` seam
      остаётся отдельной функцией для иконок. Unit-тесты обоих seam'ов.
      → SPEC R-3, R-3b.
- [ ] F-3. `server-media`: общий `MEDIA_BASE` вместо локального `API_BASE`;
      поведение FS Access API не меняется. Unit/регрессия. → SPEC R-2.
- [ ] F-4. About frontend-тип получает `updatedAt` (только тип; отправка
      `expectedUpdatedAt` и 409 — PR-2b). → SPEC R-5.
- [ ] F-5. `uploadPortrait` (About) и MyWork image сохраняют ключ; рендер
      через `mediaUrl`/`mediaSrcSet` (About Avatar, MyWork
      `backgroundImage`). Иконки Skills/Technologies — legacy seam и
      `/images`-путь до PR-3a. → SPEC R-3b, R-4, R-6.
- [ ] F-6. Type-check проходит по всем потребителям; legacy-значения
      рендерятся; пустая строка — «нет значения».
- [ ] F-7. Гейт: `npm run validate` → exit 0, `npm run check:spec` → только
      `approved|done`, prettier/format-check на новых файлах. PR-1b →
      зелёный CI → squash-merge в `dev` + delete-branch; пара →
      `status: done`.

## Отложено (не PR-1b)

- [ ] `srcset` в UI — PR-2b после backfill.
- [ ] Иконки Skills/Technologies/Projects — PR-3a.
- [ ] Удаление legacy-рендера и shim — PR-3b.
