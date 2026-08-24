# Paragraph Component Improvement Specification

**Change**: paragraph-improvements
**Status**: Draft
**Date**: 2026-08-01
**Priority**: 8 CRITICAL + 4 MEDIUM (~23h core, 0h deferred)

---

## Scope

This specification upgrades Paragraph (`src/shared/ui/Paragraph/`) to the in-repo component standard — generic polymorphic `as` with type-safe refs (Heading/Section precedent), a `useParagraph` hook (useSection template), interactive play tests (Button/Container precedent), verified dead-code removal, a gradient-theme var fix, and deduplication of text styles that CardDescription/CardMeta/ModalContent reinvent instead of reusing Paragraph.

**Non-breaking constraint:** Paragraph renders in 13 consumer files (18+ JSX usages) with 64 tests and 58 stories. All changes are backward-compatible: default `as='p'`, additive props only, no class-name changes, no renamed sizes. Grep confirms zero external `ref=` usage and zero external type imports — ref-type widening is TypeScript-error-first, runtime noop (Button precedent).

| #   | Improvement                                         | Requirement | Priority | Effort | Type     |
| --- | --------------------------------------------------- | ----------- | -------- | ------ | -------- |
| 1   | Polymorphic `as` prop with generics                 | PAR-01      | CRITICAL | 4h     | ADDED    |
| 2   | Type-safe ref forwarding + memo-cast                | PAR-02      | CRITICAL | 1h     | ADDED    |
| 3   | Conditional props (`truncate` vs `lineClamp`)       | PAR-03      | CRITICAL | 1h     | ADDED    |
| 4   | `useParagraph` hook + `validateParagraphProps`      | PAR-04      | MEDIUM   | 2.5h   | ADDED    |
| 5   | `tertiary` theme                                    | PAR-05      | MEDIUM   | —      | ADDED    |
| 6   | `--gradient-text` var in `_theme.scss`              | PAR-06      | CRITICAL | 0.5h   | ADDED    |
| 7   | Play functions on key stories                       | PAR-07      | CRITICAL | 2.5h   | ADDED    |
| 8   | Composition + showcase stories                      | PAR-08      | MEDIUM   | 4h     | ADDED    |
| 9   | SCSS cleanup (`overflow-wrap` dup, `.gradient` var) | PAR-09      | CRITICAL | 0.5h   | MODIFIED |
| 10  | Dead code removal (11 exports + 5 validators)       | PAR-10      | CRITICAL | 0.5h   | REMOVED  |
| 11  | CardDescription integration                         | PAR-11      | CRITICAL | 2.5h   | MODIFIED |
| 12  | CardMeta integration                                | PAR-12      | CRITICAL | 1.5h   | MODIFIED |
| 13  | ModalContent fallback removal                       | PAR-13      | CRITICAL | 1h     | MODIFIED |
| 14  | Test suite expansion                                | PAR-14      | CRITICAL | 1.5h   | MODIFIED |

**Documentation deliverable (no requirement):** refresh the Paragraph row in `docs/specs/ui-kit-contract.md` (stories/play counts, `useParagraph` hook, `tertiary` theme).

**Out of scope:** renaming `2xl`→`xxl` (breaking), `asChild` ref typing upgrade (Slot types `HTMLElement` — documented), CardBody text styles (none exist — `flex: 1` only), play functions on all 58 stories (key stories first).

---

## ADDED Requirements

### Requirement PAR-01: Polymorphic `as` prop with generics

The system SHALL convert `as` from the closed union `ParagraphElement` (`'p'|'span'|'div'|'label'`) to a generic `C extends ElementType = 'p'`, merging element props as `Omit<ComponentPropsWithRef<C>, keyof ParagraphOwnProps | 'as'>` (Heading/Section in-repo pattern). The `as` prop name SHALL be kept (user decision). Default rendering (`as='p'`) SHALL NOT change.

The system SHALL apply the Heading memo-cast idiom to preserve `React.memo` with a generic component:

