# Tasks: ToastContext Improvement

**Change**: toast-improvements · **Date**: 2026-08-11
**Source**: `toast-improvement-spec.md` (TST-01..04)
**Gate**: 36 existing ToastContext assertions / 21 `it()` blocks pass UNCHANGED (behavioral-noop). 6 consumer sites (ToastProvider×3, useToast×2, vi.mock×2) stay green.

## Review Workload Forecast

| Field                   | Value                                |
| ----------------------- | ------------------------------------ |
| Estimated changed lines | ~120–180 (`additions + deletions`)   |
| 400-line budget risk    | Low                                  |
| Chained PRs recommended | No                                   |
| Suggested split         | Single PR                            |
| Delivery strategy       | single-pr                            |
| Chain strategy          | single-pr (default; no chain needed) |

```text
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr (no chain)
400-line budget risk: Low
```

### Suggested Work Units

| Unit | Goal                     | PR     | Focused test command                                     | Runtime harness                                                                                             | Rollback                                                     |
| ---- | ------------------------ | ------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1    | Exports: TST-01 + TST-02 | single | `npm run type-check:strict`; `npm run analyze:dead-code` | `npx vitest run src/shared/lib/contexts/ToastContext` (36-gate) + `src/features/Contact src/shared/ui/Code` | revert commit; 1-line restores per file                      |
| 2    | Harness: TST-03          | single | `npx vitest run src/shared/lib/contexts/ToastContext`    | full vitest (behavioral-noop)                                                                               | revert commit; capture helpers restore, assertions identical |
| 3    | Probes: TST-04           | single | `npm run type-check:strict`                              | `npx vitest run src/shared/lib/contexts/ToastContext`                                                       | revert commit; probes additive                               |

## Tasks

| ID  | Req    | Batch  | Title                                  | Files                      | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Acceptance                                                                                                                                                                 | Deps   |
| --- | ------ | ------ | -------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T1  | TST-01 | 1      | Remove `export default useToast`       | `lib/hooks/useToast.ts`    | Delete the `export default useToast;` line (`:27`); keep `export const useToast`                                                                                                                                                                                                                                                                                                                                                                                 | `grep "export default useToast"` → no matches; `type-check:strict` 0; `analyze:dead-code` no default-export finding                                                        | —      |
| T2  | TST-02 | 1      | Drop `ToastContext` from index         | `index.ts`                 | Remove `ToastContext` from the re-export list (`:6`); keep `useToast`, `ToastProvider`, types. Object stays exported from `ui/ToastContext.tsx` (useToast direct-path import unchanged)                                                                                                                                                                                                                                                                          | `ToastContext` absent from index; `type-check:strict` 0 (useToast resolves); `npx vitest run src/features/Contact src/shared/ui/Code` green (vi.mock factories unaffected) | T1     |
| T3  | TST-03 | 2      | Harness modernization (`renderHook`)   | `ui/ToastContext.test.tsx` | Replace the 3 manual `useEffect`-capture helpers (`createAddToastHelper`, `createToastHelpers`, `createClearAllHelper`, ~40 lines) with `renderHook(() => useToast(), { wrapper: ToastProvider })` + `act(() => result.current.addToast(...))`; keep `act()` around hook calls + `vi.advanceTimersByTime` (19 sites — NOT act-removal); keep `cleanupToasts`, fake-timer `beforeEach`/`afterEach`, `EXIT_ANIMATION_DURATION` windows, all 36 assertions verbatim | `npx vitest run src/shared/lib/contexts/ToastContext` — 36/36 green UNCHANGED (behavioral-noop gate, zero assertion text changed)                                          | T2     |
| T4  | TST-04 | 3      | `@ts-expect-error` type-surface probes | `ui/ToastContext.test.tsx` | Append 3 compile probes to the `useToast Hook` describe block (Link LNK-16 precedent): `addToast(42, 'success')`, `addToast('x', 'invalid')`, `removeToast(123)` — each preceded by a `// @ts-expect-error` directive, passing genuinely invalid values (no casts — a cast would make the directive unused)                                                                                                                                                      | `type-check:strict` consumes all 3 (no unused-diagnostic errors); suite still 36 assertions (type-only, zero runtime impact)                                               | T3     |
| T5  | —      | verify | Final gate                             | (none)                     | `npm run type-check:strict`; `npm run lint` on the 3 touched files (0); `npx vitest run src/shared/lib/contexts/ToastContext` (36 green); `npx vitest run src/features/Contact src/shared/ui/Code` (consumers green); `npm run analyze:dead-code` (no new dead names)                                                                                                                                                                                            | all green; diff review confirms zero assertion text changed                                                                                                                | T1..T4 |

**Deviation note**: none — the batched order matches the spec's Implementation Order (exports → harness → probes), and all changes are additive-neutral so no RED-first gate applies (no new behavior, no new tests beyond type-only probes).

## Implementation Order

```
Phase 1  T1 → T2        exports: default-export removal → index surface lock
Phase 2  T3             harness: capture helpers → renderHook + act (36-assertion noop gate)
Phase 3  T4             probes: @ts-expect-error type-surface lock
Phase 4  T5             final verify: type-check + lint + vitest + dead-code
```

Each phase = one reverted commit; whole change = single PR.

## Summary

| Phase   | Tasks | Focus                                                          |
| ------- | ----- | -------------------------------------------------------------- |
| Exports | T1–T2 | named-only (useToast) + internal-only (ToastContext off index) |
| Harness | T3    | renderHook modernization, behavioral-noop (36/36)              |
| Probes  | T4    | `@ts-expect-error` surface lock                                |
| Verify  | T5    | full gate                                                      |

**Total ~120–180 changed lines** → 400-line budget risk: Low → single PR, no chain needed. `docs/specs/*.md` untracked by git (expected; commit scope = `src/` only).

## Result Contract

```json
{
  "status": "success",
  "executive_summary": "Created docs/specs/toast-improvement-tasks.md — 5 tasks (T1–T5) in 3 phases + verify: exports (default-export removal, ToastContext off index), harness modernization (renderHook + act, 36-assertion behavioral-noop), @ts-expect-error probes, final gate. Single-PR-sized, ~2.5h.",
  "artifacts": [
    {
      "path": "docs/specs/toast-improvement-tasks.md",
      "type": "tasks",
      "summary": "5-task breakdown for TST-01..04: T1 useToast default export removal → T2 ToastContext off index → T3 renderHook harness refactor (36 assertions unchanged) → T4 type-surface probes → T5 full verify. Forecast: Low 400-line risk, single-PR."
    }
  ],
  "next_recommended": "Launch sdd-apply",
  "risks": [],
  "skill_resolution": {
    "skills_loaded": [],
    "skills_used": [],
    "skills_recommended": ["test-generation (T3 harness refactor)"]
  }
}
```

**Exact task count**: 5 implementation tasks (T1–T5).
**Dependency chain**: T1 → T2 → T3 → T4 → T5 (strictly sequential; each phase commits separately so any revert is surgical).
