# ToastContext Improvement Specification

**Change**: toast-improvements
**Status**: Draft
**Date**: 2026-08-11
**Prior**: `docs/specs/toast-improvement-proposal.md` (SDD propose, user-approved)
**Priority**: 3 CRITICAL + 1 ADDED (~2.5h core, 0h deferred)

---

## Scope

This specification hardens `src/shared/lib/contexts/ToastContext/` (6 files, 500-line test suite) to the in-repo standard proven by Link/Icon/Image/Paragraph: named-only exports, internal-only public surface, and a modernized test harness. Three concrete gaps: (1) a dead default export (`useToast.ts:27` — zero `import useToast` consumers, grep-verified; IMG-01 named-only precedent); (2) a dead public re-export of the `ToastContext` object (`index.ts:6` — its ONLY consumer, `useToast.ts:7`, imports it via the direct path `'../../ui/ToastContext'`; LNK-05/IMG-03 internal-only precedent); (3) a 500-line test harness relying on 3 manual `useEffect`-capture helpers (~40 lines) and 19 `act()` call sites, while the repo's established pattern is `renderHook` + `act` + `result.current` (RTL ^16.3.2 — Divider, Icon, AspectRatio, Input hooks, Image hooks, useScrollAnimation, useKeyboardAction, useClickOutside).

**Non-breaking gate:** all existing ToastContext test assertions stay green with identical behavior — only the harness mechanism changes (behavioral-noop). Verified assertion inventory: 36 `expect()` call sites across 21 `it()` blocks. Both consumer `vi.mock` factories (`Contact.test.tsx:13`, `Code.test.tsx:7`) provide only `useToast: () => ({ addToast: vi.fn() })` — no `ToastContext`/`ToastProvider` reference, so the index change cannot affect them.

| #   | Requirement                                           | Area   | Priority | Type     |
| --- | ----------------------------------------------------- | ------ | -------- | -------- |
| 1   | Named-only exports — remove `export default useToast` | TST-01 | CRITICAL | MODIFIED |
| 2   | `ToastContext` off the public index                   | TST-02 | CRITICAL | MODIFIED |
| 3   | Test harness modernization (`renderHook`)             | TST-03 | CRITICAL | MODIFIED |
| 4   | `@ts-expect-error` type-surface probes                | TST-04 | CRITICAL | ADDED    |

**Documentation deliverable (no requirement):** none — the ToastContext slice has no `ui-kit-contract.md` row (contexts live outside the shared/ui inventory).

**Out of scope:** `src/shared/ui/Toast` component (Senior+ per `f974ce7` refactor); consumer migration (useContactForm, Code, App, stories — none affected); `clearAll` exit-animation timing semantics; `crypto.randomUUID()` id strategy; queue/limit features; Storybook plays for ToastContext (no stories file exists for the context; Toast stories already covered).

---

## ADDED Requirements

### Requirement TST-04: `@ts-expect-error` type-surface probes

The system SHALL append `@ts-expect-error` compile probes to the `useToast Hook` describe block in `ToastContext.test.tsx`, locking the `ToastContextType` surface (Link LNK-16 / Icon ICR-06 precedent — probes pass genuinely invalid values, no casts, so the directives are consumed). Probes: `addToast` with a non-string `message`, `addToast` with an invalid `ToastType`, `removeToast` with a non-string `id`. The probes SHALL be consumed by `type-check:strict` (no unused-diagnostic errors) and SHALL be type-only — zero runtime effect on assertions.

#### Scenario: wrong message type rejected

- GIVEN a probe `// @ts-expect-error — message must be a string` above `addToast(42, 'success')`
- WHEN `type-check:strict` runs
- THEN the `@ts-expect-error` directive MUST be consumed (no "Unused '@ts-expect-error' directive" diagnostic)

#### Scenario: invalid ToastType rejected

- GIVEN a probe above `addToast('x', 'invalid')`
- WHEN type-checking
- THEN the directive MUST be consumed (signature rejects the union)

#### Scenario: non-string id rejected

- GIVEN a probe above `removeToast(123)`
- WHEN type-checking
- THEN the directive MUST be consumed

#### Scenario: zero runtime impact

- GIVEN the probes compiled and the suite running
- THEN no new test assertions SHALL appear and the 36-assertion count SHALL be unchanged (type-only surface lock)

---

## MODIFIED Requirements

### Requirement TST-01: Named-only exports — remove `export default useToast`

