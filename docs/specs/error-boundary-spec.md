# Error Boundary & Image Load Diagnostics Specification

**Change**: error-boundary
**Status**: Draft
**Date**: 2026-08-09
**Prior**: SDD propose + explore (error-boundary session; Decision D CONFIRMED by user)
**Priority**: 4 CRITICAL + 2 MEDIUM (~3h core, 0h deferred)

---

## Scope

Two-part deliverable behind the goal "ErrorBoundary в Image":

- **(A) Image load-error orchestration diagnostics** (`src/shared/ui/Image/`) — dev-only `console.warn` diagnostic when an `<img>` load fails, plus an additive telemetry prop `onLoadErrorTelemetry` that reports `{ src, alt, event }` for analytics/AI tooling. Justification locked: an ErrorBoundary class CANNOT catch native `<img>` load errors (DOM events, not render-phase crashes; `Image.tsx:252` wires `onError` directly). The broken-icon failure stays honestly owned by the existing `useImageLoading`/`renderFallback` orchestration; the boundary solves a different, real problem (render-phase crashes in the fallback subtree).
- **(B) — a real class-based `ErrorBoundary` slice** (`src/shared/ui/ErrorBoundary/`, 5 new files) that wraps Image's `renderFallback` subtree so a consumer-rendered fallback that throws in the render phase cannot unmount the app.

**Non-breaking constraint:** 76 existing Image tests (68 pre-existing + 8 added by image-improvements, all passing) and 6 existing Storybook plays MUST stay green UNCHANGED. Everything is additive — one new optional prop, one new branch inside the existing `if (!forceLoading)` funnel, one new slice with zero consumers until phase 3.

**Integration point (locked):** `handleLoadError` in `Image.tsx:212-220` — NOT hook-internal `onError`. Single funnel, already `forceLoading`-gated, fires once per commit at component granularity. `onLoadErrorTelemetry` fires insides the EXISTING branch without reordering `onLoadError?.(event)`.

**Out of scope (documented, NOT requirements):**

| Item                                                                                               | Rationale                                                                                                                          |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Global error registry / ErrorBoundary context                                                      | **C-rejected by user**: async error composition (keyed by source) is a v2 concern; per-component telemetry covers the current need |
| Consumer adoption into Avatar family (4) + CardImage                                               | Additive prop, no wiring — consumers stay untouched                                                                                |
| Default fallback visible text / i18n keys                                                          | Boundary fallback renders a minimal no-text node by default; NO new i18n keys in this change                                       |
| Error event capture via `error`/`onError` on `<img>` (Option A/B/C remnants)                       | Rejected — load errors are DOM events, not catchable by class boundaries                                                           |
| `getDerivedStateFromError`-driven re-render/reset semantics, extra boundary features (keys, retry) | Not needed for the wrap-in-Image use case                                                                                          |

---

## ADDED Requirements

### Requirement ERB-01: Additive `onLoadErrorTelemetry` prop + payload

The system SHALL add an optional prop to `ImageProps`: `onLoadErrorTelemetry?: (info: ImageLoadErrorInfo) => void` with `ImageLoadErrorInfo = { src: string; alt: string; event: React.SyntheticEvent<HTMLImageElement, Event> }`. The call SHALL be made inside the existing `if (!forceLoading)` branch of `handleLoadError` (`Image.tsx:212-220`), SHALL NOT reorder or gate the existing `onLoadError?.(event)` invocation, and SHALL be additive-only (nothing renamed, no default).

#### Scenario: Fires once per load-error commit

- GIVEN an Image with `onLoadErrorTelemetry` set, not `forceLoading`
- WHEN `fireEvent.error(img)` fires (jsdom)
- THEN the prop SHALL be called exactly once with `info.src` equal to the resolved `src`, `info.alt` matching the `alt` prop, and `info.event` the native error event

#### Scenario: Suppressed by forceLoading

- GIVEN the same Image with `forceLoading` active
- WHEN `fireEvent.error(img)` fires
- THEN `onLoadErrorTelemetry` MUST NOT be called (funnel gate preserved)