```ts
const ParagraphMemo = memo(
  paragraphRef as unknown as (
    props: ParagraphProps<'p'> & { ref?: ForwardedRef<HTMLElement> }
  ) => ReactElement
);
export const Paragraph = ParagraphMemo as unknown as ParagraphComponent;
```

The system SHALL replace the `createElement` + `eslint-disable react-hooks/refs` workaround with direct `<Component ref={ref} {...restProps}>` JSX.

#### Scenario: Renders as `a` with `href`

- GIVEN `<Paragraph as="a" href="/about">`
- WHEN the component renders
- THEN the root element MUST be an `<a>` with `href="/about"` and the paragraph class
- AND TypeScript MUST accept `href` (element-specific prop forwarded)

#### Scenario: Default remains `<p>`

- GIVEN `<Paragraph>` with no `as`
- WHEN the component renders
- THEN the root element MUST be `<p>` (backward compatible)

#### Scenario: Custom component receives merged props

- GIVEN `<Paragraph as={CustomLink} to="/x">` where CustomLink is a React component
- WHEN the component renders
- THEN CustomLink MUST receive the paragraph className and the `to` prop

#### Scenario: Button-only prop rejected for `as="a"`

- GIVEN `<Paragraph as="a" disabled>`
- WHEN `type-check:strict` runs
- THEN TypeScript MUST report an error (`disabled` is not an anchor attribute)

#### Scenario: Class rendering is backward-compatible

- GIVEN `<Paragraph as="span" className="custom" data-testid="p">`
- WHEN rendered
- THEN the element MUST have `cls.paragraph`, size/theme classes, and `custom` — no class-name changes

### Requirement PAR-02: Type-safe ref forwarding

The system SHALL type the forwarded ref as `ForwardedRef<ComponentRef<C>>`, resolving the ref type to the rendered element (Heading precedent).

#### Scenario: Ref resolves per `as`

- GIVEN `<Paragraph as="a" ref={ref}>`
- WHEN rendered
- THEN `ref.current` MUST be an `HTMLAnchorElement`

#### Scenario: Default ref is HTMLParagraphElement

- GIVEN `<Paragraph ref={ref}>`
- WHEN rendered
- THEN `ref.current` MUST be an `HTMLParagraphElement` (previously `HTMLElement`)

#### Scenario: Existing consumers unaffected

- GIVEN the 13 consumer files (zero external `ref=` usage, grep-verified)
- WHEN they compile after the refactor
- THEN no type errors MUST appear (TS error-first, runtime noop)

### Requirement PAR-03: Conditional props — `truncate` forbids `lineClamp`

The system SHALL model props as a discriminated union so `truncate: true` makes `lineClamp` a compile-time error while both stay valid independently:

```ts
type ParagraphProps<C extends ElementType> = ParagraphBaseProps<C> &
  ({ truncate?: true; lineClamp?: never } | { truncate?: false; lineClamp?: LineClamp });
```

The runtime dev-warn on conflict SHALL remain as defense-in-depth.

#### Scenario: `truncate` + `lineClamp` rejected at compile time

- GIVEN a consumer writing `<Paragraph truncate lineClamp={3}>`
- WHEN type-checking
- THEN TypeScript MUST report an error (verified via `@ts-expect-error` test)

#### Scenario: `truncate` alone compiles

- GIVEN `<Paragraph truncate>`
- WHEN type-checking
- THEN no error MUST be reported

#### Scenario: `lineClamp` alone compiles

- GIVEN `<Paragraph lineClamp={3}>`
- WHEN type-checking
- THEN no error MUST be reported

### Requirement PAR-04: `useParagraph` hook + `validateParagraphProps`

The system SHALL extract `lib/hooks/useParagraph.ts` and `lib/utils/validateParagraphProps.ts` following the `useSection`/`validateSectionProps` template:

