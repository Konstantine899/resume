# Spinner Component Improvement Specification

**Change**: spinner-improvements
**Status**: Draft
**Date**: 2026-08-13
**Prior**: `docs/specs/spinner-improvement-proposal.md` (SDD propose, user-approved)
**Priority**: 3 CRITICAL + 4 MEDIUM (~7.5h core, 0h deferred)

---

## Scope

This specification closes the last gaps between `src/shared/ui/Spinner/` (7 files, 237-line test suite, 570-line stories file) and the in-repo Senior+ standard: 100% Storybook play coverage on a deduplicated story set, working Controls via args-based stories, a `delay` prop that prevents flash-of-spinner on fast operations (Ant Design pattern), a meaningful `prefers-reduced-motion` test, and two CSS-native alias props (Chakra v3 style). The a11y model (`role="status"`/`aria-busy`/`aria-live="polite"`), dead-code removal (`validateSpinnerProps`, `useEffect`, `SPINNER_CONSTANTS`), `speedMap`/`thicknessMap`, and the simplified `useMemo` ALREADY landed (commits `417596d`, `4fff67f`) — this change covers ONLY the remainder.

**Non-breaking constraint:** 5 consumers (ButtonLoader, Toast, Input, Textarea, Image) import `{ Spinner }` with current props and SHALL NOT be touched. All changes are backward-compatible: additive props only (`delay`, `animationDuration`, `borderWidth`, numeric `size`), the preset size path stays byte-identical, no renamed variants/sizes/colors, no class-name changes. The existing 237-line test suite SHALL stay green UNCHANGED (behavioral-noop gate — only additions permitted).

| #   | Improvement                                                      | Requirement | Priority | Effort | Type     |
| --- | ---------------------------------------------------------------- | ----------- | -------- | ------ | -------- |
| 1   | Stories rework: meta decorators + args-based + consolidate 22→18 | SPR-01      | CRITICAL | 2h     | MODIFIED |
| 2   | Play functions on all 18 stories                                 | SPR-02      | CRITICAL | 2.5h   | MODIFIED |
| 3   | `delay` prop (mount-delay, AntD semantics)                       | SPR-03      | CRITICAL | 1h     | ADDED    |
| 4   | Reduced-motion test (source guard + matchMedia registration)     | SPR-04      | MEDIUM   | 0.5h   | ADDED    |
| 5   | `ButtonLoaderIntegration` story                                  | SPR-05      | MEDIUM   | 0.5h   | ADDED    |
| 6   | Numeric size override (`SpinnerSize \| number`)                  | SPR-06      | MEDIUM   | 0.5h   | MODIFIED |
| 7   | CSS-native alias props (`animationDuration`, `borderWidth`)      | SPR-07      | MEDIUM   | 0.5h   | ADDED    |
| 8   | Docs: `ui-kit-contract.md` Spinner specifics section             | SPR-08      | —        | 0.25h  | MODIFIED |

**Out of scope:** C1/M1/M2/M3/M6/O1 (already landed in `417596d`/`4fff67f`); consumer migration (nothing changes for the 5 consumers); variant/animation redesign; `prefers-reduced-motion` runtime JS (CSS-only handling is correct); new size presets; browser-level (Playwright) verification of the reduced-motion rule (rejected as overkill — one CSS rule).

---

## ADDED Requirements

### Requirement SPR-03: `delay` prop — mount-delay with timer cleanup

The system SHALL add `delay?: number` (milliseconds) to `SpinnerProps`. When set, the component SHALL render NOTHING (no root element, no `role="status"`, no visual, no `aria-busy`) until `delay` ms elapse after mount; when the timer fires, the spinner SHALL render normally with the existing a11y contract. Unmounting SHALL cancel the timer (effect cleanup) so no state update and no timer leak occurs. `delay` SHALL be a mount-delay: a re-mount restarts the timer. When `delay` is absent, rendering SHALL be immediate and byte-identical to today (behavioral-noop).

The system SHALL reintroduce a single, intentional `useEffect` owning the timer (M1 previously removed the old effect; this one is required and MUST clean up on unmount). The tests SHALL use fake timers (`vi.advanceTimersByTime`).

#### Scenario: nothing renders before the delay elapses

- GIVEN `<Spinner delay={300}>` mounted under fake timers
- WHEN the component mounts and no time advances
- THEN `container` MUST be empty and `screen.queryByRole('status')` MUST be null (no visual, no announcement)

