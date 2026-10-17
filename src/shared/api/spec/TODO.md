---
status: approved
spec: SPEC.md
---

# TODO — shared/api (эпик rtk-query-stub, rev.1)

Контракт и критерии — [SPEC.md](./SPEC.md). Режим: **auto** (аменда плана
rev.3 §3.7). Выполненные пункты УДАЛЯЮТСЯ.

## WU-1 — TDD: тесты apiSlice (RED)

- [ ] `src/shared/api/apiSlice.test.ts`: stubBaseQuery детерминирован
      (503 + фикс. сообщение, без сети); endpoint'ы существуют и имеют
      нужный тип (query/mutation); dispatch `getContactContent.initiate`
      на реальном сторе отклоняется заглушкой.
- [ ] Guard R-5/R-7: в `storeReducers` есть ключ `api`; ни один компонент
      не импортирует endpoint'ы (греп-ассерт).

## WU-2 — реализация (GREEN)

- [ ] `types.ts` (DTO-зеркало), `apiSlice.ts` (createApi + stubBaseQuery +
      endpoints), `index.ts` (баррел).
- [ ] Регистрация: `storeReducers.ts` (`api: apiSlice.reducer`) +
      `StoreProvider.tsx` (middleware concat).

## WU-3 — гейты (SPEC «Гейты»)

- [ ] validate / точечный vitest / axe / bundle (кап по необходимости).
- [ ] DRAFT PR `--base dev` → CI → merge (auto) → issue #279.

## WU-4 — burn-down

- [ ] Пара → `status: done`; план → done; dual-write vault + AGENTS.md.
