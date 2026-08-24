# Aspect Ratio Component Specification

**Change**: aspect-ratio
**Status**: Draft
**Date**: 2026-08-09
**Prior**: `docs/specs/aspect-ratio-proposal.md` (SDD propose, user-approved)

---

## Scope

Introduces `src/shared/ui/AspectRatio/` — a 9-file, Divider-parity `shared/ui` slice that locks content into a fixed ratio via native CSS `aspect-ratio` (inline style from a hook), with a fill-layer `.content` (`position:absolute; inset:0`) so children fill the box (Radix/Chakra behavior). Today the codebase has zero ratio helpers — cards/images (Image, CardImage, Hero) hand-roll ratio layouts per consumer. The component is jsdom-testable, needs no new packages, and follows the in-repo Senior+ standard: generic polymorphic `as` + memo-cast (Divider/Paragraph pattern), `useAspectRatio` hook, self-guarded dev validator, Storybook plays.

**Non-breaking constraint:** brand-new slice — no existing consumers, no existing tests, nothing in the current codebase changes. All 9 files are new; named-only exports from birth (repo rule). A single fully-additive PR — `git revert` removes the slice with zero fallout.

| #   | Requirement                                                 | Area  | Type               |
| --- | ----------------------------------------------------------- | ----- | ------------------ |
| 1   | Polymorphic `as` prop with generics                         | AR-01 | ADDED (new domain) |
| 2   | Type-safe ref forwarding + memo-cast                        | AR-02 | ADDED              |
| 3   | Required `ratio` prop + `DEFAULT_RATIO` fallback + dev-warn | AR-03 | ADDED              |
| 4   | `useAspectRatio` hook (thin component)                      | AR-04 | ADDED              |
| 5   | Data attributes (`data-aspect-ratio`, `data-as`)            | AR-05 | ADDED              |
| 6   | CSS layers (`.box` + `.content` fill)                       | AR-06 | ADDED              |
| 7   | Validator internal-only + self-guarded                      | AR-07 | ADDED              |
| 8   | Storybook stories + plays                                   | AR-08 | ADDED              |
| 9   | Unit test suite (~12)                                       | AR-09 | ADDED              |

**Documentation deliverable (no requirement):** add the AspectRatio inventory row (25th component) and an `### AspectRatio specifics` section to `docs/specs/ui-kit-contract.md` — placed AFTER the Image specifics section, BEFORE `## File structure for each component`. Inventory row mirrors the other 24 entries: Stories Yes, Tests Yes, Sub-components None.

**Out of scope:** padding-top hack and legacy-browserslist/Vite-target plugins (native `aspect-ratio` is safe for jsdom + modern browsers); ratio tokens/mixins in `shared/styles` (none exist — values stay inline); consumer adoption (zero real consumers; the Image-composition pathway is documented only, NOT wired); knip/dead-code runs and default-export cleanup (nothing to delete — new slice).