- `useParagraph` SHALL compute the className via `useMemo` (mapSizeToClass + mods) and SHALL return `dataAttrs` (`data-size`, `data-theme`, `data-align`, `data-as`).
- `validateParagraphProps` SHALL dev-warn (only when `NODE_ENV === 'development'`) on invalid size/theme/align/weight/wrap, consuming the KEPT constant arrays (PARAGRAPH_SIZES/THEMES/ALIGNS/WEIGHTS/WRAPS). The removed `isValidParagraph*` validator logic SHALL move into it.
- `lineClamp` validation (2–5) and the truncate/lineClamp conflict warn SHALL be preserved.
- The refactor SHALL be a behavioral noop: the UI component becomes thin (`const { paragraphClassName, dataAttrs } = useParagraph({...})`); all 64 existing tests MUST pass unchanged.

#### Scenario: Hook returns computed className

- GIVEN `useParagraph({ size: 'xl', theme: 'muted', weight: 'bold', wrap: 'pretty' })`
- WHEN called
- THEN the returned className MUST contain the mapped SCSS classes (`size-2xl` mapping, `muted`, `bold`, `pretty`)

#### Scenario: Hook returns data attributes

- GIVEN `useParagraph({ size: 's', theme: 'error', align: 'center', as: 'span' })`
- WHEN called
- THEN `dataAttrs` MUST equal `{ 'data-size': 's', 'data-theme': 'error', 'data-align': 'center', 'data-as': 'span' }`

#### Scenario: Dev-warn on invalid props

- GIVEN `useParagraph({ size: 'invalid' as ParagraphSize })` with `NODE_ENV='development'`
- WHEN called
- THEN `console.warn` MUST be called with the valid values in the message

#### Scenario: No warn in production

- GIVEN `useParagraph({ size: 'invalid' as ParagraphSize })` with `NODE_ENV='production'`
- WHEN called
- THEN `console.warn` MUST NOT be called

#### Scenario: Behavioral-noop gate

- GIVEN the refactored component using `useParagraph`
- WHEN the full Paragraph test suite runs
- THEN all 64 existing tests MUST pass without modification

### Requirement PAR-05: `tertiary` theme

The system SHALL add `'tertiary'` to `ParagraphTheme` and SHALL add a `.tertiary` SCSS class (`color: var(--text-tertiary)`) — enables CardMeta integration (its color has no current Paragraph theme equivalent).

#### Scenario: tertiary class applied

- GIVEN `<Paragraph theme="tertiary">`
- WHEN rendered
- THEN the element MUST have the `tertiary` theme class

#### Scenario: Validation accepts tertiary

- GIVEN `PARAGRAPH_THEMES` updated with `'tertiary'`
- WHEN a consumer passes `theme="tertiary"` in development
- THEN no dev-warn MUST be emitted

### Requirement PAR-06: `--gradient-text` var in `_theme.scss`

The system SHALL define `--gradient-text` in `src/shared/styles/globals/_theme.scss` in BOTH the light (`:root`/`[data-theme='light']`) and `[data-theme='dark']` blocks, from the existing `$gradient-text` SCSS var (gold: `linear-gradient(135deg, #ffd700 0%, #ff8c00 40%, #ff4500 100%)`, verified `_colors.scss:60`). This SHALL be a visual noop (the current hardcoded fallback equals the var value) while making the gradient themeable.

#### Scenario: var defined in both themes

- GIVEN the compiled `_theme.scss`
- WHEN inspecting the light and dark theme blocks
- THEN `--gradient-text` MUST be defined in both with the `$gradient-text` value

#### Scenario: gradient theme resolves the var

- GIVEN `<Paragraph theme="gradient">` rendered with the `.gradient` class
- WHEN the computed background is inspected
- THEN it MUST equal the `--gradient-text` value (var resolves, no fallback)

### Requirement PAR-07: Play functions on key stories

The system SHALL add `play` functions (via `@storybook/test` `within`/`expect`) to 6 key stories: `AllSizes`, `AllThemes`, `WrapAndTruncate`, `TruncateWithLineClamp`, `AsChildWithButton`, `GradientQuote`. Extension to all 58 stories is a follow-up.

