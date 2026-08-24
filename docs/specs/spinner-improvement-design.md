# Design: Spinner Component Improvement

**Change**: spinner-improvements · **Status**: Draft · **Date**: 2026-08-13
**Scope source**: `docs/specs/spinner-improvement-spec.md` (SPR-01..08)
**Non-breaking gate**: existing 237-line `Spinner.test.tsx` suite passes UNCHANGED (behavioral-noop); 5 consumers (ButtonLoader, Toast, Input, Textarea, Image) import `{ Spinner }` with current props and stay untouched.

## Overview

Close the last gaps between `src/shared/ui/Spinner/` and the in-repo Senior+ standard: deduplicated args-based stories with 100% play coverage (SPR-01/02/05), a `delay` mount-prop (AntD semantics, SPR-03), an honest jsdom-aware reduced-motion test (SPR-04), numeric size + CSS-native alias props (SPR-06/07), and a docs contract section (SPR-08). All changes are additive or behavioral-noop; the preset render path stays byte-identical.

**Key verified facts (this session):**

- `Spinner.tsx` is pure `memo(forwardRef<HTMLDivElement>)` — **zero effects today**; SPR-03 introduces the single intentional `useEffect` + timer with unmount cleanup (M1 removed the old effect; the new one is required).
- `speedMap` (`1.2s/0.8s/0.4s` single, `1.5s/1.3s`·`1s/0.85s`·`0.6s/0.5s` double-ring) and `thicknessMap` (`1.5/2/3px` single, `3/4/5px` double-ring) already carry everything SPR-07 needs — **no constants change**.
- SCSS reduced-motion block is exactly `@media (prefers-reduced-motion: reduce) { .spinnerCircle, .outerRing, .innerRing { animation: none; } }` (lines 162–168) — single rule, selector list, one declaration.
- **The component never calls `window.matchMedia`** (grep: only the test file references it) — reduced-motion is CSS-only. SPR-04's "matchMedia registration" is therefore test-harness-side (mock install + DOM contract); the deterministic guarantee is the source guard (Decision 2).
- `classNames` util filters falsy args (verified) — an `undefined` size class is safe.
- `?raw` SCSS imports are **broken in this repo's test pipeline**: `Paragraph.test.tsx:14-18` documents that vitest's CSS-module stub intercepts them and returns the identity proxy, not source. `vite-env.d.ts` has NO `*.scss?raw` declaration (only `*.scss`). The repo-proven pattern is disk reads.
- Button consumer pattern for SPR-05 confirmed: `ButtonLoader.tsx:45` → `<Spinner size="sm" color="secondary" label={BUTTON_CONSTANTS.DEFAULT_SPINNER_LABEL} />`; Button story precedent `LoadingWithSpinner` (`Button.stories.tsx:195`) uses args `{ loading: true, loadingVariant: 'spinner' }`.

## Architecture

### File tree (before → after)

```
src/shared/ui/Spinner/
├── model/types.ts                    MODIFY  (size: SpinnerSize | number; +delay, animationDuration, borderWidth)
├── model/constants.ts                UNCHANGED (speedMap/thicknessMap suffice — SPR-07 consumes them)
├── ui/Spinner.tsx                    MODIFY  (delay effect + early null; numeric-size var; alias merge; canonical data-attrs)
├── ui/Spinner.module.scss            UNCHANGED (all CSS vars already exist; reduced-motion block stays)
├── ui/Spinner.test.tsx               MODIFY  (new describe blocks ONLY; existing 237 lines untouched)
├── ui/Spinner.stories.tsx            MODIFY  (ThemeContainer → meta decorators; 22→18 stories; args; 18 plays)
└── index.ts                          UNCHANGED (named exports; new props flow via SpinnerProps type re-export)

docs/specs/ui-kit-contract.md         MODIFY  (SPR-08: ### Spinner specifics section)
```

**Dependency order**: types → component (delay → size/aliases) → unit tests (RED-first for new behavior) → stories/plays → docs → verify.

## Per-requirement design

### SPR-01 — Stories rework (decorators, args, consolidate 22→18)

