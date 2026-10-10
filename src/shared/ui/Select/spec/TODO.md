---
status: approved
spec: SPEC.md
---

# TODO — shared/ui/Select

Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица **удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии приёмки живут в SPEC.md, здесь их нет.
Вердикт владельца (2026-10-10): OPEN-1 = A (натив + `base-select`), OPEN-2 = A (все 4 формы).

## Рабочие единицы

- [ ] WU-1 TDD RED: тесты `ui/Select/Select.test.tsx` — пиннинг рендера по `options`; управляемый `onChange(value)`; placeholder-опция; связка `label`/`htmlFor` и `aria-label` без метки; error/disabled/size → модификаторы; отсутствие захардкоженных строк kit.
- [ ] WU-2 GREEN: `ui/Select/Select.tsx` + `Select.module.scss` + `model/types.ts` + `index.ts` — `classNames`/`mapSizeToClass`, closed-стилизация (`appearance: none` + стрелка), блок `@supports (appearance: base-select)`; без клавиатурных хуков (натив бесплатен).
- [ ] WU-3 Сторисы: `Select.stories.tsx` — en+ru (`changeLanguage('en')` первым), обе темы, 390px (инлайн `parameters.viewport.viewports.narrow390`), placeholder/error/disabled/sizes/variants; `npx axe-stories --filter=Select` → 0.
- [ ] WU-4 Пилот (после OPEN-2): заменить 6 нативных select на kit Select в `JobForm.tsx`, `ProjectForm.tsx`, `SkillCategoryForm.tsx`, `TechnologyForm.tsx`; удалить мёртвые `.select` из SCSS фич; форма-тесты зелёные без изменения ассертов значений; axe `/admin` → 0 новых.
- [ ] WU-5 Гейты: `npm run validate`; `check:bundle` worktree-дельта (лимит 737280); axe `/` — 0 регрессий.
- [ ] WU-6 Дуал-врайт: запись Select в `wiki/ui-kit/components-list.md`; заметка в `memory.md`; AGENTS-gotcha — если вскроется неочевидность.
- [ ] Git flow: ветка `feat/kit-select` от `dev` → DRAFT PR в начале → `gh pr ready` при зелёных гейтах → squash merge + удаление ветки.
