# Icon Component Improvement Specification

**Change**: icon-improvements
**Status**: Draft
**Date**: 2026-08-07
**Prior**: `icon-improvement-proposal.md` (SDD explore)
**Priority**: 7 CRITICAL + 1 MODIFIED (~8–9h core)

---

## Scope

This specification upgrades Icon (`src/shared/ui/Icon/`) to the in-repo Senior+ standard — the last `shared/ui` component still lacking a generic polymorphic `component` prop and a self-guarded dev validator. Concretely: a generic polymorphic `component` prop with type-safe refs via the Heading `memo`-cast (Button/Paragraph/Link precedent), a `useIcon` hook + `useLink`-style `validateIconProps` dev validator, a polymorphic a11y/keyboard fork that preserves the interactive `<span role="button">` path byte-identically while lifting that behavior off real interactive elements, `@ts-expect-error` compile coverage, and new polymorphic/ref/hook/a11y tests.

**Non-breaking gate:** Icon ships 9 files as a closed `forwardRef<HTMLSpanElement, IconProps>` + `React.memo` over a hardcoded `<span>`. Consumer reality is thin: exactly ONE production consumer (`Link/ui/Link.tsx:138` — `<Icon name color="inherit" decorative>`, no `component`, no ref) plus type-only `IconName`/`IconSize` imports. Zero external `ref=` usage (grep-verified). The change is fully isolated and additive: default `component='span'` renders byte-identical DOM when the default path is taken, so all ~67 existing test assertions and 5 storybook plays MUST stay green unchanged (behavioral-noop gate).

| #   | Improvement                                 | Requirement      | Priority | Type     |
| --- | ------------------------------------------- | ---------------- | -------- | -------- |
| 1   | Polymorphic `component` prop with generics  | ICR-01           | CRITICAL | ADDED    |
| 2   | Type-safe ref forwarding + memo-cast        | ICR-02           | CRITICAL | ADDED    |
| 3   | Polymorphic a11y/keyboard fork              | ICR-03           | CRITICAL | ADDED    |
| 4   | `useIcon` hook (thin component)             | ICR-04           | CRITICAL | MODIFIED |
| 5   | `validateIconProps` dev validator           | ICR-05           | CRITICAL | ADDED    |
| 6   | `@ts-expect-error` compile coverage         | ICR-06           | CRITICAL | ADDED    |
| 7   | New tests + consumer check                  | ICR-07           | CRITICAL | ADDED    |
| 8   | Docs: refresh `ui-kit-contract.md` Icon row | (no requirement) | —        | docs     |

**API decision (locked):** the polymorphic prop is named `component` (NOT `as` — Tooltip/Popover/Slot already own `as`; matches Button/Link precedent). Default `component='span'`.

**Out of scope:** consumer adoption into Button/Input/Toast/Sidebar raw-icon sites (follow-up mirroring the `ProjectCard` precedent for Link); cross-slice size-map harmonization (Icon `xl=32` vs Button/Input `xl=28`); extra variants; `asChild`/Slot; plays on all stories (all 5 already have plays).

---

## ADDED Requirements

### Requirement ICR-01: Polymorphic `component` prop with generics

The system SHALL add a generic `component` prop (`C extends ElementType = 'span'`) to Icon, splitting the closed `IconProps` into an `IconOwnProps` surface (current Lucide/span fields, minus the hardcoded `<span>` span-only props) plus the polymorphic merge: `IconProps<C> = IconOwnProps & Omit<ComponentPropsWithRef<C>, keyof IconOwnProps | 'component'> & { component?: C }` (Button/Paragraph/Link in-repo pattern). Default rendering (`component='span'`) SHALL NOT change.

The system SHALL preserve `React.memo` with the generic via the Heading/Button/Link memo-cast idiom and SHALL render `<Component ref={ref} {...rest}>` directly in place of the hardcoded `<span>`.

#### Scenario: Renders as `a` with `href`

- GIVEN `<Icon component="a" href="/about" name={Home}>`
- WHEN the component renders
- THEN the root element MUST be `<a>` with `href="/about"` and the icon wrapper classes
- AND TypeScript MUST accept `href` (anchor-specific prop forwarded)