#### Scenario: spinner appears after the delay

- GIVEN the same spinner under fake timers
- WHEN `vi.advanceTimersByTime(300)` fires
- THEN a `role="status"` spinner MUST be present with `aria-busy="true"` and the existing data attributes

#### Scenario: unmount cancels the timer

- GIVEN `<Spinner delay={500}>` mounted and unmounted before the timer fires
- WHEN timers are advanced after unmount
- THEN no timer SHALL remain and no setState-after-unmount / `act` warning SHALL be produced

#### Scenario: delay={0} renders immediately

- GIVEN `<Spinner delay={0}>`
- WHEN mounted
- THEN the spinner MUST render on the first frame (no flash-of-missing-spinner)

#### Scenario: no delay prop is backward compatible

- GIVEN `<Spinner>` without `delay`
- WHEN mounted
- THEN the spinner MUST render immediately, byte-identical to the pre-change output (behavioral-noop gate)

### Requirement SPR-04: Meaningful reduced-motion test (jsdom-aware)

The system SHALL add a two-part test for the existing `@media (prefers-reduced-motion: reduce)` block (`Spinner.module.scss:162-168`, `animation: none` on `.spinnerCircle`/`.outerRing`/`.innerRing`): (a) a **source-level guard** that reads the SCSS module source and asserts the reduced-motion block covers all three motion classes with `animation: none` — a deterministic regression guard; (b) a **matchMedia registration** assertion that the query `(prefers-reduced-motion: reduce)` is registered with the mock (existing mock pattern kept and sharpened). jsdom's `getComputedStyle` does NOT resolve stylesheet rules, so a "computed `animation: none`" assertion is untestable in vitest — the source guard is the honest replacement. Browser-level verification SHALL NOT be added (one CSS rule does not justify Playwright).

#### Scenario: source guard asserts the reduced-motion block

- GIVEN the test reading the `Spinner.module.scss` source
- WHEN the source is inspected
- THEN the `@media (prefers-reduced-motion: reduce)` block MUST declare `animation: none` for `.spinnerCircle`, `.outerRing`, AND `.innerRing`

#### Scenario: matchMedia registration asserted

- GIVEN a `matchMedia` mock intercepting media queries
- WHEN the Spinner renders under the mocked environment
- THEN the query `(prefers-reduced-motion: reduce)` MUST be registered with the mock

#### Scenario: static DOM remains assertable

- GIVEN the reduced-motion render
- WHEN assertions run
- THEN DOM presence assertions (role/data attributes) MUST remain valid; no computed-style `animation` assertion SHALL be attempted in jsdom

### Requirement SPR-05: ButtonLoaderIntegration story

The system SHALL add a `ButtonLoaderIntegration` story rendering a loading `Button` containing `<Spinner size="sm" color="secondary">` — the real consumer pattern from `ButtonLoader.tsx:45`. It replaces one of the removed single-size stories in the consolidated 18-story set.

#### Scenario: integration story renders the consumer pattern

- GIVEN the `ButtonLoaderIntegration` story
- WHEN the story renders
- THEN a loading Button MUST be present containing a Spinner with `data-size="sm"` and `data-color="secondary"`

#### Scenario: integration story play asserts the composition

- GIVEN the story's play function
- WHEN it runs under `npm run storybook:test`
- THEN it MUST find the spinner inside the button and assert its size/color data attributes

### Requirement SPR-07: CSS-native alias props (`animationDuration`, `borderWidth`)

The system SHALL add `animationDuration?: SpinnerSpeed` and `borderWidth?: SpinnerThickness` to `SpinnerProps` (Chakra v3 style). Both SHALL write the SAME CSS variables as the canonical props via the existing maps: `animationDuration` → `--spinner-speed` (plus the `--double-ring-speed-outer`/`-inner` pair for `variant="double-ring"`) via `speedMap`; `borderWidth` → `--spinner-thickness` (plus `--double-ring-thickness`) via `thicknessMap`. No SCSS change. On conflict the explicit canonical prop SHALL win: `speed` beats `animationDuration`, `thickness` beats `borderWidth` (documented precedence). The data attributes (`data-speed`/`data-thickness`) SHALL continue to derive from the canonical props only — aliases are visual/CSS-var-only.

#### Scenario: animationDuration maps to the same var

