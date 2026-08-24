# Design: Error Boundary & Image Load Diagnostics

**Change**: error-boundary · **Status**: Draft · **Date**: 2026-08-09
**Scope source**: `docs/specs/error-boundary-spec.md` (ERB-01..06)
**Non-breaking gate**: 76 Image tests (`Image.test.tsx` + `Image.improvements.test.tsx`) + 6 Storybook plays pass UNCHANGED. Additive API only; new slice has zero consumers beyond the Image wrap.

## Overview

Two-part deliverable: **(A)** dev/test diagnostics for Image load-error orchestration — one additive prop `onLoadErrorTelemetry` + a dev-only `console.warn`, both firing inside the existing `if (!forceLoading)` funnel of `handleLoadError` (`Image.tsx:212-220`) without reordering `onLoadError?.(event)`; **(B)** a class-based `ErrorBoundary` slice (`src/shared/ui/ErrorBoundary/`) that wraps Image's `renderFallback()` subtree so a render-phase crash inside a consumer-supplied fallback cannot unmount the app. Key justified constraint from exploration: a React error boundary CANNOT catch native `<img>` load errors (DOM events, not render errors) — the boundary solves render-crash containment, not load-error reporting.

**Verified facts (this session):**

- `handleLoadError` is `useCallback(…, [hookOnError, onLoadError, forceLoading])` at `Image.tsx:212-220`; the funnel body is `hookOnError(event); if (!forceLoading) { onLoadError?.(event); }`.
- `renderFallback()` (`Image.tsx:152-178`) has 3 branches: string → `<img>` fallback, ReactNode → `<div>`, default → `<div>{t('imageNotAvailable')}</div>`; invoked at `{loadingStatus === 'error' && renderFallback()}` (`:257`).
- `resolvedSrc = typeof src === 'object' ? src : { src, srcSet: undefined }` (`:75`) — using `resolvedSrc.src` (a primitive string) in the telemetry closure and dep array is stable across renders.
- `ImageProps` (`model/types.ts:78-217`) carries `onLoadStart`/`onLoadSuccess`/`onLoadError` — naming-parity precedent for `onLoadErrorTelemetry`.
- Test-infra precedents: `triggerError` = `fireEvent.error` + `waitFor` (`Image.improvements.test.tsx:16-23`); dev-log pattern = `process.env.NODE_ENV = 'development'` override + `vi.spyOn(console, 'warn')`, restored in `afterEach` (`Image.test.tsx:576-605`); vitest default env is `'test'` so the override is mandatory.
- `shared/ui → shared/ui` imports are FSD-valid precedented (Image already imports `@/shared/ui/Skeleton`, `@/shared/ui/Spinner`). Boundary imports nothing from Image → no circular import.

---

## Architecture

### File tree (before → after)

```
src/shared/ui/Image/
├── index.ts                      MODIFY  (+export type ImageLoadErrorInfo)
├── ui/Image.tsx                  MODIFY  (ERB-01 telemetry, ERB-02 warn, ERB-04 boundary wrap)
├── model/types.ts                MODIFY  (+onLoadErrorTelemetry prop + ImageLoadErrorInfo)
├── ui/Image.test.tsx             UNCHANGED (76-gate — no-op)
├── ui/Image.improvements.test.tsx MODIFY  (+ERB-01/02 describe blocks, +ERB-04 wrap test)
├── ui/Image.stories.tsx          UNCHANGED (6 plays stay green)
├── lib/hooks/useImageLoading.ts  UNCHANGED (funnel lives in component, not hook — spec-locked)
└── model/constants.ts            UNCHANGED

src/shared/ui/ErrorBoundary/               NEW slice (5 files per spec)
├── index.ts                      NEW  (named exports: ErrorBoundary, props types, DEFAULT_BOUNDARY_FALLBACK)
├── model/types.ts                NEW  (ErrorBoundaryProps, ErrorBoundaryState)
├── ui/ErrorBoundary.tsx          NEW  (class; componentDidCatch; render with fallback resolution)
├── ui/ErrorBoundary.test.tsx     NEW  (ERB-05: 5-8 assertions, RED-first)
└── ui/ErrorBoundary.stories.tsx  NEW  (2 stories + plays)
```

**Dependency order**: `model/types.ts` → `ui/ErrorBoundary.tsx` + `index.ts` → `ErrorBoundary.test.tsx` (RED → GREEN) → stories → Image changes (telemetry → warn → wrap) → Image tests → docs. Each commit revertible (rollback section).

---

## Per-requirement design

### ERB-01 — `onLoadErrorTelemetry` prop — placement and payload

- **Placement** (first in the funnel, `Image.tsx:215-216`):

```tsx
const handleLoadError = useCallback(
  (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    hookOnError(event);
    if (!forceLoading) {
      onLoadErrorTelemetry?.({ src: resolvedSrc.src, alt, event });
      if (process.env.NODE_ENV === 'development') {
        /* ERB-02 */
      }
      onLoadError?.(event); // ← LAST, never reordered (spec gate)
    }
  },
  [hookOnError, onLoadError, onLoadErrorTelemetry, alt, resolvedSrc.src, forceLoading]
);
```