#### Scenario: AllSizes play asserts size classes

- GIVEN the `AllSizes` story renders 6 Paragraphs
- WHEN the play function runs
- THEN it MUST assert each size class (`xs`, `s`, `m`, `l`, `xl`, `size-2xl`) is present

#### Scenario: AllThemes play asserts theme classes

- GIVEN the `AllThemes` story renders 7 Paragraphs
- WHEN the play function runs
- THEN it MUST assert each theme class including `gradient`

#### Scenario: GradientQuote play asserts gradient data

- GIVEN the `GradientQuote` story
- WHEN the play function runs
- THEN it MUST assert the `gradient` class and a computed `--gradient-text` background

#### Scenario: AsChildWithButton play asserts class merge

- GIVEN the `AsChildWithButton` story
- WHEN the play function runs
- THEN it MUST assert the child `<button>` received the paragraph classes

### Requirement PAR-08: Composition and showcase stories

The system SHALL add stories: Paragraph in Container, Paragraph in Section, Paragraph in Card (CardDescription-backed), Paragraph in Modal (body-text pattern), Full Page Typography (Heading `3xl–5xl` + Paragraph `xs–2xl`), Wrap Modes Comparison (wrap/nowrap/balance/pretty), Gradient Theme, and Edge Cases (empty children, `as`+`asChild` conflict, truncate on span, long unbroken string with `wrap="nowrap"`).

#### Scenario: Composition stories render

- GIVEN each composition story (Container/Section/Card/Modal)
- WHEN the story renders
- THEN the Paragraph MUST be present inside the composed container without layout breakage

#### Scenario: Wrap comparison play asserts classes

- GIVEN the Wrap Modes Comparison story
- WHEN the play function runs
- THEN it MUST assert the `wrap`, `nowrap`, `balance`, `pretty` classes each render

#### Scenario: Edge case stories render without error

- GIVEN each edge-case story (empty children, as+asChild conflict, truncate on span, nowrap long string)
- WHEN the story renders
- THEN no runtime error MUST be thrown and the paragraph node MUST be present

---

## MODIFIED Requirements

### Requirement PAR-09: SCSS cleanup — duplicated `overflow-wrap` + `.gradient` var alignment

The system SHALL remove the duplicated `overflow-wrap: break-word;` declaration in the `&.wrap` block (`Paragraph.module.scss` lines 114–115) and SHALL align the gradient path to the var: the `.gradient` theme class SHALL keep the `gradient-text` mixin (which resolves `var(--gradient-text, fallback)`), and the `.gradient-text` utility in `globals/_gradient.scss` SHALL reference `var(--gradient-text, fallback)` instead of the hardcoded gradient.

(Previously: `overflow-wrap: break-word` declared twice; `--gradient-text` undefined, so every gradient Paragraph rendered the hardcoded fallback regardless of theme)

#### Scenario: Single overflow-wrap declaration

- GIVEN the compiled `Paragraph.module.scss`
- WHEN the `.wrap` block is inspected
- THEN `overflow-wrap: break-word` MUST appear exactly once

#### Scenario: Gradient utility aligns to var

- GIVEN the `.gradient-text` utility in `globals/_gradient.scss`
- WHEN inspected
- THEN its `background` MUST be `var(--gradient-text, <fallback>)`

### Requirement PAR-10: Dead code removal

The system SHALL remove the 11 dead value exports from `index.ts` (knip-verified, imported nowhere): the 5 validators `isValidParagraphSize`, `isValidParagraphTheme`, `isValidParagraphAlign`, `isValidParagraphWeight`, `isValidParagraphWrap` and the 6 arrays `LINE_CLAMP_VALUES`, `PARAGRAPH_ALIGNS`, `PARAGRAPH_SIZES`, `PARAGRAPH_THEMES`, `PARAGRAPH_WEIGHTS`, `PARAGRAPH_WRAPS`.

