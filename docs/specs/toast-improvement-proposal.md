# Proposal: ToastContext Improvements

**Change**: toast-improvements
**Status**: Draft
**Date**: 2026-08-11
**Prior**: SDD explore (toast-improvements session)

---

## Intent

Harden `src/shared/lib/contexts/ToastContext/` (6 files, 500-line test suite) to the in-repo standard proven by Link/Icon/Image/Paragraph: named-only exports, internal-only public surface, and a modernized test harness. Three concrete gaps:

1. `useToast.ts:27` still has `export default useToast` — a dead default export (repo named-only rule; zero `import useToast` consumers, grep-verified). Mirrors IMG-01.
2. `index.ts:6` re-exports the `ToastContext` object publicly, but the ONLY consumer (`useToast.ts:7`) imports it via the direct path `'../../ui/ToastContext'` — zero consumers through the index. Dead public re-export (LNK-05 / IMG-03 internal-only precedent).
3. `ToastContext.test.tsx` (500 lines) uses 3 manual `useEffect`-capture helpers (`createAddToastHelper`, `createToastHelpers`, `createClearAllHelper`, ~40 lines total) and 19 `act()` call sites. The repo's established pattern is `renderHook` + `act` + `result.current` (RTL ^16.3.2 — used across Divider, Icon, AspectRatio, Input hooks, Image hooks, useScrollAnimation, useKeyboardAction, useClickOutside tests). Modernizing the harness removes the capture-helper boilerplate while keeping every assertion and the fake-timer semantics identical.

**Non-breaking gate:** all existing ToastContext test assertions stay green with identical behavior — only the harness mechanism changes (behavioral-noop). Both consumer `vi.mock` factories (`Contact.test.tsx:13`, `Code.test.tsx:7`) provide only `useToast` — unaffected by the index change.

## Scope

### In Scope

- Remove `export default useToast` (`useToast.ts:27`); keep `export const useToast`.
- Drop `ToastContext` from `index.ts` public re-exports; keep `ToastProvider`, `useToast`, and all types. The object stays exported from `ui/ToastContext.tsx` (useToast imports it direct).
- Refactor `ToastContext.test.tsx` harness: replace the 3 capture helpers with `renderHook(() => useToast(), { wrapper: ToastProvider })`; keep `act(...)` around hook calls and `vi.advanceTimersByTime`; keep `cleanupToasts`, fake-timer `beforeEach`/`afterEach`, and all 36 assertions (verified: 36 `expect()` call sites across 21 `it()` blocks).
- Add `@ts-expect-error` compile probes locking the context type surface (Link LNK-16 / Icon ICR-06 precedent): `addToast` wrong message type, `addToast` wrong `ToastType`, `removeToast` non-string id.

### Out of Scope

- `src/shared/ui/Toast` component itself (already Senior+ per tracker `f974ce7` refactor).
- Consumer migration (useContactForm, Code, App, stories) — none affected, nothing to change.
- `clearAll` exit-animation timing semantics, `crypto.randomUUID()` id strategy, queue/limit features.
- Storybook plays for ToastContext (no stories file exists for the context; Toast stories already covered).

## Approach

1. **`useToast.ts`** — delete `export default useToast` (line 27). Named-only from birth afterwards.
2. **`index.ts`** — change to `export { useToast } from './lib/hooks/useToast'; export { ToastProvider } from './ui/ToastContext';` + types. `ToastContext` object remains exported from the component file (internal use by useToast).
3. **`ToastContext.test.tsx`** — replace helpers with:
   ```tsx
   const renderToastHook = () => renderHook(() => useToast(), { wrapper: ToastProvider });
   // in tests:
   const { result } = renderToastHook();
   act(() => result.current.addToast('Test message', 'success'));
   ```
   `act()` stays (React 18 requires it for updates triggered outside events — this is NOT an act-removal change). Fake timers, `cleanupToasts`, and assertion counts unchanged.
4. **`@ts-expect-error` probes** — appended to the `useToast Hook` describe block; consumed by `type-check:strict` (no unused diagnostics).