#### Scenario: Fallback-img chain fires twice (documented behavior)

- GIVEN an Image with a string fallback URL and `onLoadErrorTelemetry`
- WHEN the primary `<img>` errors AND the fallback `<img>` also errors (test `Image.test.tsx:638-647` behavior)
- THEN the funnel SHALL fire once per error event (2 total) — documented EXPECTED, not a bug (each `<img>` is an independent load; telemetry is per-event)

#### Scenario: Payload shape is stable

- GIVEN any fired telemetry call
- WHEN asserted
- THEN `info` SHALL equal `{ src, alt, event }` with no extra fields (typed `ImageLoadErrorInfo` exported from the Image public index)

### Requirement ERB-02: Dev-only `console.warn` diagnostic in `handleLoadError`

The system SHALL log a `console.warn` (NOT `console.error` — repo validator precedent, `imageValidation.ts:160-167`; `console.error` in the test-runner would flag Storybook plays red) inside the same `if (!forceLoading)` branch, guarded by `NODE_ENV === 'development'` (repo self-guard pattern; LNK-15/PAR-04 precedent), message `[Image] Failed to load image` + `{ src, alt }`, with `// eslint-disable-next-line no-console`. Log order: telemetry first, warn second; both before `onLoadError?.(event)`.

#### Scenario: warn in development

- GIVEN `NODE_ENV='development'` and an errored non-`forceLoading` Image
- WHEN the error event fires
- THEN `console.warn` MUST be called with `[Image] Failed to load image` and a payload containing `src` and `alt`

#### Scenario: zero console output in test/production

- GIVEN `NODE_ENV='test'` and the same error
- WHEN it fires
- THEN `console.warn` MUST NOT be called (via `vi.spyOn(console, 'warn')`, pattern `Image.test.tsx:576-605`); the same MUST hold in `NODE_ENV='production'`

#### Scenario: existing plays unaffected

- GIVEN the 6 existing Storybook plays (incl. `ErrorWithFallback`)
- WHEN they run under `storybook:test`
- THEN assertions (DOM-only, cosmetic) MUST remain green — plays never evaluate the dev session

### Requirement ERB-03: `ErrorBoundary` slice scaffold

The system SHALL create `src/shared/ui/ErrorBoundary/` (5 files: `index.ts`, `ui/ErrorBoundary.tsx`, `ui/ErrorBoundary.test.tsx`, `ui/ErrorBoundary.stories.tsx`, `model/types.ts`) as a class-based boundary. Props contract: `{ fallback?: ReactNode | ((error: Error, errorInfo?: React.ErrorInfo) => ReactNode); onError?: (error: Error, errorInfo?: React.ErrorInfo) => void; children: ReactNode }`. Named-only exports. Class pattern: `getDerivedStateFromError` sets `hasError`; `componentDidCatch` calls `onError?.(error, errorInfo)`. Default fallback: minimal — the boundary SHALL render `null` (or an inert placeholder) when no `fallback` prop is provided; NO i18n keys.

#### Scenario: renders children normally

- GIVEN `<ErrorBoundary onError={spy} fallback={<p>fallback</p>}><div>child</div></ErrorBoundary>`
- WHEN rendered without an error
- THEN the child MUST render and the spy MUST NOT be called

#### Scenario: on error renders fallback + fires onError

- GIVEN a child that throws in render
- WHEN the boundary catches it
- THEN `onError` MUST fire with the error instance and the fallback (ReactNode or function result) MUST render instead of the child

#### Scenario: fallback function receives the error

- GIVEN `fallback={(err) => <span>{err.message}</span>}`
- WHEN the child throws
- THEN the boundary MUST render the span with the caught message; the boundary MUST remain in the document (no app unmount)

### Requirement ERB-04: Boundaries wrap the Image renderFallback subtree

