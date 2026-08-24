# Tasks: Error Boundary & Image Load Diagnostics

**Change**: error-boundary · **Date**: 2026-08-09
**Source**: `docs/specs/error-boundary-spec.md` (ERB-01..06) + `error-boundary-design.md` (decisions 1–7)
**Gate**: 76 Image tests + 6 Storybook plays pass UNCHANGED. Additive API only (`onLoadErrorTelemetry` optional prop, dev-only `console.warn`); new ErrorBoundary slice has zero consumers beyond the Image wrap (Image.tsx:257). `console.warn` LOCKED (NOT `console.error` — Storybook test-runner flags error logs).

## Review Workload Forecast

| Field                   | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| Estimated changed lines | ~200–350 (`additions + deletions`)                        |
| 400-line budget risk    | Low                                                       |
| Chained PRs recommended | No (split optional — single fully-additive PR acceptable) |
| Suggested split         | PR 1 slice → PR 2 Image+docs, or single PR                |
| Delivery strategy       | ask-on-risk                                               |
| Chain strategy          | pending (ask user)                                        |

```text
Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low
```

**Context**: unlike larger refactors there is ZERO regression surface for the boundary slice (no consumers until T8) and the Image changes are additive (one optional prop, one dev-only warn inside the existing `if (!forceLoading)` funnel, one wrap). Split is a size preference, not a risk requirement. Chain strategy asked at apply (default: single PR).

### Suggested Work Units

| Unit | Goal                                                                                         | PR   | Focused test command                                             | Runtime harness                                                                                                           | Rollback                                                                                                         |
| ---- | -------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1    | ErrorBoundary slice: RED tests → scaffold → stories (T1–T3)                                  | PR 1 | `npx vitest run src/shared/ui/ErrorBoundary`                     | `npm run type-check:strict`; `npm run storybook:test` (plays)                                                             | `git revert <commit>` removes the slice; zero fallout (no consumers)                                             |
| 2    | Image diagnostics + wrap + docs: RED → telemetry → dev-log → wrap → contract → gate (T4–T10) | PR 2 | `npx vitest run src/shared/ui/Image src/shared/ui/ErrorBoundary` | `npm run type-check:strict`; `npm run lint`; full vitest (76-gate); `npm run storybook:test`; `npm run analyze:dead-code` | `git revert <commit>` — `Image.tsx` single-file revert; telemetry prop additive-drop; locale/docs revert trivial |

## Tasks

