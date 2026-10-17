---
status: done
epic: admin-contact-migration
issue: 276
created: '2026-10-17'
verified: '2026-10-17'
spec: SPEC.md
---

# SPEC — features/AdminContact (трек A плана миграции rev.2)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел
> Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_contact_migration.md`, rev.2
> (approved, 2026-10-17). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде —
> i18n-ключи en+ru.
> Режим исполнения: **auto** (владелец, 2026-10-17).

## Цель

Привести `features/AdminContact` к соглашениям соседних CRUD-фич **без
изменения поведения и данных** (трек A плана rev.2). Это: (R1) устаревшие
будуще-временные комментарии о барреле → факт; (R2-α) удаление остатка
OPEN-8/ARCH-1 `model/selectors/index.ts`; (D6=R3-γ) фиксация в SPEC
решения «email-капитал живёт только в форме».

**Трек B (RTK Query + localStorage) НЕ в скоупе** — D1 = только A; в репо
нет API-инфраструктуры (§0.3 плана: 0 совпадений `createApi|fetchBaseQuery|
injectEndpoints`), этап B0 не начат. Трек B отложен до появления
спецификации backend-API.

## Решения владельца D1–D7 (2026-10-17, план §5.1)

| #     | Решение                                                               | Выбор                                                                                                   |
| ----- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| D1    | Цель миграции                                                         | только трек A                                                                                           |
| D2/D3 | RTK Query режим / конверт `{v:1}`                                     | не применимо (D1)                                                                                       |
| D4    | R1 устаревшие комментарии                                             | да, точечно: блок AdminContact в `storeReducers.ts` + `HomePage.tsx`; сиблинг-блоки :23-33 не трогаются |
| D5    | R2 barrel `model/selectors/index.ts`                                  | R2-α: удалить в AdminContact, потребители на явный путь                                                 |
| D6    | R3 email-max в entity-схеме                                           | R3-γ: код не меняется, капитал 120 остаётся в инпуте                                                    |
| D7    | чужая работа (витрина `features/Contact`, swap-комментарии сиблингов) | отложено, не трогается                                                                                  |

## Контракты сохранения (C1–C7, план §1 — заморожены)

Любое нарушение любого из них требует отдельного согласования.

- **C1** Ключ localStorage `resume.contact.content`
  (`model/services/storage.ts`).
- **C2** Full-replace обновления документа: `updateContactContent`
  возвращает payload целиком, без merge.
- **C3** Seed из локалей: `createContactSeed()` из `en.json`/`ru.json`
  (drift-proof), email — из `entities/ContactContent`.
- **C4** Nav-ключ `contact` не редактируется (split-brain гард).
- **C5** Публичное трио `createContactSeed` / `persistContactContent` /
  `removeContactContent` остаётся на барреле (`index.ts`) — его потребляет
  `HomePage.test` (`fsd-imports/tests-public-api-only`).
- **C6** Синхронное чтение витриной: `HomePage` → `useSelector(
selectContactContent)` → `<Contact content={...}>`; витрина store-free.
- **C7** Контракт `persist → dispatch`: persist ПЕРЕД dispatch; при `false`
  — error-тост, стор нетронут; reset = `remove → dispatch → form.reset`.

## Требования

- **R-1 (R1, D4)** — комментарии `storeReducers.ts` (блок AdminContact) и
  `HomePage.tsx` описывают настоящее: баррели ЭКСПОРТИРУЮТ RHF-формы
  (эпики завершены), deep-import нужен для lazy-чанка (resume-lazy-rhf-chunk).
  Сиблинг-блоки AdminJobs/AdminMyWork/AdminSkills НЕ трогаются (D7).
- **R-2 (R2-α, D5)** — `model/selectors/index.ts` удалён; все потребители
  (включая тесты с относительными путями) импортируют
  `model/selectors/selectors` напрямую. `HomePage.tsx` — deep-импорт через
  alias (`@/features/AdminContact/model/selectors/selectors`), НЕ баррель
  фичи (C6/lazy-инвариант).
- **R-3 (D6, R3-γ)** — entity-схема `ContactContentSchema.email` БЕЗ max
  (ОСОЗНАННО: схема валидирует и запись, и чтение — `.max(120)` молча
  затёр бы сохранённый документ → seed-fallback). Капитал 120 — только
  `maxLength` инпута формы. Решение зафиксировано в этом файле.
- **R-4** — гейты §7 зелёные: `npm run validate`, точечный vitest
  AdminContact + AdminContactPage + HomePage, `check:axe` (маршрут
  `/admin/contact` в PATHS), `check:bundle` (RHF не в основном чанке).

## Известные проблемы вне скоупа (зафиксировано, не чинится)

- Русские комментарии витрины `features/Contact` (R4 плана) — отложено (D7).
- Swap-комментарии «will export» сиблингов в `storeReducers.ts:23-33` —
  отложено (D7).
- OPEN-8: `model/selectors/index.ts` barrel остаётся в AdminMyWork и
  AdminJobs — синхронное удаление (R2-β) не выбиралось.
- Email в `ContactContentSchema` без max при form `maxLength=120` —
  решение D6=R3-γ: принятое ограничение, кап только в форме.
- Трек B (RTK Query) — отложен до backend-API-спецификации (B0), план
  rev.2 остаётся контрактом C1–C7 для будущего эпика.

## Гейты

- `npm run validate` — EXIT 0, public-api 37/37.
- `npx vitest run src/features/AdminContact src/pages/Admin/ui/AdminContactPage
src/pages/Home/ui/HomePage` — 66/66.
- `npm run check:axe` — 0 регрессий (baseline 4 known).
- `npm run check:bundle` — 779.3 < 784 KiB.
- CI: 8/8 чеков PR.
