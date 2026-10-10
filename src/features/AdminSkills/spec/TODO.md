---
status: approved
spec: SPEC.md
---

# TODO — features/AdminSkills (блок «Навыки»)

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] WU-2 Пагинация: `pageSizeOptions = [5, 10, 20]` (вердикт OPEN-1), размер по умолчанию 5 (вердикт 2026-10-10), clamp страницы при удалении/смене размера (A10).
- [ ] WU-3 Контрол размера страницы: kit `PageSizeGroup` рендерится `DataTable` первой строкой каждой таблицы (`pageSizeOptions`/`onPageSizeChange` прокидывает контейнер блока; `onPageSizeChange` → локальный размер + сброс страницы на 1; kit сам гасит контрол при 0 строк — `DataTable.tsx:150–151`).
- [ ] WU-4 Кнопки: финальная проверка placements «Добавить категорию»/«Редактировать технологию» после WU-5 (перенос «Добавить технологию» в шапку блока — вердикт OPEN-3, `data-testid` и тесты строк — выполнены в WU-1).
- [ ] WU-5 Модалки форм (вердикт OPEN-2): обёртка `SkillCategoryForm`/`TechnologyForm` в `Modal` (`isOpen`/`onClose`, `subtitle` категории), закрытие Cancel/ESC/оверлей (A8) и закрытие после успешного Save (A7); состояния модалок — на странице (одна открытая, A12).
- [ ] WU-6 Confirm-модалка удаления/сброса: текст подтверждения через `subtitle` (kit `aria-describedby` строится только из него — `ModalRoot.tsx:44`) и **называет сущность** («Удалить React?» — вердикт OPEN-10; категории — текст с количеством технологий, OPEN-4, ru-plural), кнопка — «Удалить»; persist-then-dispatch и тосты; ошибка storage → тост + **модалка остаётся открытой** (вердикт OPEN-9 «унифицируем», единообразно с формой).
- [ ] WU-7 i18n: **переиспользовать** `skillsCategoryCount_one/_few/_many/_other` (счётчик, уже в обеих локалях) и `skillsDelete`/`skillsConfirmDelete` (OPEN-10 = дефолт); новые ключи только: `skillsCategoryEmpty` + уточнённое подтверждение категории (OPEN-4) + подписи контролов — в `en.json` + `ru.json`; паритет-тест зелёный; grep на захардкоженные строки блока.
- [ ] WU-8 Тесты: **создать `AdminSkillsPage.test.tsx`** (файла сегодня нет) и закрепить в нём модальные критерии SPEC (открытие/закрытие модалок, Save-потоки, confirm); формы-тесты (SkillCategoryForm/TechnologyForm) прогнать без правок — модалки заворачивает страница. (`SkillsEditorList.test.tsx` переписан под per-category DOM в WU-1.)
- [ ] WU-9 Гейты: `npm run validate`; `check:axe` (0 регрессий); `check:bundle` (лимит 737280 B); `check:public-api`.
- [ ] Git flow: реализация на `feat/admin-skills-edit` от `dev` → DRAFT PR в начале → `gh pr ready` при зелёных гейтах → squash merge + удаление ветки **автоматически при зелёных проверках** (auto-режим, согласован владельцем 2026-10-10).

## Заметки

- WU-0 закрыт 2026-10-10: вердикты OPEN-1…OPEN-10 получены, пара переведена в `approved`; правки плана после approve идут вместе с кодом (правило 3).
- WU-1 выполнен 2026-10-10: блоки категорий (порядок хранилища, OPEN-6) с h3 + Badge plural-счётчика (OPEN-8), `emptyState` категории (OPEN-7, ключ `skillsCategoryEmpty` добавлен в обе локали), блочные действия в шапке блока (OPEN-3), per-block `page`/`sort`; `SkillsEditorList.test.tsx` переписан (15/15), `npm run validate` зелёный.