- Move `ThemeContainer` into `meta.decorators: [(Story) => <ThemeContainer><Story /></ThemeContainer>]`; delete per-story wrapping (FullScreen and ThemeComparison keep their own bespoke render — they are composites).
- 11 simple stories become args objects (meta defaults `{ variant:'spinner', size:'md', color:'primary' }` + per-story overrides): `SingleSpinner`, `DoubleRing`, `Primary`, `Secondary`, `Accent`, `Orange`, `SlowSpeed`, `InlineWithText`, `FullScreen`, `AvatarLoading`, `ReducedMotion`.
- 6 composites keep custom `render`: `AllVariants`, `AllSizes`, `ThemeComparison`, `ThicknessOptions`, `WithTrackColor`, `DoubleRingSpeed`.
- Delete the 5 single-size stories (Small/Medium/Large/ExtraLarge/DoubleExtraLarge — 100% redundant with AllSizes + Controls); add `ButtonLoaderIntegration` (SPR-05). Result: 22 − 5 + 1 = **18**.
- **Accepted consequences** (spec-locked): `SlowSpeed`/`FullScreen`/`AvatarLoading` become single-instance demos; the 3-speed comparison and the fixed-overlay/Avatar composites dissolve — Controls + composites cover the coordinate space.

### SPR-02 — Play functions on all 18