- **Types** (`model/types.ts`, exported from `index.ts`):

```ts
export interface ImageLoadErrorInfo {
  src: string;
  alt: string;
  event: React.SyntheticEvent<HTMLImageElement, Event>;
}
// ImageProps +=
/** Telemetry callback — fires per load-error event under the non-forceLoading funnel. Additive, optional, no default. */
onLoadErrorTelemetry?: (info: ImageLoadErrorInfo) => void;
```

- Fallback-chain behavior (`fallback="/f.jpg"` where the fallback `<img>` also errors): the funnel fires per `<img>` error event (2 calls) — documented EXPECTED, mirrors `Image.test.tsx:638-647`.

### ERB-02 — Dev-only `console.warn` diagnostic

Inside the same funnel, second position:

```tsx
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.warn('[Image] Failed to load image', { src: resolvedSrc.src, alt });
}
```

- **Locked**: `console.warn` NOT `console.error` — Storybook's test-runner flags `console.error` and would push `ErrorWithFallback`/`InteractiveStates` plays red.
- **Order**: telemetry → warn → `onLoadError?.(event)` (spec: both before the existing consumer callback).
- Tests must set `process.env.NODE_ENV = 'development'` explicitly (vitest defaults to `'test'`) and restore in `afterEach` (spec precedent `Image.test.tsx:576-605`).

### ERB-03 — `ErrorBoundary` slice scaffold (class-based)

```ts
// model/types.ts
export interface ErrorBoundaryProps {
  fallback?: ReactNode | ((error: Error, errorInfo?: React.ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo?: React.ErrorInfo) => void;
  children: ReactNode;
}
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// ui/ErrorBoundary.tsx — named-only class, NO memo-cast (class, not function)
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    this.setState({ errorInfo }); // enables fallback-error fn signature (error, errorInfo)
  }
  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    const { fallback } = this.props;
    if (typeof fallback === 'function')
      return fallback(this.state.error ?? new Error('Unknown'), this.state.errorInfo);
    return fallback ?? null; // minimal default — no i18n keys, nothing visible
  }
}
```

- `getDerivedStateFromError` stores the error for the render; `componentDidCatch` mirrors callbacks + captures `errorInfo`. Default fallback = `null` (inert). Named-only exports from birth (repo rule); no default export.

### ERB-04 — Border wrap of `renderFallback()` + recursion guard

```tsx
// Image.tsx:257 — the only change in the render path
{
  loadingStatus === 'error' && (
    <ErrorBoundary fallback={DEFAULT_BOUNDARY_FALLBACK}>{renderFallback()}</ErrorBoundary>
  );
}
```

- `DEFAULT_BOUNDARY_FALLBACK: ReactNode = null` — a static `null` is used (see Decision 5); it cannot throw, contains no `Image`/network/event-capable node, so the child-subtree crash is replaced by nothing and the page stays mounted.
- **Recursion reasoning**: if the consumer fallback throws in render, the boundary switches to its own fallback. Since that fallback is `null` (static), the boundary's render cannot re-enter a throwing subtree → no loop. `componentDidMount`/`getDerivedStateFromError` run once per crash; React never re-renders a throw-fallback — a self-throw case propagates up instead (never inside Image, whose fallback is static).

### ERB-05 — `ErrorBoundary.test.tsx` unit suite

5-8 assertions: children render normally (spy not called); child render-throw → fallback + `onError(error, errorInfo)` fired; fallback-as-function receives `(error, errorInfo)`; default minimal fallback renders (DOM empty/`null`); fallback self-throw → guarded (assert the recursion counter stays bounded, no infinite loop, via an outer spy/boundary); named-only export compile.

### ERB-06 — docs

`docs/specs/error-boundary.md` gets the 26th inventory row (Stories Yes, Tests Yes, Sub-components None) + an `### ErrorBoundary specifics` section, mirroring ERB-03/04.

---

## Deliverable decisions

