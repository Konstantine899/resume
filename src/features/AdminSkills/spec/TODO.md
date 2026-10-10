---
status: approved
spec: SPEC.md
---

# TODO — features/AdminSkills (блок «Навыки»)

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] WU-8 Тесты: **создать `AdminSkillsPage.test.tsx`** (файла сегодня нет) и закрепить в нём модальные критерии SPEC (открытие/закрытие модалок, Save-потоки, confirm); формы-тесты (SkillCategoryForm/TechnologyForm) прогнать без правок — модалки заворачивает страница. (`SkillsEditorList.test.tsx` переписан под per-category DOM в WU-1.)
- [ ] WU-9 Гейты: `npm run validate`; `check:axe` (0 регрессий); `check:bundle` (лимит 737280 B); `check:public-api`.
- [ ] Git flow: реализация на `feat/admin-skills-edit` от `dev` → DRAFT PR в начале → `gh pr ready` при зелёных гейтах → squash merge + удаление ветки **автоматически при зелёных проверках** (auto-режим, согласован владельцем 2026-10-10).

## Заметки

- WU-0 закрыт 2026-10-10: вердикты OPEN-1…OPEN-10 получены, пара переведена в `approved`; правки плана после approve идут вместе с кодом (правило 3).
- WU-1 выполнен 2026-10-10: блоки категорий (порядок хранилища, OPEN-6) с h3 + Badge plural-счётчика (OPEN-8), `emptyState` категории (OPEN-7, ключ `skillsCategoryEmpty` добавлен в обе локали), блочные действия в шапке блока (OPEN-3), per-block `page`/`sort`; `SkillsEditorList.test.tsx` переписан (15/15), `npm run validate` зелёный.
- WU-2 + WU-3 закрыты одним коммитом 2026-10-10 (отклонение от плана, правило 3): размер-стейт без обработчика `onPageSizeChange` был бы мёртвым кодом, поэтому «размер по умолчанию 5 + опции 5/10/20 + kit `PageSizeGroup` + сброс страницы на 1 + clamp A10» сделаны вместе — дефолт 5 (OPEN-1), per-block размер, тесты на независимость контролов; `SkillsEditorList.test.tsx` 17/17.
- WU-5 закрыт 2026-10-10 (коммит `3c3cdc7`, выполнён ДО WU-4 — так и требовал порядок «после WU-5»): страница владеет единой формой-модалкой (`isOpen` по `form !== null`, title из формы, `subtitle` = `categoryId` техформы — «как сейчас muted-строкой»); формы потеряли свой h2/intro (заголовок — шапка модалки, `ModalHeader` даёт dialog its accessible name, иначе axe `aria-dialog-name` на `/admin/skills`), `.intro` удалён из SCSS; create-Save теперь закрывает через `onExitEdit` (A7), Cancel/ESC/оверлей — через страницу (A8), overlay модалки гарантирует A12 (confirm в списке недостижим при открытой форме). Форм-тесты прогнаны БЕЗ правок, `npm run validate` зелёный; тесты модальных критериев — WU-8.
- WU-4 закрыт 2026-10-10 (коммит `408ab37`, тест-only): placements закреплены явным тестом — section header (add category + reset), block header ровно `[edit category, add tech, delete]`, row column ровно `[edit tech, delete]` (SPEC); 18/18.
- WU-6 закрыт 2026-10-10 (коммит `70d4efb`): confirm-текст переехал из children в `subtitle` модалки (видимый + `aria-describedby`) и называет сущность — `skillsConfirmDelete` получил `{{name}}` (OPEN-10), категория — новый `skillsConfirmDeleteCategory` + `_one/_few/_many/_other` (OPEN-4, ru-plural; счёт ТОЛЬКО при N > 0 — base-ключ без `{{count}}` для пустой); OPEN-9: при ошибке storage ветки удаления делают `setDeleting(false)` вместо `closeModal()` — модалка остаётся открытой для повтора; фокус после открытия — на «Отмена» (`initialFocusRef`). Сайд-фикс: kit `Modal` `initial/finalFocusRef` типы исправлены под React 19 (`RefObject<HTMLElement | null>` — pre-19 тип даёт `current: T` без null). Тест-мок `t` расширен: опции рендерятся как `${key}:${name}:${count}:${number}` (бейджи/пагинация не задеты). 20/20, `npm run validate` зелёный (3330/3330).
- WU-7 закрыт 2026-10-10 (верификация без правок, коммит-док): переиспользование подтверждено (`skillsCategoryCount_*` в бейдже, `skillsDelete`/`skillsReset`/`skillsCancel`/`skillsResetConfirm` — все на месте), новые ключи только `skillsCategoryEmpty` (WU-1) и `skillsConfirmDeleteCategory*` (WU-6) + обогащённый `skillsConfirmDelete={{name}}` — все в ОБЕИХ локалях; паритет-тест 7/7 зелёный; grep по JSX-тексту/aria-label/placeholder/alt/title и русским литералам в блоке — 0 захардкоженных строк.
