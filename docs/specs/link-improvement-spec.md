# Link Component Improvement Specification

**Change**: link-improvements
**Status**: Draft
**Date**: 2026-08-06
**Priority**: 10 CRITICAL + 9 MEDIUM (~22h core, 0h deferred)

---

## Scope

This specification upgrades Link (`src/shared/ui/Link/`) to the in-repo Senior+ standard — a generic polymorphic `component` prop with type-safe refs (Heading/Paragraph precedent), a `useLink` hook (Section/Paragraph template), a `LinkSkeleton` extraction (ButtonLoader precedent), gradient theming via `var(--gradient-text)`, named-only exports, shared external-link utilities, icon-size inference, Storybook play tests, and integration of 6 raw `<a>` sites.

**Non-breaking constraint:** Link ships 8 files with a closed `AnchorHTMLAttributes` bridge (54 tests, 16 stories, 0 plays). `component` is the chosen API name (NOT `as` — Tooltip/Popover/Slot already own `as`, so `as` would conflict). All changes are backward-compatible: default `component='a'`, additive props only, no class-name changes, no renamed variants/sizes/underlines, and the existing 54 tests MUST stay green unchanged.

| #   | Improvement                                       | Requirement | Priority | Effort | Type     |
| --- | ------------------------------------------------- | ----------- | -------- | ------ | -------- |
| 1   | Polymorphic `component` prop with generics        | LNK-01      | CRITICAL | 5h     | ADDED    |
| 2   | Type-safe ref forwarding + memo-cast              | LNK-02      | CRITICAL | 1h     | ADDED    |
| 3   | `useLink` hook + `validateLinkProps`              | LNK-03      | CRITICAL | 2.5h   | ADDED    |
| 4   | Remove `export default Link`                      | LNK-04      | CRITICAL | 0.5h   | MODIFIED |
| 5   | `validateLinkProps` not exported from index       | LNK-05      | CRITICAL | 0.5h   | MODIFIED |
| 6   | Gradient via `var(--gradient-text)`               | LNK-06      | CRITICAL | 0.5h   | MODIFIED |
| 7   | Play functions on key stories                     | LNK-07      | CRITICAL | 2.5h   | ADDED    |
| 8   | Tests: polymorphic/hook/compile/ref-per-as        | LNK-08      | CRITICAL | 3h     | ADDED    |
| 9   | Extract `LinkSkeleton` to `ui/`                   | LNK-09      | CRITICAL | 1h     | ADDED    |
| 10  | Integration: 6 raw `<a>` sites use Link           | LNK-10      | CRITICAL | 2.5h   | MODIFIED |
| 11  | Composition stories (Section/Container/Popover)   | LNK-11      | MEDIUM   | 3h     | ADDED    |
| 12  | Real-world stories (Header nav, CTA, footer)      | LNK-12      | MEDIUM   | 2h     | ADDED    |
| 13  | Extract `isExternalLink` + `getExternalLinkAttrs` | LNK-13      | MEDIUM   | 1h     | ADDED    |
| 14  | `ICON_SIZE_MAP` in constants + size inference     | LNK-14      | MEDIUM   | 1h     | MODIFIED |
| 15  | `NODE_ENV` dev-warn guard in validator            | LNK-15      | MEDIUM   | 0.5h   | MODIFIED |
| 16  | `@ts-expect-error` conditional-prop coverage      | LNK-16      | MEDIUM   | 0.5h   | ADDED    |
| 17  | A11y tests (keyboard, aria, skip-link)            | LNK-17      | MEDIUM   | 1.5h   | ADDED    |
| 18  | Story-play coverage across remaining stories      | LNK-18      | MEDIUM   | 1h     | MODIFIED |
| 19  | Story-play coverage: external/skeleton states     | LNK-19      | MEDIUM   | 1h     | ADDED    |

**Documentation deliverable (no requirement):** add the Link row/state to `docs/specs/ui-kit-contract.md` (polymorphic `component`, plays, `useLink`, `LinkSkeleton`).

**Out of scope:** `copyable`, `editable`, `asChild`, slots, plays on all stories, extra sizes/themes.

---

## ADDED Requirements

### Requirement LNK-01: Polymorphic `component` prop with generics

The system SHALL add a generic `component` prop (`C extends ElementType = 'a'`) to Link, typing props as `LinkOwnProps & Omit<ComponentPropsWithRef<C>, keyof LinkOwnProps | 'component'>` (Heading/Paragraph/Button in-repo pattern). The `component` name SHALL be used (NOT `as` — Tooltip/Popover/Slot already own `as`, so reuse would conflict). Default rendering (`component='a'`) SHALL NOT change.