The system SHALL delete the 5 validators from `model/constants.ts` and SHALL KEEP the 6 arrays (consumed by `validateParagraphProps` for dev-warn messages) and `isValidLineClamp` (consumed by Paragraph.tsx; re-export kept). All 8 type exports SHALL be kept. NOTE: knip additionally flags `isValidLineClamp` + the type re-exports — deliberately KEPT for public API stability, tracked for a future API-cleanup change.

(Previously: `index.ts` re-exported 18 names — 11 of them dead public API)

#### Scenario: index.ts no longer exports the 11 names

- GIVEN the updated `index.ts`
- WHEN `npm run analyze:dead-code` runs
- THEN the 11 names MUST NOT appear in the output
- AND `Paragraph`, all types, and `isValidLineClamp` MUST still be exported

#### Scenario: Consumer compile is unaffected

- GIVEN all 13 consumer files and the 58 stories
- WHEN `type-check:strict` runs
- THEN no errors MUST be reported (no consumer imports the removed names)

### Requirement PAR-11: CardDescription integration

The system SHALL re-implement `CardDescription` as `<Paragraph as="p" size="s" theme="muted" className={styles.cardDescription}>` and SHALL move the `0 0 1rem` bottom margin into the SCSS module. Visual parity (line-height `1.6` vs `$line-height-base` `1.5`) MUST be verified via before/after Storybook screenshots; a `lineHeight` override SHALL be added via the CSS module if a delta shows.

(Previously: CardDescription was a standalone `<p>` reinventing `font-size: .875rem`, `line-height: 1.6`, `color: var(--text-secondary)`)

#### Scenario: CardDescription renders via Paragraph

- GIVEN a Card rendering `Card.Description`
- WHEN the DOM is inspected
- THEN the description MUST be a `<p>` carrying the paragraph `s`/`muted` classes and the `cardDescription` class

#### Scenario: Existing Card tests stay green

- GIVEN the ~10 `Card.Description` assertions in `Card.test.tsx` updated to Paragraph-agnostic queries
- WHEN the Card test suite runs
- THEN all assertions MUST pass

#### Scenario: Visual parity check

- GIVEN before/after Storybook screenshots of a Card with a description
- WHEN compared
- THEN no visual regression MUST be detected (line-height delta resolved via CSS-module override if present)

### Requirement PAR-12: CardMeta integration

The system SHALL render CardMeta's inner text via `<Paragraph size="xs" theme="tertiary">`. The font-size delta (CardMeta `0.8rem` → Paragraph `xs` `0.75rem`) is ACCEPTED by resolved decision. The wrapper SHALL keep its flex layout.

(Previously: CardMeta was a `<div>` with `font-size: 0.8rem; color: var(--text-tertiary)`)

#### Scenario: CardMeta text renders via Paragraph

- GIVEN a Card rendering `Card.Meta`
- WHEN the DOM is inspected
- THEN the meta text MUST be a Paragraph carrying the `xs` and `tertiary` classes

#### Scenario: Visual delta accepted or overridden

- GIVEN the before/after comparison at the 0.8rem→0.75rem delta
- WHEN screenshots are compared
- THEN the delta MUST be visually acceptable (decision: accepted) or overridden in the CardMeta CSS module

### Requirement PAR-13: ModalContent fallback removal

The system SHALL drop the `$text-primary` fallback in `ModalContent.module.scss` (`color: var(--foreground, $text-primary)` → `color: var(--foreground)`), since the var is always defined in both themes. The "Modal body text uses Paragraph" pattern SHALL be documented in `ModalContent.stories.tsx`.