**Locked decisions carried from proposal:** `DEFAULT_RATIO = '16/9'`; data-attrs `data-aspect-ratio` + `data-as` (string components only); consumer `className` merges into the box wrapper last-wins; validator internal-only (NOT re-exported from `index.ts` — Container's public validator is the anti-pattern we do NOT copy). **This phase's deltas vs proposal:** CSS module class names expressed as `.box`/`.content` (proposal provisional names `aspectRatio_box`/`aspectRatio_ratioContent` superseded — resolved at design); hook return field named `ratioStyle`; story count fixed to 4.

---

## ADDED Requirements

### Requirement AR-01: Polymorphic `as` prop with generics

The system SHALL add a generic `as` prop (`C extends ElementType = 'div'`) to AspectRatio, typing props as `AspectRatioOwnProps & Omit<ComponentPropsWithRef<C>, keyof AspectRatioOwnProps | 'as'>` (Divider/Paragraph in-repo pattern). Default rendering (`as='div'`) SHALL NOT change. The prop SHALL be named `as` (AspectRatio owns `as` freely — Tooltip/Popover/Slot conflicts that forced `component` on Link/Icon do not apply, and `component` is NOT used here).

The system SHALL apply the Divider/Heading memo-cast idiom to preserve `React.memo` with the generic component.

#### Scenario: Renders as `div` by default

- GIVEN `<AspectRatio ratio="16/9">` with no `as`
- WHEN the component renders
- THEN the root element MUST be a `<div>` carrying the ratio box class

#### Scenario: Renders as allowed element with element props

- GIVEN `<AspectRatio as="article" ratio="4/3" title="Ratio">`
- WHEN the component renders
- THEN the root MUST be an `<article>` with the ratio classes and the forwarded `title`

#### Scenario: Custom component receives merged props

- GIVEN `<AspectRatio as={CustomBox} ratio="1/1" aria-label="x">` where `CustomBox` is a React component
- WHEN the component renders
- THEN `CustomBox` SHALL receive the merged ratio className and the forwarded props

#### Scenario: Wrong element prop rejected at compile time

- GIVEN `<AspectRatio as="div" href="/x">`
- WHEN `type-check:strict` runs
- THEN TypeScript MUST report an error (`href` is not a div attribute — probe verified via a consumed `@ts-expect-error`)

### Requirement AR-02: Type-safe ref forwarding

The system SHALL type the forwarded ref as `ForwardedRef<ComponentRef<C>>` (Divider precedent), resolving the ref type to the rendered element.

#### Scenario: Ref resolves per `as`

- GIVEN `<AspectRatio as="article" ref={ref}>`
- WHEN rendered
- THEN `ref.current` MUST be the `HTMLElement` for the article element (no dedicated `HTMLArticleElement` interface)

#### Scenario: Default ref is HTMLDivElement

- GIVEN `<AspectRatio ref={ref}>`
- WHEN rendered
- THEN `ref.current` MUST be an `HTMLDivElement`

#### Scenario: Custom component ref resolves

- GIVEN `<AspectRatio as={CustomComp} ref={ref}>`
- WHEN rendered
- THEN `ref.current` MUST resolve to the CustomComp's underlying element type

### Requirement AR-03: Required `ratio` prop with runtime fallback

The system SHALL type the `ratio` prop as required `AspectRatioString = \`${number}/${number}\``and SHALL fall back at runtime to`DEFAULT_RATIO = '16/9'`when`ratio`is absent/invalid, with a dev-only`console.warn`(validator, AR-07). The inline`aspectRatio` value MUST be emitted from the hook.

#### Scenario: Valid ratio applied

- GIVEN `<AspectRatio ratio="4/3">`
- WHEN rendered
- THEN the box MUST carry inline `aspect-ratio: 4 / 3` (asserted via `toHaveStyle({ aspectRatio: '4 / 3' })`)

#### Scenario: Runtime fallback on missing ratio

- GIVEN `<AspectRatio>` (ratio omitted at runtime, e.g. `as any`)
- WHEN rendered
- THEN the box MUST use `DEFAULT_RATIO` (`16/9`) and the validator MUST dev-warn

#### Scenario: Invalid format string falls back

- GIVEN `<AspectRatio ratio={'abc' as AspectRatioString}>`
- WHEN rendered
- THEN the regex validator MUST reject it and the box MUST use `DEFAULT_RATIO`

### Requirement AR-04: `useAspectRatio` hook

The system SHALL extract `lib/hooks/useAspectRatio.ts` returning `{ ratioStyle: { aspectRatio }, boxClassName, dataAttrs }` (useDivider/useSection template). The UI component SHALL become thin. The extraction SHALL be a behavioral noop: all AR-09 unit tests MUST pass identically before/after.

#### Scenario: Hook returns inline ratio style

- GIVEN `useAspectRatio({ ratio: '16/9', className: 'x' })`
- WHEN called
- THEN `ratioStyle` MUST equal `{ aspectRatio: '16 / 9' }` and `boxClassName` MUST contain the box class plus consumer `'x'` last

#### Scenario: Thin component delegates

- GIVEN the refactored `AspectRatio` using the hook
- WHEN rendered
- THEN the DOM/output MUST be identical to the pre-hook version (behavioral-noop gate)

### Requirement: Data attributes

The system SHALL emit `data-aspect-ratio={ratio ?? DEFAULT_RATIO}` on the box, and `data-as` ONLY when the resolved `as` is a string component (Divider/Paragraph `data-as` precedent — absent on the default `div`).

#### Scenario: data-aspect-ratio present

- GIVEN `<AspectRatio ratio="21/9">`
- WHEN rendered
- THEN the root MUST carry `data-aspect-ratio="21/9"`

#### Scenario: data-as only for string as

- GIVEN `<AspectRatio as="aside">`
- THEN the root MUST carry `data-as="aside"`
- AND GIVEN `<AspectRatio ratio="1/1">` (default)
- THEN the root MUST NOT carry `data-as`

### Requirement: CSS layers (`.box` + `.content`)

The system SHALL define the CSS module with two classes: `.box` (`position: relative; width: 100%; overflow: hidden; aspect-ratio: <inline from hook>`) and `.content` (`position: absolute; inset: 0`) so children fill the ratio box. Both themes have no tokens — values inline.

#### Scenario: Box hosts children at ratio

- GIVEN `<AspectRatio ratio="16/9"><img style={{width:'100%',height:'100%'}}/></AspectRatio>`
- WHEN rendered
- THEN the `<img>` MUST be inside the `.box` `.content` fill layer (absolute, inset 0) and the box MUST have the ratio

#### Scenario: Content layer is absolute fill

- GIVEN the compiled `.content`
- WHEN inspected
- THEN `position: absolute; inset: 0` MUST be present

### Requirement AR-07: Validator internal-only

The system SHALL add `lib/utils/validateAspectRatioProps.ts`, self-guarded (`if (process.env.NODE_ENV !== 'development') return;`), regex `/^\d+\/\d+$/` on `ratio`, non-throwing `console.warn` with valid examples. The validator SHALL be internal-only: NOT exported from the public `index.ts` (Container's public validator is the rejected precedent). Call site: `useAspectRatio`, guard internal.

#### Scenario: dev-warn on invalid ratio

- GIVEN `validateAspectRatioProps({ ratio: 'abc' })` with dev NODE_ENV
- WHEN called
- THEN `console.warn` MUST be invoked mentioning the invalid ratio and the `DEFAULT_RATIO`

#### Scenario: no warn in production

- GIVEN the same call with `NODE_ENV='production'`
- WHEN called
- THEN `console.warn` MUST NOT be called

#### Scenario: absent from public API

- GIVEN the AspectRatio `index.ts`
- WHEN inspected
- THEN `validateAspectRatioProps` MUST NOT be exported (direct-path import only)

### Requirement AR-08: Storybook stories + plays

- **Effect**: components show the ratio box in real usage.
- The system SHALL add 4 stories with `play` functions (via `@storybook/test` `within`/`expect`): `Default` (16/9), `Polymorphic` (`as` variants), `RatioVariants` (4/3, 1/1, 21/9 table), `ContentFill` (children fill layer). Stories render inside a sized preview panel (CSS module max-width, e.g. 480px) so width-100% basis is visible — container sizing lives in CSS, not components.

#### Scenario: Default play asserts box + ratio

- GIVEN the `Default` story
- WHEN the play runs
- THEN it MUST assert the `div` box is present with `data-aspect-ratio="16/9"` and `aspectRatio` style

#### Scenario: Polymorphic play asserts element

- GIVEN the `WithPolymorphic` story rendering `as="article"`/`as="section"`
- WHEN the play runs
- THEN the play MUST assert the element tags and the `data-as` attributes

#### Scenario: Ratio variants play asserts attrs

- GIVEN the `RatioVariants` story
- WHEN the play runs
- THEN it MUST assert `data-aspect-ratio` equals each variant (`4/3`, `1/1`, `21/9`)

### Requirement: Unit test suite (~12)

The system SHALL add `ui/AspectRatio.test.tsx` with ~12 tests: style assertion (valid + fallback, 2), polymorphic render (default `as='div'`, allowed element, custom component, 3), refs (default `HTMLDivElement`, per-`as` element, 2), data-attrs (`data-aspect-ratio`, `data-as` string-only absence, 2), className merge last-wins (1), validator dev-warn + prod no-warn + regex reject (2–3).

#### Scenario: Style assertion

- GIVEN `<AspectRatio ratio="4/3">`
- WHEN rendered
- THEN `getByTestId`-root MUST satisfy `toHaveStyle({ aspectRatio: '4 / 3' })`

#### Scenario: `as` rendering tests

- GIVEN tests rendering default / `as="article"` / `as={CustomComp}`
- WHEN the suite runs
- THEN the resolved elements MUST match per AR-01

#### Scenario: refs

- GIVEN ref tests `as` default
- THEN `ref.current` MUST be `instanceof HTMLDivElement` / the per-`as` type

#### Scenario: data-attrs

- GIVEN data-attr tests
- THEN `data-aspect-ratio` present, `data-as` only for string `as`

#### Scenario: validator no-warn in prod

- GIVEN `validateAspectRatioProps` under `NODE_ENV='production'`
- WHEN called with an invalid ratio
- THEN no `console.warn` MUST fire

---

## Test Expectations

| Area                                                    | Tests | Type                                                                        |
| ------------------------------------------------------- | ----- | --------------------------------------------------------------------------- |
| Ratio style + fallback (AR-03)                          | 2     | Unit                                                                        |
| Polymorphic rendering (default, `article`, custom comp) | 3     | Unit                                                                        |
| Ref per `as` (default + element)                        | 2     | Unit                                                                        |
| Data attrs (`data-aspect-ratio`, `data-as` absence)     | 2     | Unit                                                                        |
| className merge (consumer last)                         | 1     | Unit                                                                        |
| Validator dev-warn / prod no-warn                       | 2–3   | Unit                                                                        |
| Total                                                   | ~12   | Unit                                                                        |
| Storybook plays (4 stories)                             | 4     | `npm run storybook:test`                                                    |
| Dead-code / type gates                                  | —     | `analyze:dead-code` (new slice clean) + `type-check:strict` + `lint:strict` |
| Contract docs (row + section)                           | —     | diff review                                                                 |

## Implementation Order

```
Phase 1 (~1h) — Slice scaffold: type/constants/SCSS
├── model/types.ts: AspectRatioString, AspectRatioOwnProps, generic AspectRatioProps<C>
├── model/constants.ts: DEFAULT_RATIO '16/9'
├── ui/AspectRatio.module.scss: .box + .content layers (AR-06)

Phase 2 (~1.5h) — Hook + validator
├── lib/utils/validateAspectRatioProps.ts (self-guarded, regex) (AR-07)
├── lib/hooks/useAspectRatio.ts → { ratioStyle, boxClassName, dataAttrs } (AR-04)

Phase 3 (~1.5h) — Component
├── ui/AspectRatio.tsx: memo-cast (Divider) + <Component ref> + dataAttrs (AR-01/02/05)
├── index.ts: named exports (AspectRatio, types, DEFAULT_RATIO; validator NOT exported)

Phase 4 (~1.5h) — Tests (AR-09): ui/AspectRatio.test.tsx (RED-first taste), then impl gates

Phase 5 (~2h) — Stories: ui/AspectRatio.stories.tsx, 4 stories + plays (AR-08)

Phase 6 (~0.5h) — Docs: ui-kit-contract.md row + `### AspectRatio specifics` (per deliverable)

Phase 7 — Verify: type-check:strict + lint:strict (0); vitest slice ~12 green; storybook:test plays; analyze:dead-code clean
```

## Risk Assessment

| Risk                                                  | Impact            | Mitigation                                                          |
| ----------------------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| Native `aspect-ratio` unsupported (very old browsers) | Low               | jsdom `toHaveStyle` + modern baseline; no legacy-plugin requirement |
| Invalid `ratio` chars break CSS                       | Medium            | regex validator + `DEFAULT_RATIO` fallback + dev-warn               |
| Consumer `className` merge collision                  | Low               | `classNames` util; consumer class last-wins                         |
| Generic `as` + `React.memo` incompatibility           | Blocking (if hit) | Divider/Paragraph memo-cast — copy in-repo                          |
| Hook extraction drift                                 | Low               | Behavioral-noop gate: identical values; ~12 tests gate              |
| Storybook flakiness on plays                          | Low               | Sync assertions only; no timers in stories                          |

## Rollback Plan

- Single PR, fully additive: `git revert <commit>` removes the new slice; zero existing code touched, no schema change, no consumer fallout.
- Docs: revert the contract row/section.
- Guard: one PR per concern (component → tests → stories → docs) so any revert is surgical.

## Success Criteria

- [ ] `type-check:strict` + `lint:strict` pass (0 warnings); new slice knip-clean
- [ ] `npx vitest run src/shared/ui/AspectRatio` → ~12 tests green
- [ ] Default `as='div'`; ref resolves `HTMLDivElement`; `as="article"` + element props type-check
- [ ] `<AspectRatio ratio="4/3">` yields inline `aspect-ratio: 4 / 3` (toHaveStyle gate)
- [ ] `data-aspect-ratio` always present; `data-as` only for string `as`
- [ ] Validator internal-only (NOT in `index.ts`); warns in dev, silent in prod
- [ ] 4 stories with passing plays (`npm run storybook:test`)
- [ ] `ui-kit-contract.md` row + `### AspectRatio specifics` after Image section; zero changes to existing slices