The system SHALL apply the Heading memo-cast idiom to preserve `React.memo` with a generic component.

#### Scenario: Renders as `a` with `href`

- GIVEN `<Link component="a" href="/about">`
- WHEN the component renders
- THEN the root element MUST be `<a>` with `href="/about"` and the link classes
- AND TypeScript MUST accept `href` (anchor-specific prop forwarded)

#### Scenario: Default remains `<a>`

- GIVEN `<Link href="/about">` with no `component`
- WHEN the component renders
- THEN the root element MUST be `<a>` (backward compatible)

#### Scenario: Custom component receives merged props

- GIVEN `<Link component={RouterLink} href="/x">` where RouterLink is a React component
- WHEN the component renders
- THEN RouterLink MUST receive the merged link className and the forwarded props

#### Scenario: Element-specific prop rejected for wrong `component`

- GIVEN `<Link component="button" href="/x" download>`
- WHEN `type-check:strict` runs
- THEN TypeScript MUST report an error (`download` is not a button attribute)

### Requirement LNK-02: Type-safe ref forwarding

The system SHALL type the forwarded ref as `ForwardedRef<ComponentRef<C>>`, resolving the ref type to the rendered element (Heading precedent).

#### Scenario: Ref resolves per `component`

- GIVEN `<Link component="a" ref={ref}>`
- WHEN rendered
- THEN `ref.current` MUST be an `HTMLAnchorElement`

#### Scenario: Custom component ref resolves

- GIVEN `<Link component={RouterLink} ref={ref}>`
- WHEN rendered
- THEN `ref.current` MUST resolve to the RouterLink's underlying element type

#### Scenario: Existing consumers unaffected

- GIVEN current consumer files referencing the default anchor ref
- WHEN they compile after the refactor
- THEN no type errors MUST appear (TS error-first; runtime noop)

### Requirement LNK-03: `useLink` hook + `validateLinkProps`

The system SHALL extract `lib/hooks/useLink.ts` consolidating the 5 inline `useMemo` calls (external detection, `rel`, `target`, icon size, className) into one hook returning `{ linkClassName, dataAttrs, isExternal, relValue, targetValue, iconSize }`. The component SHALL become thin, and the existing `validateLinkProps` SHALL move under its `NODE_ENV === 'development'` guard.

The refactor SHALL be a behavioral noop: all 54 existing tests MUST pass unchanged.

#### Scenario: Hook returns computed className

- GIVEN `useLink({ variant: 'primary', size: 'lg', withLift: true })`
- WHEN called
- THEN the returned `linkClassName` MUST contain the mapped SCSS classes

#### Scenario: Hook returns external-link attributes

- GIVEN `useLink({ external: true })`
- WHEN called
- THEN `relValue` MUST include `noopener`/`noreferrer` and `targetValue` MUST be `'_blank'`

#### Scenario: Behavioral-noop gate

- GIVEN the refactored component using `useLink`
- WHEN the full Link test suite runs
- THEN all 54 existing tests MUST pass without modification

### Requirement LNK-04: Remove `export default Link`

The system SHALL remove `export default Link` from `ui/Link.tsx` and switch to named-only exports, enforcing the repo named-only rule (grep-verified: no default import currently in play).

#### Scenario: No default export

- GIVEN the updated `ui/Link.tsx`
- WHEN inspected
- THEN only `export const Link` MUST be exported (default export absent)

#### Scenario: Consumers compile

- GIVEN all consumer files and stories importing `{ Link }`
- WHEN `type-check:strict` runs
- THEN no import errors MUST be reported

### Requirement LNK-05: `validateLinkProps` not exported from public index

The system SHALL remove `validateLinkProps` from `src/shared/ui/Link/index.ts`, keeping `LINK_CONSTANTS`, `LINK_DEFAULTS`, `Link` and all types (`LinkProps`, `LinkSize`, `LinkVariant`, `LinkUnderline`) exported.

#### Scenario: validator absent from public API

- GIVEN the updated `index.ts`
- WHEN inspected
- THEN `validateLinkProps` MUST NOT be exported from the public index

#### Scenario: Validator still imported by internals

- GIVEN `ui/Link.tsx` and `lib/hooks/useLink.ts`
- WHEN compiled
- THEN they MUST import `validateLinkProps` directly from `lib/utils/validateLinkProps`, not the index