The system SHALL wrap Image's fallback rendering path (the `renderFallback()` node subtree) with `<ErrorBoundary fallback={DEFAULT_BOUNDARY_FALLBACK}>` so a render-phase `throw` inside consumer-supplied fallbacks (custom ReactNode/string renderers) is caught by the boundary and replaced by the minimal static node. Recursion guard: the boundary's own fallback MUST NOT contain an Image or any network/error-capable node — it is a static, non-throwing node — so a "fallback self-throw" cannot loop.

- **Scenario: crash in fallback subtree → boundary minimal fallback**
  - GIVEN `<Image src={{ src: 'broken' }} fallback={<BrokenComponentThatThrows/>}>`
  - WHEN the image errors and the fallback renders
  - THEN the thrown component MUST be replaced by the minimal fallback; the rest of the page MUST remain mounted

- **Scenario: recursion guard**
  - GIVEN the boundary's minimal fallback node itself
  - WHEN the fallback subtree throws repeatedly
  - THEN the boundary SHALL render its static minimal fallback WITHOUT re-entering the throwing subtree (no runtime loop)

### Requirement ERB-05: ErrorBoundary unit tests

Tests live in `ui/ErrorBoundary.test.tsx` (5–8 assertions): children render normally; child render throw → fallback + `onError` fired; fallback-as-function receives `(error, errorInfo)`; DEFAULT fallback renders (minimal, no text); fallback self-throw → no loop (recursion guard); named-only export surface compile.

- Scenario: child throw → fallback + onError
  - GIVEN a throwing child, fallback `<p>err</p>`, onError spy
  - WHEN rendered
  - THEN the spy is called once and text 'fallback' appears
- Scenario: fallback self-throw → no recursion
  - GIVEN `fallback={() => { throw new Error('boom-again') }}`
  - WHEN the boundary catches the child throw and then the fallback throws
  - THEN the fallback result MUST NOT be used (degrees of the ErrorBoundary MAY render the default minimal fallback) — must not loop / must not crash the test process, via a guard-cased `useErrorBoundary`-like path

### Requirement ERB-06: docs/contract entry

**Type**: MODIFIED. The system SHALL add an `ErrorBoundary` row to the inventory table in `docs/specs/ui-kit-contract.md` (26th entry: Stories Yes, Tests Yes, Sub-components none) and an `### ErrorBoundary specifics` section (props contract: `fallback` ReactNode|fn, `onError`, `children`; class-based boundary; default minimal fallback; consumer = Image fallback wrap). Place after the AspectRatio specifics section, mirroring the image specifics section placement.

(Previously: no ErrorBoundary entry anywhere in the contract document)

- Scenario: inventory row + section present
  - GIVEN the updated `docs/specs/ui-kit-contract.md`
  - WHEN inspected
  - THEN a row and a section referencing the boundary MUST exist with the props summary (consistent with ERB-03/04)

---

## Test Expectations

| Area                                                                                                                  | Tests                                                         | Type                     |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------ |
| Telemetry (ERB-01): fires once / force-flatten / fallback-chain / payload                                             | 3–4                                                           | Unit                     |
| Dev-log (ERB-02): dev-warn, test/prod zero, message shape                                                             | 2–3                                                           | Unit                     |
| ErrorBoundary slice (ERB-03/04/05): render children, fallback+onError, fallback-fn, default fallback, self-throw loop | 5–8                                                           | Unit                     |
| Existing Image suite                                                                                                  | 76 (MUST stay green UNCHANGED)                                | Unit                     |
| Storybook plays (existing 6)                                                                                          | 6 (MUST stay green; DOM asserts only)                         | `npm run storybook:test` |
| ErrorBoundary stories (1–2)                                                                                           | 1–2 (sharpened)                                               | `npm run storybook:test` |
| Dead-code / types                                                                                                     | `npm run analyze:dead-code` clean slice + `type-check:strict` | Static                   |

Existing tests MUST remain unchanged (behavioral-noop gate, functionally zero for the new optional prop).

---

## Implementation Order