- GIVEN `<Spinner animationDuration="fast" variant="spinner">`
- WHEN rendered
- THEN the inline style SHALL set `--spinner-speed` to the `speedMap.fast.spinner` value (`0.4s`) — identical to `<Spinner speed="fast">`

#### Scenario: borderWidth maps to the same var

- GIVEN `<Spinner borderWidth="thick" variant="spinner">`
- WHEN rendered
- THEN `--spinner-thickness` SHALL equal the `thicknessMap.thick.spinner` value (`3px`)

#### Scenario: canonical prop wins on conflict

- GIVEN `<Spinner speed="slow" animationDuration="fast">`
- WHEN rendered
- THEN `--spinner-speed` MUST reflect `speed="slow"` (`1.2s`)

#### Scenario: double-ring vars respected

- GIVEN `<Spinner variant="double-ring" animationDuration="slow" borderWidth="thin">`
- WHEN rendered
- THEN the outer/inner speed vars MUST come from `speedMap.slow.doubleRing` and `--double-ring-thickness` from `thicknessMap.thin.doubleRing`

#### Scenario: type surface stays closed

- GIVEN an `@ts-expect-error` probe passing an invalid value to `animationDuration`
- WHEN `type-check:strict` runs
- THEN the probe SHALL be consumed (only `SpinnerSpeed`/`SpinnerThickness` values accepted)

---

## MODIFIED Requirements

### Requirement SPR-01: Stories rework — decorators, args, consolidation 22→18

The system SHALL move the `ThemeContainer` helper from per-story wrapping into the meta `decorators` entry (wraps every story automatically). Simple stories (SingleSpinner, DoubleRing, Primary, Secondary, Accent, Orange, SlowSpeed, InlineWithText, FullScreen, AvatarLoading, ReducedMotion) SHALL become args-based (`{ args: {...} }` objects) so Controls/autodocs work. Composite stories (AllVariants, AllSizes, ThemeComparison, ThicknessOptions, WithTrackColor, DoubleRingSpeed) SHALL keep their composite `render` functions. The system SHALL delete the 5 single-size stories (Small, Medium, Large, ExtraLarge, DoubleExtraLarge) — 100% redundant with `AllSizes` (Option B, recommended; Option A rejected: ~20 near-identical trivial plays for zero new information). The system SHALL add `ButtonLoaderIntegration` (SPR-05). Result: 22 − 5 + 1 = 18 stories.

(Previously: `ThemeContainer` wrapped each story individually; 22 stories including 5 redundant single-size stories; simple stories rendered via bespoke JSX with no args)

#### Scenario: ThemeContainer wraps every story via decorators

- GIVEN the reworked meta block
- WHEN inspected
- THEN the meta `decorators` SHALL contain `ThemeContainer` and no story SHALL wrap itself individually

#### Scenario: simple stories are args-based

- GIVEN `SingleSpinner` (and the other simple stories)
- WHEN the story is defined
- THEN it SHALL be an args object so Storybook Controls/autodocs render from args

#### Scenario: composite tables stay composite

- GIVEN `AllSizes`, `AllVariants`, `ThemeComparison`, `ThicknessOptions`, `WithTrackColor`, `DoubleRingSpeed`
- WHEN the stories render
- THEN each MUST keep its custom `render` composite and display ALL its options

#### Scenario: 18 stories exported, 5 removed

- GIVEN the consolidated stories file
- WHEN Storybook loads
- THEN 18 stories MUST be exported; `Small`, `Medium`, `Large`, `ExtraLarge`, `DoubleExtraLarge` MUST be absent

### Requirement SPR-02: Play functions on all 18 stories

The system SHALL add `play` functions (via `@storybook/test` `within`/`expect`) to ALL 18 stories (2/22 today → 18/18 after consolidation). Simple stories SHALL assert the a11y contract (`role="status"`, `aria-busy="true"`) plus their `data-*` attributes. Composite stories SHALL loop their option sets: AllSizes (6 sizes), AllVariants (2 variants), ThemeComparison (2 themes), ThicknessOptions/DoubleRingSpeed/WithTrackColor (3 options each). The `ReducedMotion` play SHALL assert static DOM presence only — CSS motion is SPR-04's domain, no computed-style assertions in stories.

(Previously: only 2 of 22 stories had plays — SingleSpinner and DoubleRing; 20 stories had zero interaction coverage)

#### Scenario: simple-story plays assert a11y and data attrs

- GIVEN the `Primary` (or any simple) story's play
- WHEN it runs
- THEN it MUST find `role="status"` with `aria-busy="true"` and assert `data-variant`, `data-size`, `data-color` as rendered by args