### Requirement LNK-06: Gradient via `var(--gradient-text)`

The system SHALL make the `gradient` variant resolve `var(--gradient-text, <fallback>)` in the SCSS module instead of the hardcoded `$gradient-text` (Paragraph PAR-06 precedent). The var SHALL be defined in both `:root`/`[data-theme='light']` and `[data-theme='dark']` blocks via the existing `--gradient-text` token in `_theme.scss`. This SHALL be a visual noop.

#### Scenario: gradient class resolves the var

- GIVEN `<Link variant="gradient">` rendered with the `gradient` class
- WHEN the computed background is inspected
- THEN it MUST equal the `--gradient-text` value (var resolves, no hardcoded fallback)

#### Scenario: themeable in dark mode

- GIVEN `[data-theme='dark']` active
- WHEN a `variant="gradient"` link renders
- THEN the gradient MUST resolve from the dark-mode `--gradient-text` definition

### Requirement LNK-07: Play functions on key stories

The system SHALL add `play` functions (via `@storybook/test` `within`/`expect`) to key stories covering: default link role/href, external link attrs (`_blank` + `noopener noreferrer`), icon rendering, skeleton mode, gradient variant.

#### Scenario: Default link play asserts role and href

- GIVEN the default Link story
- WHEN the play function runs
- THEN it MUST assert an anchor is present with the expected `href`

#### Scenario: External link play asserts attrs

- GIVEN an `external` Link story
- WHEN the play function runs
- THEN it MUST assert `target="_blank"` and rel contains `noopener` and `noreferrer`

#### Scenario: Skeleton play asserts placeholder

- GIVEN the skeleton Link story
- WHEN the play function runs
- THEN it MUST assert `aria-disabled="true"` and `data-skeleton="true"` are present

### Requirement LNK-08: Tests — polymorphic, hook, ref-per-as, compile-time

The system SHALL add unit tests: polymorphic rendering (custom components + element props), per-`component` ref-type assertions, `@ts-expect-error` algebraic-props compile tests (`truncate`/`lineClamp` pattern and `disabled` on anchor), and `useLink` hook tests (className/attrs/warn/no-warn).

#### Scenario: Polymorphic custom-component test

- GIVEN a test rendering `<Link component={CustomComp} href="/x">`
- WHEN the test runs
- THEN CustomComp MUST receive the merged link className and `href`

#### Scenario: Ref-type test

- GIVEN a test rendering `<Link ref={ref}>`
- WHEN the test runs
- THEN `ref.current` MUST be `instanceof HTMLAnchorElement`

#### Scenario: Compile-time conditional-prop test

- GIVEN `@ts-expect-error` assertions on invalid ref/prop combos
- WHEN `type-check:strict` runs
- THEN the assertions MUST be consumed (no unused `@ts-expect-error` diagnostics)

#### Scenario: Hook tests

- GIVEN the `useLink` unit tests (className, attrs, dev-warn/no-warn)
- WHEN the suite runs
- THEN all assertions MUST pass without rendering a component

### Requirement LNK-09: Extract `LinkSkeleton` to `ui/`

The system SHALL extract the skeleton placeholder branch into `ui/LinkSkeleton/` (ButtonLoader precedent), isolating the skeleton markup and `data-skeleton` rendering from the anchor path.

#### Scenario: Skeleton renders placeholder

- GIVEN `LinkSkeleton` rendered
- WHEN inspected
- THEN it MUST render a `span` with `aria-disabled="true"`, `data-skeleton="true"`, and a `Skeleton variant="text"`

#### Scenario: Main component uses LinkSkeleton

- GIVEN `<Link href="/profile" skeleton>`
- WHEN rendered
- THEN the component MUST delegate to `LinkSkeleton`
- AND no anchor element MUST be in the DOM

### Requirement LNK-10: Integration — 6 raw `<a>` sites use Link

The system SHALL migrate 6 raw `<a>` consumers to `Link`: `src/widgets/Sidebar/Sidebar.tsx` skip link (`#main-content`), `src/widgets/Sidebar/ui/NavItem/NavItem.tsx`, `src/widgets/Sidebar/ui/SidebarHeader/SidebarHeader.tsx`, `src/pages/Home/HomePage.tsx` skip link (`#main-content`), `src/features/Hero/ui/Hero.tsx` CTA, `src/features/About/ui/About.tsx` CTA, and the `Contact` social links (`src/features/Contact/ui/Contact.tsx`).

#### Scenario: Skip links use Link with ghost/undefined