#### Scenario: Default remains `<span>`

- GIVEN `<Icon name={Home}>` with no `component`
- WHEN the component renders
- THEN the root element MUST be `<span>` (byte-identical, backward compatible)

#### Scenario: Custom component receives merged props

- GIVEN `<Icon component={CustomWrapper} name={Home} className="x">` where `CustomWrapper` is a React component
- WHEN the component renders
- THEN `CustomWrapper` SHALL receive the merged icon className and `name` (icon own props)

#### Scenario: Element-specific prop rejected for wrong component

- GIVEN `<Icon component="span" href="/x">`
- WHEN `type-check:strict` runs
- THEN TypeScript MUST report an error (`href` is not a span attribute — rejected by `@ts-expect-error`)

#### Scenario: Class/data-attribute rendering is backward-compatible

- GIVEN `<Icon component="a" name={Home} className="custom" data-testid="icon">`
- WHEN rendered
- THEN the element MUST carry the `icon` module class, `custom`, `data-size`, `data-color`, `data-interactive` — no class-name or attribute changes

### Requirement ICR-02: Type-safe ref forwarding

**Requirement**: The system SHALL type the forwarded ref as `ForwardedRef<ComponentRef<C>>`, resolving the ref type to the rendered element (Heading/Link precedent). The existing `forwardRef<HTMLSpanElement, IconProps>` closed typing SHALL be generalized.

#### Scenario: Ref resolves per component

- GIVEN `<Icon component="a" ref={ref} name={Home}>`
- WHEN rendered
- THEN `ref.current` MUST be an `HTMLAnchorElement`

#### Scenario: Default ref is HTMLSpanElement

- GIVEN `<Icon ref={ref} name={Home}>`
- WHEN rendered
- THEN `ref.current` MUST be an `HTMLSpanElement` (previously `HTMLElement` — valid, was `HTMLSpanElement`)

#### Scenario: Existing consumers unaffected

- GIVEN the `Link` prod site and any consumer referencing the default ref
- WHEN they compile after the refactor
- THEN no type errors MUST appear (TS error-first; runtime noop)

### Requirement ICR-03: Polymorphic a11y/keyboard fork

The system SHALL fork the interactive behavior by rendered element type. When `component='span'` (default), the CURRENT a11y path MUST be preserved EXACTLY: `onClick`, `handleKeyDown` (Enter/Space), auto-`role="button"`, `tabIndex={isInteractive ? 0 : undefined}`, `aria-pressed`, `data-interactive="true"`, `aria-hidden`/`aria-label` from `decorative`/`ariaLabel` — byte-identical DOM. For a non-`span` `component`, the system SHALL forward `onClick`/`onKeyDown`/`role` but SHALL NOT auto-inject `role="button"`/`tabIndex`, and SHALL NOT run the span-only `handleKeyDown` Enter/Space lift — the real element (e.g. a native `<button>`) SHALL decide its own semantics and focusability.

#### Scenario: Default span interactive is byte-identical

- GIVEN `<Icon name={Home} onClick={fn} ariaLabel="Go">` (default span)
- WHEN the component renders
- THEN the element MUST be a `<span>` with `role="button"`, `tabindex="0"`, `data-interactive="true"`, and Enter/Space/keydown behavior identical to the current implementation

#### Scenario: component='button' does not override native attributes

- GIVEN `<Icon component="button" name={Home} onClick={fn} ariaLabel="Go">`
- WHEN the component renders
- THEN the rendered `<button>` MUST NOT receive an injected `role="button"` and MUST NOT have a forced `tabIndex` override — it relies on the native `type`/`role`/focusability
- AND `onClick` MUST be forwarded to the button

#### Scenario: No a11y fork on non-interactive span

- GIVEN `<Icon component="span" name={Home}>` (no onClick)
- WHEN rendered
- THEN the element MUST keep `role="img"` and no `tabindex` (unchanged non-interactive path)

#### Scenario: handleKeyDown applied to span only

- GIVEN `<Icon component="div" name={Home} onClick={fn}>`
- WHEN the component renders
- THEN `onKeyDown` MUST be forwarded but the span Enter/Space re-dispatch logic MUST NOT run — the protected a11y coordinate stays on the span defaults