(Previously: `color: var(--foreground, $text-primary)` — a hardcoded SCSS fallback duplicating the Paragraph `primary` theme's var)

#### Scenario: Fallback removed

- GIVEN the updated `ModalContent.module.scss`
- WHEN inspected
- THEN `color` MUST be `var(--foreground)` with no fallback

#### Scenario: Modal tests unaffected

- GIVEN the Modal test suite
- WHEN it runs
- THEN no test MUST fail (both themes define `--foreground`)

### Requirement PAR-14: Test suite expansion

The system SHALL add unit tests covering: polymorphic rendering with custom components and element props (4), per-`as` ref-type assertions (2; the 2 existing `HTMLElement` ref assertions updated to `HTMLParagraphElement`), `@ts-expect-error` conditional-prop compile tests (2: `truncate`+`lineClamp`, `as="a"`+`disabled`), `useParagraph` hook (4–5: className, dataAttrs, dev-warn/no-warn), gradient theme var resolution (2), balance/pretty wrap class behavior (2), and edge cases — null/empty children with `asChild`, `as`+`asChild` conflict, invalid props (2–3).

#### Scenario: Polymorphic custom-component test

- GIVEN a test rendering `<Paragraph as={CustomComp} href="/x">`
- WHEN the test runs
- THEN the custom component MUST receive the merged paragraph className and `href`

#### Scenario: Ref-type test

- GIVEN a test rendering `<Paragraph as="a" ref={ref}>`
- WHEN the test runs
- THEN `ref.current` MUST be `instanceof HTMLAnchorElement`

#### Scenario: Compile-time conditional-prop tests

- GIVEN `@ts-expect-error` assertions on `<Paragraph truncate lineClamp={3}>` and `<Paragraph as="a" disabled>`
- WHEN `type-check:strict` runs
- THEN the assertions MUST be consumed (no unused `@ts-expect-error` diagnostics)

#### Scenario: Hook tests

- GIVEN the `useParagraph` unit tests (className mapping, dataAttrs, validation warn/no-warn)
- WHEN the suite runs
- THEN all assertions MUST pass without rendering a component

#### Scenario: Edge-case tests

- GIVEN tests for `asChild` with null/empty children and the `as`+`asChild` conflict
- WHEN the suite runs
- THEN no errors MUST be thrown and dev-warns MUST fire where specified

---

## Deferred Items (documented, NOT requirements)

| Item                          | Rationale                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| `copyable`                    | Clipboard API + i18n keys + a11y surface; no consumer need                              |
| `editable`                    | contentEditable a11y/security surface; no demand                                        |
| `ellipsis`                    | Redundant — `truncate` (single-line) + `lineClamp` (multi-line) already cover it        |
| Extra themes (`info`, `link`) | No consumers; `tertiary` added only for CardMeta integration                            |
| Extra sizes (`3xl`/`4xl`)     | Additive and safe, but deferred; `$font-size-3xl/4xl` already exist (Heading uses them) |

---

## Test Expectations

| Area                                                              | Tests                          | Type                     |
| ----------------------------------------------------------------- | ------------------------------ | ------------------------ |
| Polymorphic rendering (`a`, custom component, style preservation) | 4                              | Unit                     |
| Ref typing per `as` (+2 existing assertions updated)              | 2                              | Unit                     |
| Conditional props (`@ts-expect-error`)                            | 2                              | Compile-time             |
| `useParagraph` hook                                               | 4–5                            | Unit                     |
| Gradient var + class resolution                                   | 2                              | Unit                     |
| balance/pretty + edge cases                                       | 4–5                            | Unit                     |
| Existing Paragraph suite                                          | 64 (MUST stay green unchanged) | Unit                     |
| Storybook plays (6 key stories)                                   | 6                              | `npm run storybook:test` |
| Knip dead-code verification                                       | 11 names gone from output      | Static                   |

Existing tests MUST remain unchanged through the `useParagraph` refactor (behavioral-noop gate).

---

## Implementation Order

```
Phase 1 (~4h) — Polymorphic core
├── PAR-01: generic ParagraphProps<C> in model/types.ts
├── PAR-02: ref typing (ComponentRef<C>) + Heading memo-cast in ui/Paragraph.tsx
├── Replace createElement workaround with <Component ref={ref} {...restProps}>
├── PAR-14: polymorphic + ref tests FIRST (red), then implement

Phase 2 (~1h) — Conditional props
├── PAR-03: discriminated union on truncate; @ts-expect-error tests

Phase 3 (~2.5h) — Hook extraction
├── PAR-04: useParagraph + validateParagraphProps (useSection template)
├── Behavioral-noop gate: all 64 existing tests green unchanged

Phase 4 (~1h) — Theming
├── PAR-06: --gradient-text in _theme.scss (light + dark)
├── PAR-09: remove dup overflow-wrap; .gradient via var; _gradient.scss utility aligned
├── PAR-05: .tertiary class + ParagraphTheme + PARAGRAPH_THEMES update

Phase 5 (~0.5h) — Dead code
├── PAR-10: delete 5 validators; remove 11 index.ts exports
├── Verify: npm run analyze:dead-code (11 names gone)

Phase 6 (~5h) — Integration
├── PAR-11: CardDescription → Paragraph size="s" theme="muted" (screenshot parity)
├── PAR-12: CardMeta → Paragraph size="xs" theme="tertiary" (0.8rem→0.75rem accepted)
├── PAR-13: ModalContent fallback removal + story/doc
├── Update Card.test.tsx assertions (Paragraph-agnostic) + ui-kit-contract.md Paragraph row

Phase 7 (~6.5h) — Stories
├── PAR-07: play functions on 6 key stories
├── PAR-08: composition/showcase/edge-case stories

Phase 8 — Verification
├── type-check:strict + lint:strict (0 warnings)
├── analyze:dead-code (11 names gone)
├── storybook:test (plays pass)
├── Screenshot diff: Card/Modal before/after (zero visual regression)
```

---

## Risk Assessment

| Risk                                            | Impact   | Mitigation                                                                      |
| ----------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| Generic + `memo` incompatibility                | Blocking | Heading's proven memo-cast — copy in-repo                                       |
| Ref-type widening breaks strict consumers       | Low      | Grep: zero external `ref=`/type imports; TS error first, runtime noop           |
| CardDescription line-height delta (1.6 vs 1.5)  | Medium   | Storybook before/after screenshots; CSS-module override                         |
| CardMeta 0.8rem→0.75rem delta                   | Medium   | Accepted by resolved decision; screenshots; wrapper override if needed          |
| Dead-export removal breaks hidden consumers     | Low      | knip + rg verified; keep arrays + `isValidLineClamp` + all types                |
| `useParagraph` refactor regression              | Low      | Behavioral-noop gate: 64 tests pass unchanged                                   |
| Gradient palette confusion (gold vs app-orange) | Medium   | Keep `$gradient-text` gold (visual noop); palette switch is a separate decision |
| Slot `asChild` ref stays `HTMLElement`          | Low      | Documented; out of scope                                                        |

---

## Rollback Plan

- Every change is additive or behavioral-noop except #11/#12 (Card integration) and #6 (theme var).
- **Immediate rollback:** `git revert` the integration commit — CardDescription/CardMeta snap back to their SCSS styles; the Paragraph API is unchanged, so consumers are unaffected.
- **Dead code (#10):** re-export additions are trivially restored.
- **Gradient (#6):** remove `--gradient-text` → falls back to the identical hardcoded value (visual noop either way).
- Guard: single PR per concern (core component → theme → integration → stories) so any revert is surgical.

## Success Criteria

- [ ] `type-check:strict` + `lint:strict` pass (0 warnings); `npm run analyze:dead-code` no longer lists the 11 names
- [ ] All 64 existing Paragraph tests pass UNCHANGED (behavioral-noop through `useParagraph` refactor)
- [ ] +15–18 new tests: polymorphic rendering/refs, conditional props (compile-time), hook, gradient var
- [ ] `as='p'` ref is `HTMLParagraphElement`; `as='a'` + `href` type-checks (Heading-parity)
- [ ] 6 key stories have passing plays; 9–13 new stories render
- [ ] CardDescription/CardMeta render via Paragraph with zero visual regression (screenshot-verified)
- [ ] `--gradient-text` defined in both themes; gradient theme renders from the var
- [ ] `ui-kit-contract.md` Paragraph entry updated