#### Scenario: AllSizes play loops all 6 presets

- GIVEN the `AllSizes` composite play
- WHEN it runs
- THEN it MUST assert each of the 6 preset size data attributes (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`) is present

#### Scenario: variant/theme/option tables loop their sets

- GIVEN the composite plays for `AllVariants`, `ThemeComparison`, `ThicknessOptions`, `DoubleRingSpeed`, `WithTrackColor`
- WHEN they run
- THEN `AllVariants` MUST assert both variants, `ThemeComparison` both themes, and each 3-option table all 3 options

#### Scenario: ReducedMotion play asserts static DOM only

- GIVEN the `ReducedMotion` story play
- WHEN it runs
- THEN it MUST assert the spinner DOM is present (role/data attrs) and MUST NOT assert computed animation styles

#### Scenario: full play coverage gate

- GIVEN the consolidated 18 stories
- WHEN `npm run storybook:test` runs
- THEN all 18 plays MUST pass

### Requirement SPR-06: Numeric size override

The system SHALL widen `size` from `SpinnerSize` to `SpinnerSize | number` (Chakra-style pixel override). At runtime, `typeof size === 'number'` SHALL set the inline `--spinner-size: ${size}px` and SKIP the preset size class (`styles[size]` guarded); the string/preset path SHALL remain byte-identical. The `data-size` attribute SHALL be emitted for string presets only — numeric sizes omit it (`data-size` stays a preset coordinate).

(Previously: `size` accepted only the 6 preset names; pixel sizing was impossible without a CSS override)

#### Scenario: numeric size writes the pixel var

- GIVEN `<Spinner size={48}>`
- WHEN rendered
- THEN the inline style SHALL contain `--spinner-size: 48px` and no preset size class SHALL be applied

#### Scenario: preset path is byte-identical

- GIVEN `<Spinner size="md">`
- WHEN rendered
- THEN the output MUST be byte-identical to the pre-change render (same class, same var, same `data-size="md"`)

#### Scenario: data-size stays preset-only

- GIVEN `<Spinner size={48}>` vs `<Spinner size="lg">`
- WHEN rendered
- THEN the numeric instance MUST NOT carry `data-size` and the preset instance MUST carry `data-size="lg"`

#### Scenario: type surface rejects non-preset strings

- GIVEN an `@ts-expect-error` probe on `<Spinner size="huge">`
- WHEN `type-check:strict` runs
- THEN the probe SHALL be consumed (only `SpinnerSize | number` accepted)

### Requirement SPR-08: Docs — Spinner specifics section

The system SHALL add a `### Spinner specifics` section to `docs/specs/ui-kit-contract.md` (placement pattern: after the existing component specifics sections) documenting: stories 18 with 18 plays; the new props (`delay`, `animationDuration`, `borderWidth`, numeric `size`); the a11y model (`role="status"`, `aria-busy`, `aria-live="polite"`, default `t('loading')` label); and the 5 consumers. The inventory row (`| Spinner | Yes | Yes | None |`) SHALL remain unchanged.

(Previously: Spinner appears only as an inventory row with no details section; story/play counts and props undocumented)

#### Scenario: section present and accurate

- GIVEN the updated `docs/specs/ui-kit-contract.md`
- WHEN inspected
- THEN a `### Spinner specifics` section MUST document stories 18, plays 18, and the new props (consistent with SPR-01/02/03/06/07)

---

## Test Expectations

| Area                                                                                         | Component                                   | Tests                                                   | Type                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- | ------------------------ |
| `delay` semantics (nothing-before / appears-after / unmount-cancel / `delay={0}` / no-delay) | Spinner                                     | 4–5                                                     | Unit (fake timers)       |
| Reduced motion (source guard + matchMedia registration)                                      | Spinner                                     | 2                                                       | Unit                     |
| Numeric size + aliases + precedence + double-ring vars                                       | Spinner                                     | 4–5                                                     | Unit                     |
| `@ts-expect-error` compile probes (`size="huge"`, invalid alias value)                       | Spinner                                     | 2                                                       | Compile-time             |
| Existing suite                                                                               | Spinner                                     | 237 lines — MUST stay green UNCHANGED (behavioral-noop) | Unit                     |
| Storybook plays                                                                              | Spinner stories                             | 18/18                                                   | `npm run storybook:test` |
| Consumers                                                                                    | ButtonLoader, Toast, Input, Textarea, Image | green unchanged                                         | Unit                     |
| Dead-code / types                                                                            | static                                      | `analyze:dead-code` no new names; `type-check:strict` 0 | Static                   |

Existing tests MUST remain unchanged (behavioral-noop gate); only additions are permitted.

## Implementation Order

```
Phase 1 (~2h) — Stories rework: SPR-01 + SPR-05
├── ThemeContainer → meta decorators
├── simple stories → args-based
├── delete 5 single-size stories; add ButtonLoaderIntegration
├── Verify: Storybook renders 18 stories

Phase 2 (~2.5h) — Plays: SPR-02
├── play functions on all 18 (composites loop; ReducedMotion DOM-only)
├── Verify: npm run storybook:test — 18/18

Phase 3 (~1h) — delay prop: SPR-03
├── types + single intentional effect/timer with unmount cleanup
├── fake-timer tests; noop gate: no delay → immediate byte-identical render

Phase 4 (~0.5h) — Reduced-motion test: SPR-04
├── source-level guard (SCSS read) + matchMedia registration assertion

Phase 5 (~1h) — Props: SPR-06 + SPR-07
├── size union + typeof guard; aliases via speedMap/thicknessMap; precedence documented
├── type-check:strict + unit tests (RED first where applicable)

Phase 6 (~0.25h) — Docs: SPR-08
├── ui-kit-contract.md Spinner specifics section

Phase 7 — Verification
├── npm run type-check:strict (0) + lint (0 warnings on touched files)
├── npx vitest run src/shared/ui/Spinner (237-line suite + additions)
├── npm run storybook:test (18 plays)
├── npm run analyze:dead-code (no new dead names)
```

## Risk Assessment

| Risk                                                      | Impact | Mitigation                                                                                |
| --------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| jsdom can't resolve stylesheet `animation` (SPR-04)       | Medium | source-level guard + matchMedia registration assertion; browser test rejected as overkill |
| `delay` reintroduces an effect (M1 removed the old one)   | Low    | intentional single timer; cleanup on unmount; fake-timer tests; no setState-after-unmount |
| Story consolidation removes 5 URLs                        | Low    | docs note; revert = restore of the deleted story objects                                  |
| Numeric `size` typing against `styles[size]`              | Low    | `typeof` guard; preset path byte-identical; `type-check:strict` gate                      |
| Alias conflict ambiguity (`speed` vs `animationDuration`) | Low    | documented precedence: explicit `speed`/`thickness` win                                   |
| Play coverage drift (18/18)                               | Low    | `storybook:test` gate                                                                     |
| Existing suite regression                                 | Low    | behavioral-noop gate — 237 lines unchanged except additions                               |

## Rollback Plan

- Per-concern commits (stories → delay → tests → aliases → docs); `git revert <commit>` per concern is surgical.
- SPR-03/SPR-06/SPR-07 are additive props — removal is a drop; existing preset tests unchanged (behavioral-noop).
- Story consolidation (SPR-01) reverts to the 22-story file intact (restore the deleted story objects).
- Docs (SPR-08) revert trivially (`docs/specs/*.md` untracked by git — expected; commit scope = `src/` only).

## Success Criteria

- [ ] `type-check:strict` + `lint` (0 warnings); full vitest green; existing 237-line test assertions UNCHANGED
- [ ] `npm run storybook:test` — 18 stories, 18 passing plays
- [ ] Composites loop options: AllSizes (6), AllVariants (2), ThemeComparison (2), ThicknessOptions/DoubleRingSpeed/WithTrackColor (3 each)
- [ ] `delay`: nothing before the timer (`queryByRole('status')` null), spinner after `vi.advanceTimersByTime(delay)`, timer cleaned on unmount, `delay={0}` immediate, no `delay` → byte-identical
- [ ] SPR-04: source guard asserts `animation: none` for all 3 motion classes; `matchMedia('(prefers-reduced-motion: reduce)')` registration asserted
- [ ] `<Spinner size={48}>` → `--spinner-size: 48px`, no preset class, no `data-size`; presets byte-identical
- [ ] `animationDuration`/`borderWidth` set the same vars as `speed`/`thickness` (incl. the double-ring pair); precedence documented
- [ ] `ui-kit-contract.md` Spinner specifics section: stories 18, plays 18
- [ ] 5 consumers green unchanged; no new dead names