`@storybook/test` `within`/`expect`, sync only. Simple stories assert the a11y contract (`role="status"`, `aria-busy="true"`) + the story's `data-*` attrs. Composites loop their option sets (AllSizes → 6 `data-size` presets; AllVariants → both `data-variant`; ThemeComparison → 2 themes; ThicknessOptions/DoubleRingSpeed/WithTrackColor → 3 options each). `ReducedMotion` play asserts static DOM only (role/data attrs) — motion is SPR-04's domain, no computed-style assertions (jsdom can't resolve stylesheet rules).

### SPR-03 — `delay` prop (mount-delay)

Type: `delay?: number` (ms). Component gains exactly one `useState` + one intentional `useEffect`:

```tsx
const [visible, setVisible] = useState<boolean>(delay === undefined || delay === 0);

useEffect(() => {
  if (delay === undefined || delay === 0) return; // no timer on the default path
  const timer = window.setTimeout(() => setVisible(true), delay);
  return () => window.clearTimeout(timer); // unmount → no setState-after-unmount
}, [delay]);

if (!visible) return null; // AFTER all hooks — hook order stable
```

- **No `delay`** → `visible=true` initially, effect no-ops → byte-identical (237-gate).
- **`delay>0`** → nothing renders (no root, no `role="status"`, no `aria-busy`, no visual) until the timer fires; re-mount restarts (state resets on mount). Once visible, stays visible.
- **`delay={0}`** → initial `visible=true`, immediate first-frame render.
- Unmount before fire → cleanup clears the timer (test asserts `clearTimeout` called). Tests use `vi.useFakeTimers()` + `act(() => { vi.advanceTimersByTime(delay); })`.

### SPR-04 — Reduced-motion test (jsdom-aware)

**(a) Source-level guard** — deterministic regression guard for the SCSS block (Decision 2 mechanism):

```ts
const readScss = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf-8');
const spinnerScss = readScss('./Spinner.module.scss');
```

Assert the `@media (prefers-reduced-motion: reduce)` block contains `.spinnerCircle`, `.outerRing`, `.innerRing` AND `animation: none`. Since the block is one rule with a selector list and one declaration, a slice-and-match on the media block is deterministic and stable.

**(b) matchMedia registration + DOM contract** — the component performs no JS media-query work (CSS-only handling is correct, spec-locked), so the test keeps the existing mock pattern "sharpened": mock intercepts exactly `(prefers-reduced-motion: reduce)` (matches:true for it, false otherwise), render, assert the a11y/DOM contract holds (`role="status"`, `data-variant`, `data-size`). No computed-style assertion attempted — that would be untestable in jsdom (spec's own rationale). **The registration assertion is test-harness-side by necessity** (see Decision 2).

### SPR-05 — `ButtonLoaderIntegration` story

Custom-render story composing the real consumer pattern: `<Button loading loadingVariant="spinner">…</Button>` (Button args precedent `LoadingWithSpinner`), which renders `<Spinner size="sm" color="secondary">` via ButtonLoader. Play: find `role="status"` inside the button and assert `data-size="sm"` + `data-color="secondary"`.

### SPR-06 — Numeric size override

`size?: SpinnerSize | number`. Runtime: `typeof size === 'number'` → inline `--spinner-size: ${size}px`, preset class skipped (`const sizeClass = typeof size === 'number' ? undefined : styles[size]` — `classNames` filters the undefined); `data-size` emitted for string presets only (`data-size={typeof size === 'string' ? size : undefined}`). Preset path byte-identical (same class, same SCSS var, same `data-size`). Compile probe: `<Spinner size="huge">` rejected via `@ts-expect-error`.

### SPR-07 — CSS-native aliases

`animationDuration?: SpinnerSpeed`, `borderWidth?: SpinnerThickness`. Resolution inside the existing single `useMemo`:

```ts
const resolvedSpeed = speed ?? animationDuration; // explicit canonical WINS
const resolvedThickness = thickness ?? borderWidth; // explicit canonical WINS
```

Both write the SAME vars via `speedMap`/`thicknessMap` as the canonical props (single-ring: `--spinner-speed`/`--spinner-thickness`; double-ring: `--double-ring-speed-outer`/`-inner` + `--double-ring-thickness`). **No SCSS change.** `data-speed`/`data-thickness` stay derived from canonical `speed`/`thickness` only — aliases are visual/CSS-var-only. Compile probe: invalid alias value rejected (`@ts-expect-error`).

### SPR-08 — Docs

`### Spinner specifics` section in `docs/specs/ui-kit-contract.md` (placement: with the other component specifics sections): stories 18 / plays 18, new props (`delay`, `animationDuration`, `borderWidth`, numeric `size`), a11y model (`role="status"`, `aria-busy`, `aria-live="polite"`, default `t('loading')` label), 5 consumers. Inventory row `| Spinner | Yes | Yes | None |` unchanged.

## Deliverable decisions

| #   | Decision                                                                                                                              | Alternatives                                        | Rationale                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **SCSS source-guard reads via `readFileSync(new URL(rel, import.meta.url), 'utf-8')`** (module-level, Paragraph PAR-09 pattern)       | Vite `?raw` import                                  | Repo-verified: `Paragraph.test.tsx:14-18` documents `?raw` being intercepted by vitest's CSS-module stub (identity proxy, not source) — `?raw` is broken in this pipeline. No `*.scss?raw` declaration exists in `vite-env.d.ts` and none is needed. Disk reads are deterministic, environment-agnostic (vitest runs in Node under jsdom globals), and don't depend on the Vite transform pipeline. |
| 2   | **Reduced-motion matchMedia test = harness-side mock install + DOM contract; the source guard is the deterministic motion guarantee** | Literal "query registered by component" assertion   | The component NEVER calls `matchMedia` (grep-verified) — reduced-motion is CSS-only by design (spec out-of-scope). A "component registered the query" assertion is unimplementable; the honest jsdom-capable split is (a) deterministic source guard + (b) mock-install/DOM-contract test, matching the spec's own "browser test rejected as overkill" reasoning.                                   |
| 3   | **Delay = `useState` initializer + single effect, early `return null` AFTER all hooks**                                               | Effect-gated render flag in JSX; `useLayoutEffect`  | Rules of hooks: unconditional hook order; initializer makes `delay=undefined`/`0` timer-free (byte-identical default path). Cleanup `clearTimeout` satisfies unmount-cancel. Effect stays the ONLY one in the component (SPR-03's intentional timer).                                                                                                                                               |
| 4   | **Single `useMemo` builds all CSS vars; aliases merged as `speed ?? animationDuration` / `thickness ?? borderWidth`**                 | Separate memo per prop; alias-to-canonical mutation | One derivation keeps var logic + dep array in one place (current `inlineStyle` extended); nullish coalescing gives canonical-wins precedence with zero branching; data-attrs read the canonical props directly so aliases can't leak into them.                                                                                                                                                     |
| 5   | **Numeric size: `typeof` guard on class index + inline var + canonical-only `data-size`**                                             | Always-inline size var                              | `styles[size]` with a number is a TS index error — the guard narrows. Preset path untouched → byte-identical; `data-size` stays a preset coordinate (spec).                                                                                                                                                                                                                                         |
| 6   | **Story split: 11 args-based + 6 composites + 1 integration = 18**                                                                    | Keep all 22; plays on 22                            | Spec Option B (redundant single-size stories killed; composite loops deliver equivalent coverage in ~10 plays); `ButtonLoaderIntegration` replaces one removed slot. `SlowSpeed`/`FullScreen`/`AvatarLoading` single-instance demos accepted per spec.                                                                                                                                              |
| 7   | **No constants/SCSS/index changes**                                                                                                   | —                                                   | `speedMap`/`thicknessMap`/CSS vars already cover SPR-06/07; `index.ts` re-exports `SpinnerProps` (type surface grows automatically). Zero-churn collateral.                                                                                                                                                                                                                                         |

## Data flow

```
<Spinner size={48} speed="slow" animationDuration="fast" delay={300}>
  ├─ useState: visible = (delay === undefined || delay === 0) ? true : false
  ├─ useEffect [delay]: delay>0 → setTimeout(setVisible(true), delay); unmount → clearTimeout
  ├─ if (!visible) return null                      // pre-delay: no root, no role="status"
  ├─ inlineStyle (single useMemo):
  │     vars['--spinner-track']      ← trackColor
  │     vars['--spinner-size']       ← size is number ? `${size}px`          [SPR-06]
  │     resolvedSpeed     = speed ?? animationDuration                      [SPR-07]
  │     resolvedThickness = thickness ?? borderWidth                         [SPR-07]
  │     spinner:   --spinner-speed / --spinner-thickness                    via speedMap/thicknessMap
  │     double-ring: --double-ring-speed-outer / -inner / --double-ring-thickness
  ├─ rootClassName = classNames(root, sizeClass /* undefined for number */, styles[color], className)
  └─ render
      <div ref role="status" aria-busy aria-live aria-label
           data-variant data-size?  data-color data-speed? data-thickness?
           style={inlineStyle}>
        spinner | double-ring (outerRing + innerRing)
      </div>
```

## Test plan

| Layer                   | What                                                                                                                                                                                                                         | How                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Unit (existing)         | 237-line suite                                                                                                                                                                                                               | **UNCHANGED** — behavioral-noop gate       |
| Unit (new, fake timers) | delay: nothing before `delay` (`queryByRole('status')` null, empty container); appears after `act(advanceTimersByTime)`; unmount cancels (`clearTimeout` spy, no act warning); `delay={0}` immediate; no prop byte-identical | 5 tests                                    |
| Unit (new)              | SPR-04: source guard (`animation: none` + 3 classes in the reduce media block); matchMedia mock install + DOM contract                                                                                                       | 2 tests                                    |
| Unit (new)              | SPR-06/07: numeric `--spinner-size: 48px` + no preset class + no `data-size`; preset byte-identical; alias→same var; canonical-wins precedence; double-ring alias pair                                                       | 4–5 tests                                  |
| Compile-time            | `@ts-expect-error`: `size="huge"`, invalid `animationDuration` value                                                                                                                                                         | 2 probes (consumed by `type-check:strict`) |
| Interaction             | 18 stories / 18 plays incl. composites looping option sets                                                                                                                                                                   | `npm run storybook:test`                   |
| Consumers               | ButtonLoader, Toast, Input, Textarea, Image suites                                                                                                                                                                           | green unchanged                            |
| Static                  | `analyze:dead-code` no new names; `type-check:strict` 0; lint 0                                                                                                                                                              | gate                                       |

## Risks

| Risk                                             | Impact | Mitigation                                                                                              |
| ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------- |
| `?raw` SCSS source-guard breaks in vitest        | Medium | **Decision 1: disk read** (Paragraph-proven pattern); no declaration needed                             |
| matchMedia "registration" literally unassertable | Medium | Decision 2: harness-side mock + source guard; documented in spec-style honesty                          |
| `delay` reintroduces an effect (M1 removed one)  | Low    | Intentional single timer, `clearTimeout` cleanup, fake-timer tests, no-setState-after-unmount assertion |
| Numeric `size` typing vs `styles[size]`          | Low    | `typeof` guard narrows; `classNames` filters undefined; `type-check:strict` gate                        |
| Alias precedence ambiguity                       | Low    | Nullish merge — explicit canonical wins; documented; probe test                                         |
| 5 removed story URLs                             | Low    | Docs note (SPR-08); revert = restore deleted story objects                                              |
| Existing suite regression                        | Low    | behavioral-noop gate — 237 lines unchanged except additive describes                                    |

## Migration / Rollout

No data migration, no feature flags. All additive props (`delay`, `animationDuration`, `borderWidth`, numeric `size`) — removal is a drop; preset path unchanged. Per-concern commits (stories → delay → tests → aliases → docs) so `git revert <commit>` is surgical per concern. `docs/specs/*.md` untracked by git (expected; commit scope = `src/` only).

## Threat Matrix

**N/A** — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Changes are presentational + test-harness only.

## Open Questions

- [ ] None blocking. (Decision 2 resolves the SPR-04 matchMedia literal-reading gap; `SlowSpeed`/`FullScreen`/`AvatarLoading` single-instance demos are accepted spec consequences.)

## Next Step

Ready for tasks (sdd-tasks).