```
Phase 1 (~1h) — (A) diagnostics orchestration
├── ERB-01: onLoadErrorTelemetry prop + payload in Image.tsx:212-220 (single funnel, post-onLoadError)
├── ERB-02: console.warn dev-guard + message shape
├── Tests: telemetry + warn/no-warn (RED first, then GREEN)

Phase 2 (~1.5–2h) — (B) boundary slice
├── ERB-03: model/types.ts → ui/ErrorBoundary.tsx → index.ts (named-only, class)
├── ERB-05: ErrorBoundary.test.tsx (5–8 tests, RED first)
├── ErrorBoundary.stories.tsx (1–2 stories + plays)

Phase 3 (~0.5h) — Wrap in Image
├── ERB-04: wrap renderFallback subtree with the boundary; recursion-safe minimal fallback
├── RE-verify 76-test gate unchanged

Phase 4 (~0.5h) — Docs + verify
├── ERB-06: ui-kit-contract.md row + specifics
├── Verify: npm run type-check:strict; lint (Image+boundary files exactly 0); npx vitest run src/shared/ui/Image src/shared/ui/ErrorBoundary (76 + new); npm run analyze:dead-code; npm run storybook:test (6 existing plays + 1–2 new)
```

---

## Risk Assessment

| Risk                                                       | Impact        | Mitigation                                                                                                                                             |
| ---------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `console.error` vs `console.warn` choice                   | Medium        | LOCKED: `console.warn` (repo validator precedent; Storybook `image.ts` test-runner flags `console.error` → would fail plays; assert DOM-only at plays) |
| Telemetry fires twice on fallback chain                    | Low           | Documented as expected behavior (ERB-01, per-event semantics mirror `Image.test.tsx:638-647`)                                                          |
| ErrorBoundary children typing friction (React 18/19 class) | Low           | Type children as `ReactNode`; no memo-cast (class); `getDerivedStateFromError` optional                                                                |
| Boundary fallback self-throw loops                         | Medium        | Static minimal fallback (null node, no network/Image) + dedicated self-throw test                                                                      |
| 76-test gate regression                                    | Low           | Additive only: one optional prop, one new branch inside existing funnel; hook untouched                                                                |
| `docs/specs/*.md` untracked by git                         | Informational | Expected; do not fight ignore. Commit scope = `src/` only (per repo)                                                                                   |

## Rollback Plan

- **Everything is additive** — the change is one new optional prop, one new branch inside the existing `if (!forceLoading)` funnel, and one new 5-file slice with a single adoption site.
- **Image changes (ERB-01/02/04):** `git revert <image-commit>` restores `Image.tsx`/tests; telemetry prop is drop-in to remove with zero consumer fallout (no consumers wire it).
- **Boundary slice (ERB-03/05):** `rm -rf src/shared/ui/ErrorBoundary` + revert the Image wrap commit — zero other consumers, no migration needed.
- **Docs (ERB-06):** revert contract row/section — trivially restorable.
- Guard: single PR per concern (diagnostics → slice → wrap → docs) so any revert is surgical.

## Success Criteria

- [ ] `npm run type-check:strict` + `lint` on touched files: exactly 0 warnings; `npm run analyze:dead-code` clean for the new slice
- [ ] All 76 existing Image tests pass `npx vitest run src/shared/ui/Image` UNCHANGED (behavioral-explicit gate)
- [ ] +9–13 new tests: telemetry (3–4), dev-console (2–3), boundary slice (5–8)
- [ ] `fireEvent.error`: telemetry called exactly once per `<img>` at commit— no call under `forceLoading`
- [ ] `console.warn('[Image] Failed to load image', {src, alt})` only in development; zero console output in test/production
- [ ] `ErrorBoundary` slice: named-only exports; class-based; default fallback = minimal (no i18n/visible text); passes all unit tests
- [ ] Image fallback subtree wrapped by boundary; fallback crash swaps to minimal node; doc stays mounted; no recursion loop
- [ ] Storybook: existing 6 plays + 1–2 new boundary plays green (`npm run storybook:test`)
- [ ] `docs/specs/ui-kit-contract.md` has the ErrorBoundary inventory row and specifics section