- GIVEN the Sidebar and HomePage skip links
- WHEN migrated to `Link`
- THEN the skip links MUST keep `href="#main-content"`, the skip-link classes, and become accessible (keyboard-focusable) — `style`/`className` preserved

#### Scenario: NavItem navigation

- GIVEN `NavItem` rendering current nav anchor
- WHEN migrated
- THEN navigation anchor MUST remain the anchor, receive link classes, and no visual regression occur

#### Scenario: Existing consumers stay green

- GIVEN the full widget/page/feature test suites after migration
- WHEN tests run
- THEN no consumer test regex or style assertion MUST fail

#### Scenario: Contact social links external

- GIVEN the Contact social links pointing to external URLs
- WHEN migrated
- THEN the external icon + `noopener noreferrer` MUST apply via the Link external logic

---

## MODIFIED Requirements

### Requirement LNK-11: Composition stories

The system SHALL add stories composing `Link` inside `Section`, `Container`, and `Popover` to exercise real layering without layout breakage.

(Previously: only isolated link stories; no composition coverage)

#### Scenario: Section/Container compositions render

- GIVEN each composition story (Section, Container, Popover)
- WHEN the story renders
- THEN the Link MUST be present inside the composed container without layout breakage

#### Scenario: Play asserts nested link

- GIVEN the Popover composition story
- WHEN the play function runs
- THEN it MUST assert the link inside the popover content

### Requirement LNK-12: Real-world stories

The system SHALL add stories for real-world usage: Sidebar header nav, a Hero-style CTA, and a footer link group, using the integrated `Link`.

(Previously: "no composites showing the real consumer surfaces")

#### Scenario: Header nav story renders

- GIVEN the Header nav story using the migrated `Link`
- WHEN rendered
- THEN the nav MUST render with expected variant and underline state

#### Scenario: CTA and footer stories render

- GIVEN the CTA and footer stories
- WHEN rendered
- THEN each MUST render a `Link` with the expected `href`

### Requirement LNK-13: Extract external-link utilities

The system SHALL extract `isExternalLink` and `getExternalLinkAttrs` to `src/shared/lib/utils/` (for reuse), with `isExternalLink` detecting `http://`/`https://` and `getExternalLinkAttrs` returning `{ target: '_blank', rel: 'noopener noreferrer' }` merging caller `rel`.

(Previously: both inline in `ui/Link.tsx`)

#### Scenario: Utils exported from shared index

- GIVEN the new utils in `src/shared/lib/utils/`
- WHEN `index.ts` is inspected
- THEN `isExternalLink` and `getExternalLinkAttrs` MUST be exported

#### Scenario: Attr helper merges rel

- GIVEN `getExternalLinkAttrs('nofollow')`
- WHEN called
- THEN the result MUST retain `nofollow` plus `noopener` and `noreferrer`

#### Scenario: Link delegates to helpers

- GIVEN the refactored `useLink`
- WHEN it detects an external href
- THEN it MUST call the extracted helpers (single source of truth)

### Requirement: Icon size inference with `ICON_SIZE_MAP`

The system SHALL extract the inline icon-size map into `model/constants.ts` as `ICON_SIZE_MAP` and have `useLink` return the inferred `IconSize`.

(Previously: icon-size map inlined in `ui/Link.tsx`)

#### Scenario: map exported in `model/constants.ts`

- GIVEN `model/constants.ts` updated
- WHEN inspected
- THEN `ICON_SIZE_MAP` MUST be exported for `{ sm | md | lg }` mapping to `IconSize`

#### Scenario: Hook infers icon size

- GIVEN `useLink({ size: 'md' })`
- WHEN called
- THEN `iconSize` MUST be `'sm'` (per the map)

#### Scenario: Existing tests pass

- GIVEN the refactored hook with `ICON_SIZE_MAP`
- WHEN the Link suite runs
- THEN no failing assertions MUST appear (behavioral noop)

### Requirement: NODE_ENV dev-warn guard

The system SHALL keep the `NODE_ENV === 'development'` guard INSIDE `validateLinkProps` so the validator itself self-guards and can be called from the hook without an external guard (Paragraph PAR-04 precedent).

(Previously: guard was inline in `ui/Link.tsx` around the call)

#### Scenario: dev-warn disabled in production

- GIVEN `validateLinkProps({ href: '' })` with `NODE_ENV='production'`
- WHEN called
- THEN `console.warn` MUST NOT be called

#### Scenario: dev-warn in development

