---
status: approved
spec: SPEC.md
---

# TODO — shared/ui/Calendar (+ DatePicker)

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.

## Рабочие единицы

- [ ] Фаза B (вручную): обе компонентные четвёрки + `DatePicker/lib/isoDate.ts` по секции «Планируемые файлы» в SPEC — генератора для `shared` нет.
- [ ] WU-1a (TDD): сначала тесты ISO-парсера — части `2025-12-31` / `2026-01-01` / `2028-02-29` без создания `Date` (правило часовых поясов плана A7); затем `isoDate.ts`.
- [ ] WU-1b (TDD): сначала `Calendar.test.tsx` — каждый клавиатурный сценарий APG (включая пересечение границы месяца, отказ min/max), `value=null` → текущий месяц, без выбора; затем `Calendar.tsx` + `Calendar.module.scss` + `index.ts` (скользящий tabindex, «Сегодня» через токен, отключённые дни).
- [ ] WU-1c: `Calendar.stories.tsx` — темы, min/max, выбранная/пустая, 390px; `npm run validate` (CPU <45%, лог → файл, проверить `$?`, удалить лог) + storybook-test; запустить axe-проверку сторисов (скрипт Table WU-2 или axe-cdn fallback).
- [ ] WU-2 (TDD): `DatePicker.test.tsx` с обёрткой RHF `Controller` (паттерн из тестов форм AdminJobs/AdminSkills) — ISO round-trip, `disabled` блокирует инпут и поповер, некорректный ручной ввод подсвечивается без исключений; затем `DatePicker.tsx` (kit Input + Popover + кнопка очистки, один парсер).
- [ ] WU-3 (i18n): ключи месяцев/дней/aria/«Открыть календарь»/«Очистить» en+ru + тест паритета, `firstDayOfWeek` по языку; записи в `wiki/ui-kit/components-list.md` (по одной на компонент); dual-write gotcha в vault `memory.md` + AGENTS.md.
- [ ] WU-4 (пилот, OPEN-2): `JobForm.tsx` — оба `<input type="date">` → DatePicker, логика A6 current⇄endDate и `minDate` перепривязаны; storage/DTO не тронуты; существующие тесты JobForm проходят с правками только селекторов (доказательство, что форма не сломалась).
- [ ] WU-4 гейты: `npm run validate`; axe `/admin/jobs` 0 новых; `check:bundle` с worktree-дельтой относительно merge-base (лимит 737280 B; ленивый админ-чанк, витрина не тронута).
- [ ] Git flow: ветка `feat/kit-calendar` от `dev` → DRAFT PR открывается в начале → `gh pr ready` при зелёных проверках → squash merge + удаление ветки только после одобрения владельца.