| ID      | Req       | Batch | Title                        | Files                                                                  | Work                                                                                                                                                                                                                                                                                                                                                                                            | Acceptance                                                                                                                                                                                                                                                                                   | Deps                                                      |
| ------- | --------- | ----- | ---------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --- |
| [x] T1  | ERB-03/05 | 1     | RED: boundary unit tests     | `ui/ErrorBoundary.test.tsx` (new)                                      | Write failing suite: renders children normally (onError spy NOT called); child render-throw → fallback renders + `onError(error, errorInfo)`; fallback-as-function receives `(error, errorInfo)`; default minimal fallback renders (no text); fallback self-throw → recursion bounded (no loop, via outer spy/counter)                                                                          | Suite RED against nonexistent slice (`import` unresolved) + `type-check:strict` fails — RED gate                                                                                                                                                                                             | —                                                         |
| [x] T2  | ERB-03    | 1     | Slice scaffold               | `model/types.ts` (new), `ui/ErrorBoundary.tsx` (new), `index.ts` (new) | Class-based boundary: `ErrorBoundaryProps { fallback?: ReactNode                                                                                                                                                                                                                                                                                                                                | ((error, errorInfo?) => ReactNode); onError?; children }`+`ErrorBoundaryState`; `getDerivedStateFromError`stores error,`componentDidCatch`fires`onError`; named-only exports; `DEFAULT_BOUNDARY_FALLBACK = null`(module-scope const, re-exported) — 5-file shape per spec (no`constants.ts`) | T1 GREEN; `npm run type-check:strict` 0; knip-clean slice | T1  |
| [x] T3  | ERB-03    | 1     | Boundary stories + plays     | `ui/ErrorBoundary.stories.tsx` (new)                                   | 2 stories (`Default` children render, `FallbackShown` throwing child) + sync `play` via `@storybook/test` `within`/`expect` (no timers)                                                                                                                                                                                                                                                         | `npm run storybook:test` — 2 plays green                                                                                                                                                                                                                                                     | T2                                                        |
| [x] T4  | ERB-01    | 2     | RED: telemetry tests         | `ui/Image.improvements.test.tsx` (extend)                              | Via `triggerError` helper (file:16-23): `onLoadErrorTelemetry` fires exactly once with `{src, alt, event}` (src = resolved `src`, alt = prop); zero calls under `forceLoading`; payload typed stable (no extra fields)                                                                                                                                                                          | Tests FAIL vs current funnel (prop type missing) — RED                                                                                                                                                                                                                                       | —                                                         |
| [x] T5  | ERB-01    | 2     | Telemetry prop + funnel call | `model/types.ts`, `ui/Image.tsx`, `index.ts`                           | Add `ImageLoadErrorInfo { src; alt; event }` + optional `onLoadErrorTelemetry?: (info) => void` to `ImageProps`; call it FIRST inside the existing `if (!forceLoading)` branch (Image.tsx:212-220), then dev-warn, then `onLoadError?.(event)` (order locked, existing callback contract unchanged); export type from public index; dep array += `onLoadErrorTelemetry, alt, resolvedSrc.src`   | T4 GREEN; 76-gate unchanged (additive-only)                                                                                                                                                                                                                                                  | T4                                                        |
| [x] T6  | ERB-02    | 2     | RED: dev-log tests           | `ui/Image.improvements.test.tsx` (extend)                              | `vi.spyOn(console, 'warn')` + explicit `process.env.NODE_ENV = 'development'`, restored in `afterEach` (Image.test.tsx:576-605 precedent): warn called with `[Image] Failed to load image` + `{src, alt}`; zero calls in `'test'` and `'production'`                                                                                                                                            | `console.warn` NOT called by current code → RED                                                                                                                                                                                                                                              | T5                                                        |
| [x] T7  | ERB-02    | 2     | Dev-only warn                | `ui/Image.tsx`                                                         | Inside funnel (second position): `if (process.env.NODE_ENV === 'development') { // eslint-disable-next-line no-console` + `console.warn('[Image] Failed to load image', { src: resolvedSrc.src, alt }); }` — order: telemetry → warn → `onLoadError?.(event)`                                                                                                                                   | T6 GREEN; lint (touched files) 0; 76-gate stays green                                                                                                                                                                                                                                        | T6                                                        |
| [x] T8  | ERB-04    | 3     | Wrap fallback render         | `ui/Image.tsx`, `ui/Image.improvements.test.tsx`                       | Wrap `{loadingStatus === 'error' && <ErrorBoundary fallback={DEFAULT_BOUNDARY_FALLBACK}>{renderFallback()}</ErrorBoundary>}` (Image.tsx:257); import `ErrorBoundary` + `DEFAULT_BOUNDARY_FALLBACK`; recursion-guard doc note (static `null` fallback, no re-entry). Test: `fallback={<ThrowsInRender/>}` → minimal node renders, page mounted, no loop; existing error-fallback paths unchanged | Wrap test green; re-verify 76 Image + 2 boundary units pass unchanged                                                                                                                                                                                                                        | T7 (needs T2 slice)                                       |
| [x] T9  | ERB-06    | 3     | Docs contract entry          | `docs/specs/ui-kit-contract.md`                                        | 26th inventory row (Stories Yes, Tests Yes, Sub-components None) + `### ErrorBoundary specifics` section AFTER AspectRatio section: props contract, class-based, default minimal fallback (no i18n), consumer = Image fallback wrap                                                                                                                                                             | diff review: row + section present, consistent with ERB-03/04                                                                                                                                                                                                                                | T8                                                        |
| [x] T10 | —         | 3     | Final gate                   | (none)                                                                 | `npm run type-check:strict` (0); `npm run lint` on touched files (0); `npx vitest run src/shared/ui/Image src/shared/ui/ErrorBoundary` (76 + ~13 new); `npm run analyze:dead-code` (Image names + slice clean); `npm run storybook:test` (6 existing + 2 new plays); commit scope = `src/` only (`docs/specs/*.md` untracked, expected)                                                         | all green; `git revert <unit-commit>` rehearsal per batch                                                                                                                                                                                                                                    | T1..T9                                                    |