The system SHALL delete the `export default useToast;` line (`useToast.ts:27`), keeping the existing `export const useToast`. Grep-verified zero default-import consumers (`import { useToast }` used everywhere), so this is a pure dead-surface removal (IMG-01 precedent).

(Previously: `useToast.ts` exported BOTH `const useToast` and a default alias — the default had zero consumers)

#### Scenario: no default export

- GIVEN the updated `useToast.ts`
- WHEN inspected
- THEN the file MUST NOT contain `export default`
- AND `export const useToast` MUST remain

#### Scenario: consumers compile

- GIVEN `useContactForm.ts:5` and `Code.tsx:1` importing `{ useToast }`
- WHEN `type-check:strict` runs
- THEN no import errors MUST be reported

#### Scenario: knip clean

- GIVEN the removed default export
- WHEN `npm run analyze:dead-code` runs
- THEN no default-export finding MUST appear for the ToastContext slice

### Requirement TST-02: `ToastContext` off the public index

The system SHALL remove the `ToastContext` object from the `index.ts` re-export list, keeping `useToast`, `ToastProvider`, and all types (`ToastContextType`, `ToastState`) exported. The object SHALL remain exported from `ui/ToastContext.tsx` because `useToast.ts:7` imports it via the direct path `'../../ui/ToastContext'` — the ONLY consumer. Internal-only surface precedent: LNK-05 (validator off index) / IMG-03 (validators off index).

(Previously: `index.ts:6` re-exported the `ToastContext` object publicly with zero index-path consumers — grep-verified: `App.tsx`, `.storybook/preview.tsx`, `Code.stories.tsx` import `ToastProvider`; `useContactForm.ts`, `Code.tsx` import `useToast`; nobody imports `ToastContext` from the index)

#### Scenario: ToastContext absent from public API

- GIVEN the updated `index.ts`
- WHEN inspected
- THEN `ToastContext` MUST NOT be exported from the index
- AND `ToastProvider`, `useToast`, `ToastContextType`, `ToastState` MUST still be exported

#### Scenario: useToast still works

- GIVEN `useToast.ts` importing the context object from the direct path
- WHEN `type-check:strict` runs
- THEN the import MUST resolve (the object stays exported from the component file)

#### Scenario: consumers unaffected

- GIVEN the 6 consumer sites (`App.tsx`, `preview.tsx`, `Code.stories.tsx`, `useContactForm.ts`, `Code.tsx`, and the 2 `vi.mock` factories)
- WHEN the suites run
- THEN no test or compile MUST break (verified: mock factories reference only `useToast`)

### Requirement TST-03: Test harness modernization (`renderHook`)

The system SHALL refactor `ToastContext.test.tsx` (500 lines) replacing the 3 manual `useEffect`-capture helpers — `createAddToastHelper`, `createToastHelpers`, `createClearAllHelper` (~40 lines) — with `renderHook(() => useToast(), { wrapper: ToastProvider })` from `@testing-library/react` (RTL ^16.3.2, repo-wide pattern). `act(...)` SHALL REMAIN around hook-triggered state updates and `vi.advanceTimersByTime` (React 18 requires `act` for updates outside events — this is NOT an act-removal change). `cleanupToasts`, fake-timer `beforeEach`/`afterEach`, `EXIT_ANIMATION_DURATION` windows, and all 36 assertions SHALL stay unchanged. Behavioral-noop gate: same assertions, same counts, same timer semantics — only the harness mechanism changes.

(Previously: tests captured the hook API via `useEffect`-mounted helper components that set test-scoped state; 19 `act()` call sites — 16 wrapping hook calls, 3 wrapping `vi.advanceTimersByTime`)

#### Scenario: renderHook exposes the hook API

- GIVEN `const { result } = renderToastHook()` where `renderToastHook = () => renderHook(() => useToast(), { wrapper: ToastProvider })`
- WHEN the test calls `result.current.addToast('msg', 'success')`
- THEN `result.current` MUST expose `addToast`, `removeToast`, `clearAll`, `toasts`, `isClearing` — the same surface the helpers captured

#### Scenario: act-wrapped addToast renders a toast

- GIVEN `const { result } = renderToastHook(); act(() => result.current.addToast('Test message', 'success'))`
- WHEN the render settles
- THEN `screen.getByTestId('toast')` MUST be present with the message and the `success` type class (assertions identical to the pre-refactor suite)

#### Scenario: fake-timer semantics unchanged

