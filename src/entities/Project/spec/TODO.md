---
status: approved
spec: SPEC.md
---

# TODO — entities/Project (хранилище изображений + FileUpload)

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] **WU-2 Конвейер эмиссии + файлы**: `BuildPath` += источники и dest (`config/vite/types/config.ts` → `vite.config.ts` → фикстуры `config/vite/__tests__/buildPlugins.test.ts` и `buildViteConfig.test.ts`, сверить `.storybook/main.ts`); `viteStaticCopy` += target `src/shared/assets/images/projects/*` → `public/images/projects/` (прецедент локалей в `buildPlugins.ts`); скачать 7 картинок из сида в источник (имена — OPEN-4, размер — OPEN-5); проверить: тест таргета зелёный, `npm run build` → файлы в `public/images/projects/`, dev-сервер отдаёт `/images/projects/…`.
- [ ] **WU-3 Миграция сида + стражи**: константы 7 URL → `/images/projects/<имя>`; фикстура `schema.test.ts` на путь; тест-страж `fs.existsSync` для каждого `image` сида (путь от корня репо: `process.cwd()`/`fileURLToPath`); `grep ext.same-assets src/` = 0; кейс `ProjectForm.test`: внутренний путь → валидация ок → сохранён в стор; браузерная проверка витрины — все 7 картинок, ни одной битой.
- [ ] **WU-4 kit `FileUpload` + пилот** (OPEN-6=A rev.3 с коррективами; OPEN-7): каталог `src/shared/ui/FileUpload/` (ARCH-1: `ui/FileUpload/FileUpload.{tsx,module.scss,test,stories}` + `model/types.ts` + `lib/useImageDragDrop.ts` + barrel); перенести сироту-хук из `src/shared/ui/Image/lib/hooks/` (0 потребителей) и убрать хардкод `'Failed to read file'` — тексты только пропсами от потребителя (A2, не-вакуумный тест на отсутствие собственных строк); поведение: кнопка + dropzone + превью, кодек **webp при детекте → иначе явный JPEG** (не дефолтный PNG — Safari), reject не-изображения/сверх лимита (≈400K симв)/**недекодируемого через `img.onerror`** (HEIC), `onFileSelect(value)` без RHF; тесты (выбор → колбэк через `input[type=file]`, dnd — фейковый `DataTransfer`, reject-кейсы, webp-фолбэк-тест, клавиатура); **тест квоты**: mock `setItem` → `QuotaExceededError` → тост `projectSaveError`, форма цела; **a11y-критерии**: label/accessible name, ошибки `role=alert`+`aria-describedby`, кнопка-всегда (SC 2.5.7/2.1.1), цели ≥24px (SC 2.5.8), `aria-live` статус; сторисы en+ru, обе темы, инлайн 390px; запись в `wiki/ui-kit/components-list.md` (сводная таблица тоже); пилот `ProjectForm` (поле URL сохраняем, FileUpload = второй вход, `setValue('image', v, { shouldDirty: true, shouldValidate: true })`), тест пилота, новые i18n-ключи → en+ru + parity; гейт `axe-stories --filter=FileUpload` (со `--build`).
- [ ] **WU-5 Гейты и PR**: `npm run validate`; `check:axe` (0 регрессий); `axe-stories` (все сторис, включая FileUpload); `check:bundle` (737280 не меняется); `check:spec`; git flow: ветка `feat/project-images-storage` от `dev` → DRAFT PR → ready при зелёных → squash + удаление ветки (auto-режим, общее решение 2026-10-05).

## Заметки

- Главный подвох плана: `public/` = outDir, и сборка его пустит (опытно: маркер-файл уничтожен `npm run build`, 2026-10-10) — исходники только в `src/`, в `public/` ничего не кладём руками.
- FileUpload ВКЛЮЧЁН вердиктом владельца (2026-10-10, rev.2 плана); OPEN-6=A с коррективами rev.3: webp-детект → явный JPEG-фолбэк (Safari молча откатывается в PNG), guardrails в символах (лимит ≈400K/файл, бюджет ≈2.5M суммарно при ёмкости ≈5.24M — замер Chromium 151), истина = `QuotaExceededError` → тост `projectSaveError` (закрепить тестом). Схема — суперсет: `https?://` и `data:image/` всегда (защита от тихого отката на сид при гидрации). Общий риск: Safari ITP удаляет localStorage через 7 дней без визита — принят владельцем.
- Пара живёт в `entities/Project`, а не в `features/` — изменение контракта данных сущности; правило 9 допускает spec вне features, сканер `check:spec` берёт `src/**/spec/SPEC.md`. Перед коммитом проверить `git check-ignore` (gotcha `resume-gitignore-md` — `*.md` в `.gitignore` глобально).