## Affected Areas

| Area                                                                         | Impact                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/shared/lib/contexts/ToastContext/lib/hooks/useToast.ts`                 | Modified — default export removed (1 line)                         |
| `src/shared/lib/contexts/ToastContext/index.ts`                              | Modified — ToastContext off public index (1 line)                  |
| `src/shared/lib/contexts/ToastContext/ui/ToastContext.test.tsx`              | Modified — harness refactor (~60 lines churn, 0 assertion changes) |
| Consumers (`App.tsx`, `preview.tsx`, `Code.*`, `Contact/*`, `Toast.stories`) | None — API surface for consumers unchanged                         |

## Consumer Impact

| Consumer                                                        | Import                              | Risk                                                        |
| --------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| `App.tsx:11`, `.storybook/preview.tsx:2`, `Code.stories.tsx:15` | `ToastProvider` from index          | None — export kept                                          |
| `useContactForm.ts:5`, `Code.tsx:1`                             | `useToast` from index               | None — named export kept                                    |
| `Contact.test.tsx:13`, `Code.test.tsx:7`                        | `vi.mock` factory (`useToast` only) | None — no ToastContext/ToastProvider reference in factories |
| `Toast.stories.tsx:8-9`                                         | direct-path imports                 | None — untouched                                            |

## Risks

| Risk                                                                                     | Likelihood | Mitigation                                                                                                          |
| ---------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `renderHook` wrapper + Portal: toasts render into `document.body` and leak between tests | Low        | keep `cleanupToasts` (already handles stray `[data-testid="toast"]` nodes); `renderHook` unmounts wrapper per test  |
| Harness refactor drifts assertion behavior                                               | Low        | behavioral-noop gate — same 36 assertions, same fake-timer windows; diff review                                     |
| `@ts-expect-error` probe fails to error (type surface wider than expected)               | Low        | probes written against the literal `ToastContextType` signatures; `type-check:strict` consumes them or flags unused |
| Index change breaks a hidden consumer                                                    | Low        | grep-verified zero index consumers of `ToastContext` object; direct-path import unchanged                           |

## Rollback Plan

- Every change is additive-neutral: `git revert <commit>` restores the default export / index line; the test harness reverts to the capture helpers (assertions identical).
- Guard: single commit per concern (exports → harness) so any revert is surgical.

## Dependencies

- In-repo only: RTL `renderHook` (^16.3.2, already used across the suite), `ToastProvider` as the renderHook wrapper. No new npm packages.
- Precedent copies: IMG-01 (named-only), LNK-05/IMG-03 (internal-only surface), Link LNK-16 / Icon ICR-06 (`@ts-expect-error` probes), Divider/Icon hook-test style (`renderHook` + `act`).

## Success Criteria

- [ ] `type-check:strict` + `lint` (0 warnings) on the 3 touched files
- [ ] `npx vitest run src/shared/lib/contexts/ToastContext` — all existing assertions green (behavioral-noop, same counts)
- [ ] `npx vitest run src/features/Contact src/shared/ui/Code` — vi.mock consumers unaffected
- [ ] `grep "export default useToast"` → no matches; `index.ts` no longer exports `ToastContext`
- [ ] `@ts-expect-error` probes consumed (no unused-diagnostic errors under `type-check:strict`)
- [ ] `npm run analyze:dead-code` — no new dead names

## Recommendation + Effort

| Item                                    | Effort | Recommendation |
| --------------------------------------- | ------ | -------------- |
| Named-only export removal (useToast)    | 0.25h  | **Yes — core** |
| ToastContext off public index           | 0.25h  | **Yes — core** |
| Test harness modernization (renderHook) | 1.5h   | **Yes — core** |
| `@ts-expect-error` type-surface probes  | 0.5h   | **Yes — core** |

**Total: ~2.5h dev-time**, all additive-neutral, zero consumer impact, single-PR-sized.

**Next step:** `sdd-spec` for `toast-improvements`.