### Requirement ICR-04: `useIcon` hook — thin component

The system SHALL extract `lib/hooks/useIcon.ts` (or `model/useIcon.ts`, mirroring `useLink`/`useSection`) consolidating the inline `useMemo`/computed values into a single `useMemo` returning `{ iconClassName, iconStyle, dataAttrs, ariaProps, isInteractive }`. The UI component SHALL become thin (`const { … } = useIcon({…}); return <Component {...rest} {...}>…`). The refactor SHALL be a behavioral noop: all existing tests/plays MUST pass unchanged.

#### Scenario: Hook returns computed className

- GIVEN `useIcon({ name, size: 'xl', color: 'primary', disabled: false, onClick })`
- WHEN called
- THEN the returned `iconClassName` MUST contain the mapped `icon`/`disabled`/`clickable` classes and the `disabled`/`interactive` mods

#### Scenario: Hook returns data attributes

- GIVEN `useIcon({ size: 'sm', color: 'warning', isInteractive: true })`
- WHEN called
- THEN `dataAttrs` MUST equal `{ 'data-size':'sm', 'data-color':'warning', 'data-interactive':true }` (or the equivalent `dataAttrs` surface)

#### Scenario: Byte-identical default span

- GIVEN the refactored component rendering `<Icon name={Home}>`
- WHEN the DOM is compared to the current implementation
- THEN the root element and all attributes MUST be byte-identical (behavioral-noop gate — zero ui-test breakage)

### Requirement ICR-05: `validateIconProps` dev validator

**Type**: MODIFIED. The system SHALL add `validateIconProps` (in `model/constants.ts` or `model/validate.ts`) self-guarded via `if (process.env.NODE_ENV !== 'development') return;`. The validator SHALL run a mount `console.warn` on invalid props: `size` (numeric `> 0` or a valid `IconSize`), `color` (must be a valid `IconColor` literal or a valid CSS string), `strokeWidth` (must be in `VALID_STROKE_WIDTHS`), `name` (must be a lucide `LucideIcon` component). Additive — the keyword call is non-throwing, and no existing validation is removed. (Previously: no such validator existed.)

The return SHALL be the `width`/`height`/`color` inline style object; the hook MAY pass it through.

#### Scenario: dev-warn on invalid size

- GIVEN `validateIconProps({ size: 0 })` with `NODE_ENV='development'`
- WHEN called
- THEN `console.warn` MUST be invoked with the invalid size in the message (numeric must be > 0)

#### Scenario: no warn in production

- GIVEN `validateIconProps({ size: 0 })` with `NODE_ENV='production'`
- WHEN called
- THEN `console.warn` MUST NOT be called
- AND invalid value MUST still be gracefully handled (falls back to `md` via `getSizeInPixels`)

#### Scenario: warn on invalid strokeWidth

- GIVEN `validateIconProps({ strokeWidth: 4 })` with dev NODE_ENV
- WHEN called
- THEN `console.warn` MUST be called with the full `VALID_STROKE_WIDTHS` list

#### Scenario: name must be a component

- GIVEN `validateIconProps({ name: 'Home' })` (a string, not a `LucideIcon`)
- WHEN called in development
- THEN `console.warn` MUST be invoked indicating `name` must be a lucide component

### Requirement ICR-06: `@ts-expect-error` compile coverage (new `Icon.polymorphic.test.tsx`)

The system SHALL add a compile-time test file `ui/Icon.polymorphic.test.tsx` covering invalid prop combos and ref types: rejected element-specific props pass to the wrong `component` (`href` on `span`), an element prop rejected on a custom component without it, and per-`component` ref type assertions. Compile-time probes are verified by `type-check:strict` consuming the `@ts-expect-error` annotations.

#### Scenario: span rejects `href`

- GIVEN an `@ts-expect-error` assertion on `<Icon component="span" href="/x">`
- WHEN `type-check:strict` runs
- THEN the assertion MUST be consumed (no unused diagnostic)

#### Scenario: element-only prop rejected on custom component

- GIVEN a `@ts-expect-error` assertion passing an anchor-only attribute to a custom component without that prop
- WHEN type-checking
- THEN the assertion MUST be consumed