- Given `validateLinkProps` with invalid values and `NODE_ENV='development'`
- WHEN called
- THEN `console.warn` MUST be called with the validator name in the message

### Requirement: LNK-16 `@ts-expect-error` conditional-prop coverage

The system SHALL add compile-time `@ts-expect-error` tests covering the polymorphism edge cases (anchor `disabled`, `download` on non-anchor, ref mismatch).

(Previously: no compile-time coverage for the polymorphic props)

#### Scenario: `disabled` rejected on anchor

- GIVEN an `@ts-expect-error` assertion on `<Link component="a" disabled>`
- WHEN type-checking
- THEN the assertion MUST be consumed (no unused diagnostic)

#### Scenario: anchor-only prop rejected on custom component

- GIVEN an `@ts-expect-error` assertion passing html-attribute to a custom component without that prop
- WHEN type-checking
- THEN the assertion MUST be consumed

### Requirement: LNK-17 a11y tests

The system SHALL add a11y unit tests: role/link semantics, keyboard-focus and skip-link behavior, and aria-decorated external-icon labeling.

#### Scenario: link role and focus

- GIVEN a rendered Link in a test
- WHEN the test queries by role
- THEN it MUST find it by `role='link'` and be focusable via keyboard

#### Scenario: external icon aria-label

- GIVEN external Link with `showExternalIcon`
- WHEN rendered
- THEN the external icon span MUST expose the `aria-label="Opens in new tab"` (or the `title` equivalent)

#### Scenario: skip-link focusable

- GIVEN the migrated skip-ink in Sidebar/HomePage
- WHEN a test asserts it is keyboard focusable
- THEN it MUST be reachable and point to the `#main-content` target

### Requirement: LNK-18 story-play coverage (remaining stories)

The system SHALL extend `play` coverage across the remaining core Link stories (variant switch, all-variants table, sizes), matching LNK-07 plays.

#### Scenario: size story play

- Given the size varieties story
- WHEN the play runs
- THEN it MUST assert each rendered size class is present

#### Scenario: all-variant story play

- GIVEN the all-variants story
- WHEN the play runs
- THEN it MUST assert `primary | secondary | ghost | gradient` classes all render

### Requirement: LNK-19 story-play coverage for external/ref states

The system SHALL add play coverage for the external-attrs story and polymorphic/ref focusing cases.

#### Scenario: external play

- GIVEN the external-link story
- WHEN the play runs
- THEN it MUST assert one external URL and the computed attrs
- AND for the non-external it asserts no `_blank`

#### custom component play

- GIVEN a polymorphic story using a custom component
- WHEN the play runs
- THEN the play MUST assert the merged className is present on the rendered element + link attribute forwarded

---

## Deferred Items (documented, NOT requirements)

| Item                               | Rationale                                                             |
| ---------------------------------- | --------------------------------------------------------------------- |
| `copyable`                         | Clipboard API + i18n keys + a11y surface; no consumer need            |
| `editable`                         | contentEditable a11y/security surface; no real demand                 |
| `asChild` / Slot usage             | Requires Slot ref-type upgrade (`HTMLElement`-typed); separate change |
| Plays on ALL 58 Link stories       | Key stories covered (LNK-07/18); full coverage is follow-up           |
| Extra sizes/themes                 | Additive and safe, but deferred — no consumer need                    |
| Default-housekeeping beyond `Link` | e.g. palette/gradient switch is a separate decision                   |

---

## Test Expectations

| Area                                                                  | Tests                          | Type                     |
| --------------------------------------------------------------------- | ------------------------------ | ------------------------ |
| Polymorphic rendering (`a`, custom component, style preservation)     | 4                              | Unit                     |
| Ref typing per `component` (incl. custom component)                   | 2–3                            | Unit                     |
| `@ts-expect-error` ref/attr-handling                                  | 2–3                            | Compile-time             |
| `useLink` hook (className, attrs, dev-warn/no-warn)                   | 4–5                            | Unit                     |
| Icon size inference (`ICONY_SIZE_MAP`)                                | 2                              | Unit                     |
| A11y (role/focus, external-icon aria, skip-link)                      | 3                              | Unit                     |
| External helpers (`isExternalLink`/`getExternalLinkAttrs`)            | 3                              | Unit                     |
| Existing Link suite                                                   | 54 (MUST stay green unchanged) | Unit                     |
| Storybook plays (key + remaining stories)                             | ~10                            | `npm run storybook:test` |
| Knip / dead-code verification (default export, validators from index) | —                              | Static                   |

Existing tests MUST remain unchanged through the `useLink` refactor (behavioral-noop gate).