**Deviation note**: T1 (RED) placed BEFORE T2 (scaffold), T4 before T5, T6 before T7 — tests-first per repo TDD precedent (Link/Icon/Image). Dev-log RED (T6) intentionally lands after telemetry impl (T5) so the funnel already exists. Threat matrix: N/A rows omitted (no routing/shell/subprocess boundaries — DOM-event + render-phase error handling only).

## Implementation Order

```
Batch 1 (PR 1)  T1 → T2 → T3          boundary slice: RED unit suite → class scaffold → stories/plays
Batch 2 (PR 2)  T4 → T5 → T6 → T7    RED telemetry → funnel call → RED dev-log → dev-only warn
Batch 3 (PR 2)  T8 → T9 → T10         wrap renderFallback → contract docs → full-gate verify
```

### Batch summary

| Batch                | Tasks  | Focus                                                                                            | PR  |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------ | --- |
| Boundary slice       | T1–T3  | RED tests → 5-file scaffold (class + named-only + `DEFAULT_BOUNDARY_FALLBACK`) → 2 stories/plays | 1   |
| Diagnostics          | T4–T7  | `onLoadErrorTelemetry` + dev `console.warn` in the existing funnel (RED-first each)              | 2   |
| Wrap + docs + verify | T8–T10 | wrap renderFallback subtree, 26th contract entry, full gate                                      | 2   |

Rollback is surgical per unit (`git revert <unit-commit>`): boundary slice has zero consumers until T8; Image changes stay within `Image.tsx`/`model/types.ts`; the telemetry prop is drop-in removable; docs revert trivially (untracked anyway).

## Result Contract

```json
{
  "status": "success",
  "executive_summary": "Created docs/specs/error-boundary-tasks.md — 10 tasks (T1–T10) in 3 batches: boundary slice RED→GREEN, Image diagnostics RED→GREEN, wrap+docs+final gate, mirroring image-improvements/aspect-ratio task structure.",
  "artifacts": [
    {
      "path": "docs/specs/error-boundary-tasks.md",
      "type": "tasks",
      "summary": "10-task breakdown for ERB-01..06: T1 RED boundary tests → T2 scaffold → T3 stories ; T4 RED telemetry → T5 funnel prop → T6 RED dev-log → T7 dev-only warn; T8 Image fallback wrap; T9 contract docs; T10 full gate. Forecast: Low 400-line risk, single-PR acceptable (split PR 1 slice / PR 2 diagnostics)."
    }
  ],
  "next_recommended": "Launch sdd-apply",
  "risks": [],
  "skill_resolution": {
    "skills_loaded": [
      "test-generation (RED suites T1/T4/T6)",
      "component-boilerplate (scaffold T2)",
      "storybook-setup (stories T3)"
    ],
    "skills_used": [],
    "skills_recommended": [
      "test-generation (T1/T4/T6)",
      "component-boilerplate (T2)",
      "storybook-setup (T3)"
    ]
  }
}
```

**Exact task count**: 10 implementation tasks (T1–T10).
**Dependency chain**: T1 → T2 → T3; T4 → T5; T6 → T7; T8 depends on T5 + T2-slice; T9 → T8; T10 final gate (T1..T9). Parallel feeds: T4/T6 RED suites may share a write window after T5 lands (both extend `Image.improvements.test.tsx`).
