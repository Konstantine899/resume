---
status: done
epic: rtk-query-stub
issue: 279
created: '2026-10-17'
verified: '2026-10-17'
spec: SPEC.md
---

# SPEC — shared/api (заглушка RTK Query, трек B плана миграции rev.3)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел
> Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_contact_migration.md`, rev.3
> (§3.7 аменда владельца 2026-10-17: «RTK Query выполняй, но пока как
> заглушки; когда будет реальный сервер — будет проще мигрировать»).
> Companion: [TODO.md](./TODO.md). Язык: русский (правило владельца).

## Цель

Создать каркас RTK Query-инфраструктуры (`src/shared/api/`): `createApi` с
заглушечным `stubBaseQuery` и endpoint'ами Contact-документа, слайс
зарегистрирован в root store (reducer + middleware). **Ноль
runtime-изменений для пользователя**: витрина продолжает читать
синхронно из localStorage-слайса (C6), persist→dispatch нетронут (C7),
endpoint'ы не потребляются UI.

Swap-point при реальном NestJS-сервере: `stubBaseQuery` →
`fetchBaseQuery({ baseUrl })`, DTO-типы уточняются (решение D3 плана).
Режим сосуществования сервер/localStorage (варианты 1/2/3, план §3.3)
согласуется при реальном сервере, НЕ здесь.

## Контекст (факты, проверено 2026-10-17)

- FSD-матрица: `app → [shared]` ТОЛЬКО — api-слайс обязан жить в `shared`,
  иначе `app/providers/StoreProvider.tsx` не сможет его подключить.
- `configureStore` — единственный, `StoreProvider.tsx:27`
  (`configureStore({ reducer: reducers })`, reducer-маппа инжектится из
  composition root `src/storeReducers.ts`).
- `shared` не может импортировать `entities` → DTO Contact-документа
  объявляются ЛОКАЛЬНО в `shared/api/types.ts` (структурное зеркало
  конверта `{v:1, content}`, не импорт).
- `@reduxjs/toolkit ^2.13.0` — `createApi` входит в пакет, отдельной
  зависимости нет. Библиотечная готовность подтверждена планом rev.2 §0.3.
- Layout-прецедент shared-модуля: `shared/lib/imageDir/`
  (`модуль.ts` + `index.ts`-баррел + `модуль.test.ts`).
- API-инфраструктуры в репо НЕТ (0 совпадений `createApi|fetchBaseQuery|
injectEndpoints|createAsyncThunk` в src/, кроме swap-note) — этот эпик
  создаёт первую.

## Требования

- **R-1** — `src/shared/api/apiSlice.ts`: `createApi({ reducerPath: 'api',
baseQuery: stubBaseQuery, ... })`.
- **R-2** — `stubBaseQuery` детерминированно возвращает
  `{ error: { status: 503, data: { message } } }` с фиксированным
  сообщением «backend not configured» — БЕЗ сети, промисов, таймеров.
- **R-3** — endpoint'ы Contact-документа: `getContactContent` (query) и
  `updateContactContent` (mutation, PUT). Пути — постоянные
  (`/contact`), с комментарием: wire-контракт утверждается при реальном
  сервере (D3).
- **R-4** — DTO-типы локально в `shared/api/types.ts` (структурное
  зеркало `{v:1, content}`; не импортируются из entities).
- **R-5** — регистрация в store: `api: apiSlice.reducer` в
  `src/storeReducers.ts` + `apiSlice.middleware` в `StoreProvider`
  (`getDefaultMiddleware().concat(...)`). Оба — иначе endpoint'ы не
  работают и при реальном сервере придётся вспоминать.
- **R-6** — баррел `src/shared/api/index.ts` (публичный вход
  `@/shared/api`; importers — StoreProvider, storeReducers, тесты).
- **R-7** — ноль runtime-изменений: ни один компонент/витрина не
  импортирует endpoint'ы; существующие тесты C6/C7 (AdminContact,
  HomePage, AdminContactPage) зелёные БЕЗ правок.

## Гейты

- `npm run validate` — EXIT 0 (public-api 37/37).
- Точный vitest: `src/shared/api` + AdminContact + AdminContactPage +
  HomePage — зелёный.
- `check:axe` — 0 регрессий (baseline 4).
- `check:bundle` — RTK Query оседает в main (storeReducers в основном
  чанке); если сумма превышает кап `total.maxSize` — подъём капа по
  auto-mode прецеденту #258/#227 с описанием в `performance-budget.json`.

## Известные ограничения (зафиксировано, не чинится)

- Endpoint'ы мертвы для UI — это осознанная заглушка (§3.7).
- Wire-format (`{v:1, content}` как DTO или адаптер) НЕ утверждён — D3
  отложена до реального сервера.
- `storage.test.ts`/`ContactEditorForm.test.tsx` остаются на localStorage-
  моках до окончательной миграции (план §3.6).

## Amendment — SiteSettings (2026-10-30)

### Contract

- `getSiteSettings` — `GET /site/settings`, returns `SiteSettingsDto { resumeUrl: string | null }`.
- `updateSiteSettings` — `PUT /site/settings`, admin-only, body `{ resumeUrl?: string | null }`.
- Transport: URL is HTTPS-only; empty string invalid (must use `null` for absence).
- Invalid response/empty backend: `resumeUrl` becomes `null`.

### Behaviour by implementation

- `UserAvatarMenu` initiates `getSiteSettings`, sets `resumeUrl` or `null`.
- If `resumeUrl` is empty/whitespace or null, download link falls back to `/contact`.
- Empty `resumeUrl` is therefore represented as a normal link to `/contact` in the UI (hidden absence, not disabled control): keeps discoverable contact path and avoids exposing a disabled actionable control to assistive tech.
- `updateSiteSettings` exists as RTK mutation returning updated `SiteSettingsDto`.
- Optimistic concurrency is not implemented (singleton replace).
- UI edit field is not present yet; admin changes are not wired; hidden field remains an option.