---

## Implementation Order

```
Batch 1 — CRITICAL core (~11h)
├── LNK-13: extract isExternalLink/getExternalLinkAttrs to shared/lib/utils
├── LNK-01: generic component props + Heading memo-cast in ui/Link.tsx
├── LNK-02: ref typing (ComponentRef<C>)
├── LNK-08/16: polymorphic + @ts-expect-error + ref tests FIRST (red), then implement
├── LNK-03: useLink hook extraction from the 5 useMemo; behavioral-noop gate (54 tests green)
├── LNK-04: remove export default
├── LNK-05: drop validateLinkProps from public index (keep constants/types/Link)
├── LNK-06: gradient via var(--gradient-text) (theme var + SCSS alignment)
├── LNK-09: extract LinkSkeleton to ui/
├── LNK-15: NODE_ENV guard internal to validator

Phase 2 — Integration (~3h)
├── LNK-10: migrate 6 raw <a> sites (sidebar skip, NavItem, SidebarHeader, Home skip, Hero CTA, About CTA, Contact social) to Link
├── LNK-13/14: finish utils + ICON_SIZE_MAP wiring
├── Update Sidebar/HomePage tests to Link-agnostic queries where needed

Phase 3 — Stories & coverage (~8h)
├── LNK-07: plays on key stories
├── LNK-11: composition stories (Section/Container/Popover)
├── LNK-12: real-world stories (Header nav, CTA, footer)
├── LNK-17: a11y tests
├── LNK-18: play coverage remaining stories
├── LNK-19: external/ref-state plays
├── Docs: link row refresh in docs/specs/ui-kit-contract.md

Phase 4 — Verification (—)
├── type-check:strict + lint:strict (0 warnings)
├── analyze:dead-code (default export + valid-former names gone)
├── storybook:test (plays pass)
├── Screenshot diff: Sidebar/HomePage/Hero/About/Contact before/after (zero visual regression)
```

---

## Risk Assessment

| Risk                                                            | Impact   | Mitigation                                                                                    |
| --------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| Generic + `memo` incompatibility                                | Blocking | Heading's proven memo-cast — copy in-repo                                                     |
| `component` name collision with variants                        | Low      | API decision record: `component` chosen because `as` conflicts with Tooltip/Popover/Slot `as` |
| Ref-type widening breaks strict consumers                       | Low      | Grep: no external ref usage; TS error-first, runtime noop                                     |
| Skip-link migration breaks focus style                          | Medium   | Preserve skip-link classes; screenshot + keyboard-focus verification                          |
| Dead-export removal (`default`, validator) breaks hidden import | Low      | rg-verified (default now imported; validator only internal); trivial restore                  |
| `useLink` refactor regression                                   | Low      | Behavioral-noop gate: 50 of 54 tests pass unchanged                                           |
| Gradient palette confusion (gold vs app-orange)                 | Medium   | Keep `--gradient-text` var; palette switch is a separate decision                             |

---

## Rollback Plan

- Every change is additive or behavioral-noop except LNK-10 (integration) and LNK-06 (gradient var).
- **Immediate rollback:** `git revert` the integration commit — the 6 sites snap back to their raw `<a>` markup; the Link API is unchanged, so consumers are unaffected.
- **Default/export (#4/#5):** remove `default` again and restore `validateLinkProps` export in `index.ts` — trivial.
- **Gradient (#6):** remove `--gradient-text` → falls back to identical hardcoded value (visual noop either way).
- Guard: single PR per concern (core → integration → stories) so any revert is surgical.

## Success Criteria

- [ ] `type-check:strict` + `lint:strict` pass (0 warnings); no-default-export and no-public-validator knip findings
- [ ] All 54 existing Link tests pass UNCHANGED (behavioral-noop through the `useLink` refactor)
- [ ] +15–20 new `tests` polymorphic hooks/refs poly/hook compile-time, tests external utils a11y
- [ ] `component` default (`'a'`) — `HTMLAnchorElement`
- [ ] All 5 inline `useMemo` consolidated into `useLink` and `ICON_SIZE_MAP` in `model/constants.ts`
- [ ] 6 raw `<a>` sites integrated with `Link`, zero visual regression (screenshot-verified)
- [ ] gradient variant resolves `var(--gradient-text)` in both themes
- [ ] `default` removed; `validateLinkProps` internal-only
- [ ] 10 key/ref stories have passing plays; composition/real-world stories render
- [ ] `ui-kit-contract.md` Link row updated