| #   | Decision                                                                                                                              | Alternatives                             | Rationale                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Prop named `onLoadErrorTelemetry`                                                                                                     | `onErrorTelemetry`                       | Parity with existing `onLoadStart/onLoadSuccess/onLoadError` triad; grep-able, self-documenting                                                                    |
| 2   | Payload `{ src, alt, event }`                                                                                                         | `{ src, alt }` only / pass-through event | `src`+`alt` identity for analytics; `event` for tooling depth; typed `ImageLoadErrorInfo`                                                                          |
| 3   | **`console.warn` over `console.error`**                                                                                               | `console.error`                          | Storybook test-runner fails plays on `console.error`; repo validator precedent (`imageValidation.ts`)                                                              |
| 4   | `ErrorBoundary` in `shared/ui/ErrorBoundary/`                                                                                         | `shared/lib`                             | It's a React UI slice; 5-file shape (index/types/ui/test/stories); named-only from birth                                                                           |
| 5   | `DEFAULT_BOUNDARY_FALLBACK = null` (module-scope const in `ui/ErrorBoundary.tsx`, re-exported from `index.ts`)                        | `ErrorBoundary/model/constants.ts`       | Spec pins 5 files — a `constants.ts` would make 6; a single named export from the component file keeps the 5-file shape; Image imports `@/shared/ui/ErrorBoundary` |
| 6   | **Funnel order: telemetry → warn → `onLoadError?.(event)`**                                                                           | warn-first / after consumer callback     | The existing callback keeps its exact calling contract; the two new diagnostics run as pure observers before it                                                    |
| 7   | Tests: extend `Image.improvements.test.tsx` (ERB-01/02/04 blocks) + `ErrorBoundary.test.tsx` (ERB-05); **`Image.test.tsx` untouched** | New `Image.gate.test.tsx`                | Existing improvements file already hosts IMG-04/06/08 suites with the triggerError helper; a 4th file adds no value; 76-gate isolation stays maximal               |

---

## Data flow

```
User: <Image src="…" alt="х" onLoadErrorTelemetry={log} onLoadError={report}>
  │
  ├─ <img onError>{…} ────────────────► error event (DOM/native)
  │                                        │
  │                                        ▼
  │                              handleLoadError(event)          [Image.tsx:212]
  │                                        │
  │                                        ▼  hookOnError(event) → loadingStatus 'error'
  │                        ┌───if (!forceLoading)────┐  (forceLoading: no diagnostics, storybook demos)
  │                        │                         │
  │                        ▼                         ▼            (suppressed - no calls)
  │        onLoadErrorTelemetry?.({ src, alt, event })   [ERB-01: first]
  │              console.warn('[Image] Failed…', {src, alt})   [ERB-02: dev-only, second]
  │              onLoadError?.(event)                       [unchanged, last]
  │
  └─ render: {loadingStatus === 'error' && <ErrorBoundary fallback={null}> renderFallback()
        string → <img alt>  |  ReactNode → <div class=fallback>  |  default → <div>t('imageNotAvailable')
        └─ if subtree throws at render (consumer fallback) → ErrorBoundary catches → <null> → page stays mounted
```

## Test plan

| File                                               | Covers                                                                    | Tests                    | Type        |
| -------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------ | ----------- |
| `ui/ErrorBoundary.tsx`                             | boundary — New                                                            | RED init (5-8)           | Unit        |
| `ui/Image.improvements.test.tsx`                   | telemetry (ER-1: once-per-event, forceLoading-aware, payload shape)       | 2-3                      | Unit        |
| `ui/Image.improvements.test.tsx`                   | dev-log (ER-2: dev warn, test/prod zero via `vi.spyOn` NODE_ENV override) | 2                        | Unit        |
| `ui/Image.improvements.test.tsx`                   | wrap (ER-4: throwing fallback component → minimal node; loop-guard)       | 1-2                      | Unit        |
| `ui/Image.test.tsx`                                | 76 existing tests + 6 Storybook plays — UNCHANGED                         | gate                     | Unit/Play   |
| `ui/ErrorBoundary.stories.tsx`                     | 2 stories + `play`                                                        | `npm run storybook:test` | Interaction |
| `analyze:dead-code` / `type-check:strict` / `lint` | new slice knip-clean, 0 warnings                                          | static                   | gate        |

**Existing-tests gate**: `Image.test.tsx` (+8 improvements) record UNCHANGED — the telemetry/warn/boundary changes are additive-only; the boundary introduces no wrapper DOM when no error occurs (renders `this.props.children` verbatim when `hasError === false` → bytes-identical).

## Risks

| Risk                                                 | Impact | Mitigation                                                          |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| `console.error` vs `console.warn`                    | Medium | LOCKED — `warn` brand; storybook test-runner gate                   |
| Telemetry fires twice through fallback chain         | Low    | Documented expected (per-event semantics)                           |
| Boundary fallback function throws → uncaught         | Medium | Static `null` minimal fallback + dedicated no-loop test             |
| Render overhead inside `handleLoadError` (dev-guard) | Low    | `require('process.env.NODE_ENV')` check at the top, empty prod path |
| 76-test gate regression                              | Low    | Additive only; no wrapper DOM; hook untouched                       |

## Migration / Rollout

No data migration, no feature flags. **All additive**: one prop, one dev-only log, one zero-consumer slice, one wrap in Image. Rollback per unit: `git revert <er-01-02-commit>` restores `Image.tsx` (single file); `git revert <er-boundary-commit>` removes the slice (zero consumers beyond the wrap line in Image — the Image wrap line reverts too); docs revert trivially. Guard: single PR per concern (diagnostics → slice → wrap → docs).

## Open Questions

- [ ] None blocking. (Fallback-chain double-fire documented as expected; wheel casing verified.)

## Next Step

Ready for tasks (sdd-tasks).