#### Scenario: ref type per component (runtime)

- GIVEN `<Icon component="a" ref={ref} name={Home}>`
- WHEN the test runs
- THEN `ref.current` MUST be `instanceof HTMLAnchorElement`

### Requirement ICR-07: New tests + integration/consumer check

The system SHALL add unit tests in `ui/Icon.polymorphic.test.tsx` and `lib/hooks/useIcon.test.ts` (or the relevant location) covering: polymorphic rendering (custom component + element props, 4), ref-per-`component` (2–3), `@ts-expect-error` compile (2–3), `useIcon` hook (className, attrs, dev-warn/no-warn, ~4–5), and a11y lift-off for `component='button'` (2). The existing suite (~67 assertions across `Icon.test.tsx` + `constants.test.ts` + 5 storybook plays) MUST stay green UNCHANGED. Integration isolation check: the `Link` production site (`Link/ui/Link.tsx`) SHALL compile and render byte-identical.

#### Scenario: Polymorphic custom-component test

- GIVEN a test rendering `<Icon component={CustomComp} name={Home} href="/x">`
- WHEN the test runs
- THEN `CustomComp` MUST receive the merged icon className and `href`

#### Scenario: ref-per-component test

- GIVEN a test rendering `<Icon component="button" ref={ref} name={Home}>` (or a real `<button>`)
- WHEN the test runs
- THEN `ref.current` MUST be `instanceof HTMLButtonElement`

#### Scenario: Compile-time conditional-prop test

- GIVEN `@ts-expect-error` assertions from ICR-06
- WHEN `type-check:strict` runs
- THEN the assertions MUST be consumed

#### Scenario: Hook tests

- GIVEN the `useIcon` unit tests (className, dataAttrs, style, dev-warn/no-warn)
- WHEN the suite runs
- THEN all assertions MUST pass without rendering a component

#### Scenario: Link integration stays byte-identical

- GIVEN the `Link` production icon site (`externalIcon`) using the new component
- WHEN the Link suite + screenshots run
- THEN it MUST compile (`import { Icon }`) and render without change (no `component` prop, default `span`)

#### Scenario: a11y lift-off does not regress default span

- GIVEN the existing interactive span tests (role/tabIndex/aria-pressed/handleKeyDown)
- WHEN the full Icon test suite runs
- THEN all assertions MUST pass UNCHANGED

---

## Deferred Items (documented, NOT requirements)

| Item                                                          | Rationale                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| Consumer adoption (Button/Input/Toast/Sidebar raw-icon sites) | Isolated follow-up, mirroring `ProjectCard` precedent for Link |
| Size-map harmonization (Icon `xl=32` vs Button/Input `xl=28`) | Cross-slice effort; additive and safe, no single requirement   |
| Extra variants / `asChild`/Slot                               | Stratified upgrade; not needed for the core-only DoD           |
| Storybook `play` for polymorphic custom-component story       | Already 100% plays on the 5 stories; poly play is follow-up    |

---

## Test Expectations

| Area                                                                    | Component   | Tests                                   | Type                     |
| ----------------------------------------------------------------------- | ----------- | --------------------------------------- | ------------------------ |
| Polymorphic rendering (`a`, span, custom component, style preservation) | Icon        | 4                                       | Unit                     |
| Ref typing per `component` (span default, `a`)                          | Icon        | 2–3                                     | Unit                     |
| `@ts-expect-error` / compile-time (span href, custom attr)              | Icon        | 2–3                                     | Compile-time             |
| `useIcon` hook (className, dataAttrs, style, dev-warn/no-warn)          | model/hooks | 4–5                                     | Unit                     |
| a11y lift-off for `component='button'` (native attrs preserved)         | Icon        | 2                                       | Unit                     |
| Existing Icon suite                                                     | Icon        | ~67 (MUST stay green UNCHANGED)         | Unit                     |
| Storybook plays (5 existing, 0 new)                                     | Icon        | 5                                       | `npm run storybook:test` |
| Integration/consumer                                                    | Link        | prod site compiles + byte-identical DOM | Type + runtime           |

Existing tests MUST remain unchanged through the `useIcon` refactor (behavioral-noop gate).

---

## Implementation Order