- GIVEN the auto-close and `clearAll` tests using `vi.advanceTimersByTime`
- WHEN they run on the refactored harness
- THEN `act(() => { vi.advanceTimersByTime(duration); })` MUST drive the same exit-animation windows and the same final `toasts: []` / `isClearing: false` states — assertion-by-assertion parity

#### Scenario: behavioral-noop gate

- GIVEN the fully refactored test file
- WHEN the suite runs
- THEN all 36 `expect()` call sites across the 21 `it()` blocks MUST pass with zero assertion text changed

#### Scenario: cleanup preserved

- GIVEN the refactored file
- WHEN tests run in sequence
- THEN `cleanupToasts` MUST still remove stray `[data-testid="toast"]` nodes from `document.body` between tests (renderHook unmounts the wrapper per test; the helper stays as defense-in-depth)

---

## Test Expectations

| Area                                   | Component     | Tests                                                                   | Type         |
| -------------------------------------- | ------------- | ----------------------------------------------------------------------- | ------------ |
| Existing ToastContext suite            | ToastContext  | 36 assertions / 21 `it()` — MUST stay green UNCHANGED (behavioral-noop) | Unit         |
| `@ts-expect-error` type-surface probes | ToastContext  | 3                                                                       | Compile-time |
| vi.mock consumers                      | Contact, Code | suites green unchanged                                                  | Unit         |
| Knip / dead-code                       | static        | no default-export or dead-name findings                                 | Static       |

Existing tests MUST remain behaviorally unchanged through the harness refactor (behavioral-noop gate).

## Implementation Order

```
Phase 1 (~0.5h) — Exports
├── TST-01: delete `export default useToast` (useToast.ts:27)
├── TST-02: drop `ToastContext` from index.ts re-exports
├── Verify: type-check:strict + grep no-default + analyze:dead-code

Phase 2 (~1.5h) — Harness
├── TST-03: replace 3 capture helpers with renderHook + act (keep cleanupToasts, fake timers, 36 assertions)
├── Behavioral-noop gate: full suite green, 36/36

Phase 3 (~0.5h) — Probes
├── TST-04: 3 @ts-expect-error probes in the useToast Hook describe block
├── Verify: type-check:strict consumes probes (no unused-diagnostic errors)

Phase 4 — Verification
├── type-check:strict + lint (0 warnings) on the 3 touched files
├── npx vitest run src/shared/lib/contexts/ToastContext (36 green)
├── npx vitest run src/features/Contact src/shared/ui/Code (vi.mock consumers unaffected)
├── npm run analyze:dead-code (no new dead names)
```

## Risk Assessment

| Risk                                                                                     | Impact | Mitigation                                                                                                             |
| ---------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `renderHook` wrapper + Portal: toasts render into `document.body` and leak between tests | Low    | keep `cleanupToasts` (already handles stray `[data-testid="toast"]` nodes); `renderHook` unmounts the wrapper per test |
| Harness refactor drifts assertion behavior                                               | Low    | behavioral-noop gate — same 36 assertions, same fake-timer windows; diff review                                        |
| `@ts-expect-error` probe fails to error (type surface wider than expected)               | Low    | probes written against the literal `ToastContextType` signatures; `type-check:strict` consumes them or flags unused    |
| Index change breaks a hidden consumer                                                    | Low    | grep-verified zero index consumers of the `ToastContext` object; direct-path import unchanged                          |
| Default-export removal breaks a hidden import                                            | Low    | grep-verified zero `import useToast` (default) consumers; named export kept                                            |

## Rollback Plan

- Every change is additive-neutral: `git revert <commit>` restores the default export / index line; the test harness reverts to the capture helpers (assertions identical).
- Guard: single commit per concern (exports → harness → probes) so any revert is surgical.

## Success Criteria

- [ ] `type-check:strict` + `lint` (0 warnings) on the 3 touched files; `npm run analyze:dead-code` no new dead names
- [ ] `npx vitest run src/shared/lib/contexts/ToastContext` — all 36 existing assertions green (behavioral-noop, same counts)
- [ ] `npx vitest run src/features/Contact src/shared/ui/Code` — vi.mock consumers unaffected
- [ ] `grep "export default useToast"` → no matches; `index.ts` no longer exports `ToastContext`
- [ ] 3 `@ts-expect-error` probes consumed (no unused-diagnostic errors under `type-check:strict`)
- [ ] 3 capture helpers gone; `renderHook` + `act` + `result.current` in place; `cleanupToasts` and fake timers kept
