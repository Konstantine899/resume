---
status: draft
epic: technologies-crud
issue: 258
created: '2026-10-16'
spec: SPEC.md
---

# TODO — features/AdminTechnologies (админ-каталог технологий)

> Сгорает по мере работы: пункт выполнен → удаляется (AGENTS.md, Spec-driven features).
> Контракт — [SPEC.md](./SPEC.md). Язык: русский (правило владельца).

## WU-0 — Каркас

- [ ] Issue #258 создан; ветка `feat/258-technologies-crud` от `origin/dev`;
      DRAFT PR открыт (`--base dev`).
- [ ] `spec/SPEC.md` (status `draft` → `approved` перед WU-1) + `spec/TODO.md`
      созданы и добавлены в git (проверить `git status`, негация `.gitignore`).

## WU-1 — entities/Technology (TDD RED → GREEN)

- [ ] `model/types/types.ts` — `Technology { key, url, invertInDark? }` (TechIcon-парity).
- [ ] `model/schemes/schema.ts` + `schema.test.ts` — record + envelope `{v:1, technologies}`.
- [ ] `model/constants/constants.ts` — сид из 14 записей TECH_ICONS (дословно).
- [ ] `model/services/storage.ts` + тест — ключ `technologies`,
      read → null при любой нечитаемости, persist возвращает boolean (стиль AdminMyWork).
- [ ] `model/slices/technologiesSlice.ts` + тест — add/update/remove;
      ленивая гидрация `state ?? readTechnologies() ?? seedTechnologies()` (D5).
- [ ] `model/selectors/selectors.ts` — `selectAllTechnologies` /
      `selectTechnologyKeys` с seed-fallback (D4), не бросают.
- [ ] `lib/utils.ts` `resolveTechIcons(keys): TechIcon[]` + тест
      (defensive skip + warn; localStorage → seed) — тесты из `entities/Project/lib/utils.test.ts`.
- [ ] Корневой `index.ts` — именованные экспорты (публичный API сущности).
- [ ] `storeReducers.ts` += `technologies: technologiesReducer` (глубокий импорт).

## WU-2 — Перевод entities/Project и потребителей (D2/D3)

- [ ] `ProjectSchema.techIcons` → `z.array(z.string()).max(20)`; убрать
      `TECH_ICONS`/`TECH_ICON_KEYS` из schema.ts; тест `schema.test.ts:87` ПЕРЕПИСАН
      (принимает произвольную строку, отклоняет >20 и не-строки).
- [ ] Удалить `TECH_ICONS` из `constants.ts` (+ баррел `entities/Project/index.ts`,
      устаревшие комментарии в `types.ts`); `constants.test.ts` не ссылается на него.
- [ ] `resolveTechIcons` удалён из `entities/Project/lib/utils.ts` (+ тесты перенесены);
      баррел обновлён.
- [ ] `features/MyWork/ui/MyWork/MyWork.tsx:101` — импорт `resolveTechIcons` из
      `@/entities/Technology`.
- [ ] `projectFormSchema.ts` → фабрика `makeProjectFormSchema(validKeys)` (`.refine`);
      `fieldSchemas.ts` — techIcons-слайс через фабрику; тесты membership обновлены.
- [ ] `ProjectForm.tsx:115` и `FieldEditForm.tsx:114` —
      `useSelector(selectTechnologyKeys)` вместо `Object.keys(TECH_ICONS)`.

## WU-3 — features/AdminTechnologies (TDD)

- [ ] `ui/TechnologyForm/` — форма (RHF + zodResolver фабрики, key/iconUrl/invertInDark
      kit Select) + SCSS + тесты.
- [ ] `ui/TechnologiesList/` — витрина (DataTable PAGE_SIZE=12, .cellActions nowrap,
      EmptyState, confirm-модалка с guard D6 через проп `usedKeys`) + SCSS + тесты
      (в т.ч. поведение guard).
- [ ] Баррел `index.ts` — только то, что нужно странице (не инстанцировать RHF-форму
      в главном чанке — `resume-lazy-rhf-chunk`).

## WU-4 — Страница, маршрут, сайдбар, i18n

- [ ] `pages/Admin/ui/AdminTechnologiesPage/` + тест (page-owned modal state:
      create/edit/delete/guard/ESC/единственный диалог; харнес AdminSkillsPage).
- [ ] `routerConfig.tsx` — lazy-ребёнок `technologies`; `AppRouter.test.tsx` 7 → 8.
- [ ] `AdminLayout.tsx` — `<Link> adminNavTechnologies` + assertion в `AdminLayout.test.tsx`.
- [ ] i18n-ключи в `en.json` + `ru.json` (плоские); parity-тест зелёный.
- [ ] `usedKeys`-винiring (D6): страница строит из `selectAllProjects`.

## WU-5 — Гейты (по порядку)

- [ ] prettier-check по тронутым файлам; `npm run validate`.
- [ ] `npm run check:spec`.
- [ ] `npm run build` + `npm run check:bundle` (кап `total.maxSize` при необходимости).
- [ ] `scripts/purge-axe-check.mjs`: PATHS += `/admin/technologies`;
      `npm run check:axe` — 0 регрессий.

## WU-6 — Мерж

- [ ] push; `gh pr ready`; poll `gh pr checks`; `gh pr merge --squash --delete-branch`.
- [ ] `gh issue close 258` (ручное закрытие — `Closes #N` не срабатывает на dev-мержах).
- [ ] `git checkout dev && git pull origin dev`.