```
Phase 1 (~4h) — Polymorphic core
├── ICR-01: model/types.ts — IconOwnProps + generic IconProps<C>
├── ICR-02: ref typing (ComponentRef<C>) + Button/Link memo-cast in ui/Icon.tsx
├── ICR-03: a11y/keyboard fork — default span EXACT; non-span forwards only
├── ICR-07/ICR-06: new tests FIRST (red vs closed typing), then implement

Phase 2 (~2.5h) — Hook + validator
├── ICR-04: useIcon hook (single useMemo) + thin component
├── ICR-05: validateIconProps (self-guarded NODE_ENV) + warn scenarios
├── Behavioral-noop gate: ~67 existing assertions + 5 plays green UNCHANGED

Phase 3 (~1h) — Stories + docs + verification
├── (stories unchanged — already 100% plays)
├── Docs: refresh Icon row in docs/specs/ui-kit-contract.md
├── Verification: type-check:strict + lint:strict (0), analyze:dead-code (no dup names),
│    npx vitest run src/shared/ui/Icon, screenshot diff Link site
```

---

## Risk Assessment

| Risk                                                          | Impact   | Mitigation                                                        |
| ------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| Generic + `React.memo` incompatibility                        | Blocking | Button/Link/Heading memo-cast — copy in-repo                      |
| Polymorphic a11y fork changes `<span role="button">` behavior | Medium   | Keep default-span EXACT; add `component="button"` lift-off test   |
| Ref-type widening breaks strict consumers                     | Low      | grep: zero external ref use on Icon; TS-error-first, runtime noop |
| `useIcon` refactor regression                                 | Low      | Behavioral-noop gate: ~71 assertions pass unchanged               |
| `Link` integration dependence (icon consumer)                 | Low      | byte-identical default element; no `component` at Link site       |

---

## Rollback Plan

- Change is additive + behavioral-noop the automated path. `git revert <core-commit>` restores the closed `<span>`; the `component` prop is additive and drop-worthy.
- Validator (ICR-05) is dev-only (`NODE_ENV`) — no prod surface; removal is a drop.
- The MEMO refactor (ICR-04) is a same-DOM move with no visible change.
- Guard: single PR per concern (core types → hook/validator → tests/docs) so any revert is surgical.

---

## Success Criteria

- [ ] `type-check:strict` + `lint:strict` pass; `npm run analyze:dead-code` shows no new dead names.
- [ ] All ~67 existing test assertions + 5 storybook plays pass UNCHANGED (behavioral-noop through `useIcon`).
- [ ] +12–14 new tests: polymorphic rendering, ref-per-component, hook, a11y lift-off; `@ts-expect-error` compile probes consumed.
- [ ] `component='a'` + `href` type-checks; `component='button'` does not override native attributes (native keyboard/focus preserved).
- [ ] `validateIconProps` warns in dev, silent in prod, on invalid size/color/strokeWidth/name.
- [ ] `Link` production site compiles and renders byte-identical (screenshot diff clean).
- [ ] `docs/specs/ui-kit-contract.md` Icon row updated (`component`, `useIcon`, validator).
- [ ] No consumer regression (`Tooltip.stories`, `Popover.test` query-by-role intact).

---

## Files

| File                                                      | Change                                               |
| --------------------------------------------------------- | ---------------------------------------------------- |
| `src/shared/ui/Icon/model/types.ts`                       | MODIFY (IconOwnProps / generic IconProps<C>)         |
| `src/shared/ui/Icon/ui/Icon.tsx`                          | MODIFY (memo-cast + `<Component>`; fork)             |
| `src/shared/ui/Icon/lib/hooks/useIcon.ts` (or model)      | NEW/ADD                                              |
| `src/shared/ui/Icon/lib/utils/validateIcon.ts` (or model) | NEW/ADD                                              |
| `src/shared/ui/Icon/ui/Icon.polymorphic.test.tsx`         | NEW (polym/ref/@ts-expect-error/a11y)                |
| `src/shared/ui/Icon/ui/Icon.test.tsx`                     | UNCHANGED (behavioral-noop gate)                     |
| `docs/specs/ui-kit-contract.md`                           | MODIFY (Icon row: `component`, `useIcon`, validator) |
