---
status: approved
spec: SPEC.md
---

# TODO — features/AdminSkills (блок «Навыки»)

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] WU-6 Confirm-модалка удаления/сброса: текст подтверждения через `subtitle` (kit `aria-describedby` строится только из него — `ModalRoot.tsx:44`) и **называет сущность** («Удалить React?» — вердикт OPEN-10; категории — текст с количеством технологий, OPEN-4, ru-plural), кнопка — «Удалить»; persist-then-dispatch и тосты; ошибка storage → тост + **модалка остаётся открытой** (вердикт OPEN-9 «унифицируем», единообразно с формой).
- [ ] WU-7 i18n: **переиспользовать** `skillsCategoryCount_one/_few/_many/_other` (счётчик, уже в обеих локалях) и `skillsDelete`/`skillsConfirmDelete` (OPEN-10 = дефолт); новые ключи только: `skillsCategoryEmpty` + уточнённое подтверждение категории (OPEN-4) + подписи контролов — в `en.json` + `ru.json`; паритет-тест зелёный; grep на захардкоженные строки блока.
- [ ] WU-8 Тесты: **создать `AdminSkillsPage.test.tsx`** (файла сегодня нет) и закрепить в нём модальные критерии SPEC (открытие/закрытие модалок, Save-потоки, confirm); формы-тесты (SkillCategoryForm/TechnologyForm) прогнать без правок — модалки заворачивает страница. (`SkillsEditorList.test.tsx` переписан под per-category DOM в WU-1.)
- [ ] WU-9 Гейты: `npm run validate`; `check:axe` (0 регрессий); `check:bundle` (лимит 737280 B); `check:public-api`.
- [ ] Git flow: реализация на `feat/admin-skills-edit` от `dev` → DRAFT PR в начале → `gh pr ready` при зелёных гейтах → squash merge + удаление ветки **автоматически при зелёных проверках** (auto-режим, согласован владельцем 2026-10-10).

## Заметки

- WU-0 закрыт 2026-10-10: вердикты OPEN-1…OPEN-10 получены, пара переведена в `approved`; правки плана после approve идут вместе с кодом (правило 3).
- WU-1 выполнен 2026-10-10: блоки категорий (порядок хранилища, OPEN-6) с h3 + Badge plural-счётчика (OPEN-8), `emptyState` категории (OPEN-7, ключ `skillsCategoryEmpty` добавлен в обе локали), блочные действия в шапке блока (OPEN-3), per-block `page`/`sort`; `SkillsEditorList.test.tsx` переписан (15/15), `npm run validate` зелёный.
- WU-2 + WU-3 закрыты одним коммитом 2026-10-10 (отклонение от плана, правило 3): размер-стейт без обработчика `onPageSizeChange` был бы мёртвым кодом, поэтому «размер по умолчанию 5 + опции 5/10/20 + kit `PageSizeGroup` + сброс страницы на 1 + clamp A10» сделаны вместе — дефолт 5 (OPEN-1), per-block размер, тесты на независимость контролов; `SkillsEditorList.test.tsx` 17/17.
- WU-5 закрыт 2026-10-10 (коммит `3c3cdc7`, выполнён ДО WU-4 — так и требовал порядок «после WU-5»): страница владеет единой формой-модалкой (`isOpen` по `form !== null`, title из формы, `subtitle` = `categoryId` техформы — «как сейчас muted-строкой»); формы потеряли свой h2/intro (заголовок — шапка модалки, `ModalHeader` даёт dialog its accessible name, иначе axe `aria-dialog-name` на `/admin/skills`), `.intro` удалён из SCSS; create-Save теперь закрывает через `onExitEdit` (A7), Cancel/ESC/оверлей — через страницу (A8), overlay модалки гарантирует A12 (confirm в списке недостижим при открытой форме). Форм-тесты прогнаны БЕЗ правок, `npm run validate` зелёный; тесты модальных критериев — WU-8.
- WU-4 закрыт 2026-10-10 (коммит `408ab37`, тест-only): placements закреплены явным тестом — section header (add category + reset), block header ровно `[edit category, add tech, delete]`, row column ровно `[edit tech, delete]` (SPEC); 18/18.
