# Skeleton Component Improvement Specification

**Change**: skeleton-improvements
**Status**: Draft
**Date**: 2026-08-13
**Prior**: `docs/specs/skeleton-improvement-proposal.md` (SDD propose, user-approved)
**Priority**: 3 CRITICAL + 3 MEDIUM (~6.75h core, 0h deferred)

---

## Scope

This specification closes the last gaps between `src/shared/ui/Skeleton/` (8 files, 45-test suite, 13/13-plays stories) and the in-repo Senior+ standard proven by Link/Icon/Image/Spinner: a real animation-wiring correctness fix (B1 — the `delay`/`duration`/stagger props are visually dead today), an internal-only public surface (`validateSkeletonProps` + 3 constants off the index), an honest jsdom-aware reduced-motion test, generic polymorphic `as` with type-safe refs (Divider/Paragraph precedent), a `useSkeleton` hook extraction, and test hardening (probes, ref-per-`as`, data-attribute assertions).

**Non-breaking constraint:** all 10 consumers (TooltipContent, ButtonLoader, LinkSkeleton, ImageSkeleton, Label, Input, CodeInlineUi, CodeBlockHeader, CodeBlock, Icon.stories — grep-verified, all `import { Skeleton }`, no `as`/`ref`/`delay`/`duration` outside tests/stories) SHALL stay untouched; the default render path (`as='div'`, named-only exports) SHALL remain byte-identical. The 45-test suite SHALL stay green with one **authorized exception**: the animation assertions that lock the DEAD behavior (inline `animationDelay`/`animationDuration` on no-animation elements) MUST be updated to assert the CSS custom properties that actually drive the `::after` shimmer (SKL-01). All other assertions stay unchanged.

| #   | Gap                                                                  | Requirement | Priority | Effort | Type             |
| --- | -------------------------------------------------------------------- | ----------- | -------- | ------ | ---------------- |
| 1   | Dead animation wiring (`delay`/`duration`/stagger visually inert)    | SKL-01      | CRITICAL | 1h     | MODIFIED         |
| 2   | Validator + 3 constants on public index; redundant outer guard       | SKL-02      | CRITICAL | 0.5h   | MODIFIED         |
| 3   | No-op reduced-motion test (fake matchMedia + inline-style assertion) | SKL-03      | CRITICAL | 0.5h   | MODIFIED         |
| 4   | Polymorphic `as` prop + type-safe refs                               | SKL-04      | CRITICAL | 2.5h   | ADDED            |
| 5   | `useSkeleton` hook (thin component)                                  | SKL-05      | MEDIUM   | 1h     | ADDED            |
| 6   | Test hardening (probes, ref-per-`as`, data-attrs)                    | SKL-06      | MEDIUM   | 1h     | ADDED            |
| 7   | Docs: `ui-kit-contract.md` Skeleton row + specifics                  | SKL-07      | —        | 0.25h  | docs deliverable |

**Documentation deliverable (no requirement):** add a `### Skeleton specifics` section to `docs/specs/ui-kit-contract.md` (inventory row `| Skeleton | Yes | Yes | None |` stays unchanged).

**Out of scope:** consumer migration (10 sites all stay on default `as='div'`); new variants; animation redesign (shimmer stays the only effect); runtime `matchMedia` JS for reduced motion (CSS-only handling is correct); `prefers-reduced-motion` browser-level verification (one CSS rule does not justify Playwright — SPR-04 reasoning).

---

## ADDED Requirements

### Requirement SKL-04: Polymorphic `as` prop with generics

The system SHALL convert `as` from the closed `forwardRef<HTMLDivElement, SkeletonProps>` (`Skeleton.tsx:29`) to a generic `C extends ElementType = 'div'` (Divider/Paragraph in-repo pattern), splitting `model/types.ts` into `SkeletonOwnProps` (variant, width, height, lines, delay, duration, className) plus `SkeletonProps<C> = SkeletonOwnProps & Omit<ComponentPropsWithRef<C>, keyof SkeletonOwnProps | 'as'> & { as?: C }`. The prop SHALL be named `as` (free — the Tooltip/Popover/Slot conflicts that forced `component` on Link/Icon do not apply). Default rendering (`as='div'`) SHALL NOT change. The system SHALL apply the Divider memo-cast idiom to preserve `React.memo` with the generic, and SHALL type refs as `ForwardedRef<ComponentRef<C>>` (Paragraph ref-as-prop) plus `data-as` for string `as` only.

#### Scenario: Renders as `div` by default

- GIVEN `<Skeleton width="200px" height="20px">` with no `as`
- WHEN the component renders
- THEN the root element MUST be a `<div>` with the skeleton classes and the a11y contract (`role="status"`, `aria-busy="true"`) — byte-identical to today

#### Scenario: Renders as allowed element with element props

- GIVEN `<Skeleton as="section" aria-label="Loading">`
- WHEN the component renders
- THEN the root MUST be a `<section>` carrying the `data-as="section"` attribute and the forwarded `aria-label`

#### Scenario: Custom component receives merged props

- GIVEN `<Skeleton as={CustomBox} width="100px">` where `CustomBox` is a React component
- WHEN the component renders
- THEN `CustomBox` SHALL receive the merged skeleton className and `width`

#### Scenario: Wrong element prop rejected at compile time

- GIVEN an `@ts-expect-error` probe on `<Skeleton as="div" href="/x">`
- WHEN `type-check:strict` runs
- THEN the directive MUST be consumed (href rejected on div) and a matching `<Skeleton as="a" href="/x">` MUST type-check

#### Scenario: Ref resolves per `as`

- GIVEN `<Skeleton as="article" ref={ref}>` and `<Skeleton ref={ref}>`
- WHEN rendered
- THEN the `article` ref MUST resolve to the article element and the default ref MUST be an `HTMLDivElement`

### Requirement SKL-05: `useSkeleton` hook

The system SHALL extract `lib/hooks/useSkeleton.ts` consolidating the inline derivation in `Skeleton.tsx` — the `skeletonClassName` computation (`:50`), the `linesArray` `useMemo` (`:53-64`), the `singleLineStyle` `useMemo` (`:67-74`), the `effectiveAriaLabel` (`:43`), and the `data-variant`/`data-lines` attributes (`:85-86, :113-114`) — returning `{ skeletonClassName, linesArray, singleLineStyle, lineStyle, effectiveAriaLabel, dataAttrs }` (useDivider/useParagraph template). The validator call SHALL move into the hook (self-guarded — `validateSkeletonProps.ts:17`), enabling the outer `Skeleton.tsx:46-48` guard removal (SKL-02). The component SHALL become thin. The extraction SHALL be a behavioral noop: the DOM, data attributes, and a11y contract MUST be identical (the `data-lines` multi-line always-set / single-branch `lines > 1 ? lines : undefined` behavior SHALL be reproduced exactly).

#### Scenario: Hook returns computed className

- GIVEN `useSkeleton({ variant: 'text', className: 'custom' })`
- WHEN called
- THEN `skeletonClassName` MUST contain the `skeleton` and `text` module classes plus `'custom'` last

#### Scenario: Hook returns data attributes

- GIVEN `useSkeleton({ variant: 'text', lines: 3 })`
- WHEN called
- THEN `dataAttrs` MUST equal `{ 'data-variant': 'text', 'data-lines': 3 }` (multi-line branch) and `'data-as'` MUST be added only for string `as`

#### Scenario: Behavioral-noop gate

- GIVEN the refactored component using `useSkeleton`
- WHEN the full Skeleton test suite runs
- THEN all non-animation assertions MUST pass unchanged (45 minus the SKL-01-authorized animation assertions)

### Requirement SKL-06: Test hardening

The system SHALL replace the 2 `as any` + `eslint-disable` sites (`Skeleton.test.tsx:233-234, 241-242`) with `@ts-expect-error` compile probes (Link/Icon precedent — genuinely invalid values, no casts, so the directives are consumed by `type-check:strict`). The system SHALL add: polymorphic-surface probes (`as="div"` + `href` rejected; anchor props accepted for `as="a"`), ref-per-`as` runtime assertions (default `HTMLDivElement`, per-element), and `data-variant`/`data-lines` (plus `data-as` for string components) attribute assertions — currently emitted (`Skeleton.tsx:85-86, 113-114`) but never tested.

#### Scenario: as-any sites become consumed probes

- GIVEN `// @ts-expect-error` preceding `<Skeleton variant={'invalid' as any}>` becomes `<Skeleton variant={'invalid'}>` (typed)
- WHEN `type-check:strict` runs
- THEN no unused-diagnostic MUST be reported and no `eslint-disable` comment SHALL remain at the two sites

#### Scenario: compile-time polymorphic probes

- GIVEN probes on `<Skeleton as="div" href="/x">` and a valid `<Skeleton as="a" href="/x">`
- WHEN type-checking
- THEN the reject-probe MUST be consumed and the accept-case MUST compile

#### Scenario: data attributes asserted

- GIVEN `<Skeleton variant="text" lines={3}>` and `<Skeleton variant="circular">`
- WHEN rendered
- THEN the multi-line root MUST carry `data-lines="3"` + `data-variant="text"` and the single root MUST carry `data-variant="circular"` (no `data-lines` when `lines <= 1` in the single branch)

---

## MODIFIED Requirements

### Requirement SKL-01: Animation wiring fix — CSS vars drive the shimmer

The system SHALL write the CSS custom properties documented in `SKELETON_CONSTANTS.cssVariables` (`constants.ts:48-51`) instead of the currently dead inline `animationDelay`/`animationDuration`: the shimmer lives ONLY on `.skeleton::after` (`Skeleton.module.scss:12-19`) driven by `var(--skeleton-duration, 1.5s)` / `var(--skeleton-delay, 0s)` (`:18`), while the component writes inline animation props to the root `<div>` (`singleLineStyle`, `Skeleton.tsx:71-72`) and `.line` spans (`:94-95`) — elements with NO `animation` declaration in SCSS, so `delay`/`duration`/stagger are visually dead (always the 1.5s/0s fallback). The root SHALL receive `--skeleton-duration: <duration>s` and `--skeleton-delay: <delay>s`; each `.line` span SHALL receive the per-line staggered `--skeleton-delay` (current `delay + index * 0.1` rounding, `:62`) plus the duration var, so the `::after` shimmer actually honors duration, base delay, and line stagger via CSS custom-property inheritance. The dead inline animation props SHALL be removed from elements that carry no animation. SCSS is unchanged.

(Previously: `delay`/`duration`/stagger rendered as inline `animationDelay`/`animationDuration` on the root div and line spans — elements without an `animation` declaration; the `::after` shimmer ran on the hardcoded 1.5s/0s var fallbacks, so the props had zero visual effect. Tests asserted only inline-style presence, never animation. Verified: `Skeleton.test.tsx:66-76` (delay/duration), `:148-169` (stagger/duration), `:384` (reduced-motion no-op).)

#### Scenario: root writes duration/delay vars

- GIVEN `<Skeleton delay={0.5} duration={2}>`
- WHEN rendered
- THEN the root MUST carry inline `--skeleton-duration: 2s` and `--skeleton-delay: 0.5s` (inherited by `::after`), and MUST NOT carry `animation-delay`/`animation-duration` inline properties

#### Scenario: per-line stagger writes the delay var

- GIVEN `<Skeleton variant="text" lines={3} delay={0.2}>`
- WHEN rendered
- THEN line 0 MUST carry `--skeleton-delay: 0.2s`, line 1 `0.3s`, line 2 (last) `0.4s` (rounded to 3 decimals), each with `--skeleton-duration`

#### Scenario: no-prop path is unchanged

- GIVEN `<Skeleton>` (defaults)
- WHEN rendered
- THEN the root MUST carry `--skeleton-duration: 1.5s` and `--skeleton-delay: 0s` — matching the SCSS fallbacks, so output is behavior-equivalent at defaults

#### Scenario: authorized assertion updates

- GIVEN the tests at `Skeleton.test.tsx:69, 75, 155-157, 167` (and `:384` replaced by SKL-03)
- WHEN the suite runs
- THEN these SHALL assert the CSS custom properties (not `<div>`/`.line` inline animation props) and all other suite assertions MUST pass unchanged

### Requirement SKL-02: Validator + constants off the public index

The system SHALL remove `validateSkeletonProps` and the 3 constants (`SKELETON_CONSTANTS`, `SKELETON_VARIANTS`, `SKELETON_DEFAULTS`) from `index.ts` (`:4-5`), keeping the public surface `Skeleton` + `SkeletonProps`/`SkeletonVariant` types only. Internals SHALL keep importing direct from `lib/utils/validateSkeletonProps` and `model/constants` (LNK-05/IMG-03 internal-only precedent). The outer `if (process.env.NODE_ENV === 'development')` guard in `Skeleton.tsx:46-48` SHALL be removed — the validator is already self-guarded (`validateSkeletonProps.ts:17`) and the call SHALL move into `useSkeleton` (SKL-05).

(Previously: `index.ts` re-exported `validateSkeletonProps`, `SKELON_CONSTANTS`, `SKELETON_VARIANTS`, `SKELETON_DEFAULTS` publicly with zero index-path consumers (grep-verified: 10 consumer files import only `{ Skeleton }`); `Skeleton.tsx:46-48` wrapped the self-guarded validator in a redundant outer guard.)

#### Scenario: names absent from public API

- GIVEN the updated `index.ts`
- WHEN inspected
- THEN `validateSkeletonProps`, `SKELETON_CONSTANTS`, `SKELETON_VARIANTS`, `SKELETON_DEFAULTS` MUST NOT be exported; `Skeleton`, `SkeletonProps`, `SkeletonVariant` MUST remain

#### Scenario: internals still importable

- GIVEN `Skeleton.tsx`/`useSkeleton` importing validator + constants direct
- WHEN `type-check:strict` runs
- THEN the direct-path imports MUST resolve

#### Scenario: consumers unaffected

- GIVEN the 10 consumers (named-only `{ Skeleton }`)
- WHEN suites run
- THEN no compile or test MUST break

### Requirement SKL-03: Honest reduced-motion test (jsdom-aware)

The system SHALL replace the two matchMedia-based tests (`Skeleton.test.tsx:340-386`) — which mock `window.matchMedia` that the component NEVER calls (grep-verified; reduced-motion is CSS-only, correct) and assert inline `animationDuration: '1.5s'` (`:384`) as a no-op — with a source-level guard reading the SCSS module via `readFileSync(new URL('./Skeleton.module.scss', import.meta.url), 'utf-8')` (Paragraph PAR-09 / Spinner SPR-04 precedent; `?raw` imports are broken in this vitest pipeline, documented at `Paragraph.test.tsx:14-18`). The guard SHALL assert the `@media (prefers-reduced-motion: reduce)` block (`Skeleton.module.scss:22-26`) sets `animation: none` on `::after`. The fake matchMedia mocks SHALL be deleted.

(Previously: two tests installed a fake `window.matchMedia` (never consulted by the component), asserted the skeleton still renders, and asserted inline `animationDuration: '1.5s'` — an assertion that passes regardless of reduced-motion behavior, i.e. a no-op gate.)

#### Scenario: source guard asserts the reduce block

- GIVEN the test reading `Skeleton.module.scss` source
- WHEN the source is inspected
- THEN the `@media (prefers-reduced-motion: reduce)` block MUST declare `animation: none` on `::after`

#### Scenario: fake matchMedia removed

- GIVEN the updated suite
- WHEN it runs
- THEN no `window.matchMedia` mock SHALL be installed in the Reduced Motion describe and no computed-style assertion SHALL be attempted (jsdom cannot resolve stylesheet rules)

#### Scenario: DOM contract stays assertable

- GIVEN the reduced-motion render
- WHEN assertions run
- THEN static DOM assertions (`role="status"`, class presence) MUST remain valid

---

## Test Expectations

| Area                                                                          | Component                                              | Tests                                                             | Type                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------ |
| Animation wiring (SKL-01): root vars, per-line stagger, no-prop defaults      | Skeleton                                               | 4–5 (rewritten)                                                   | Unit                     |
| Reduced motion (SKL-03): source guard + no matchMedia                         | Skeleton                                               | 1–2                                                               | Unit                     |
| Polymorphic (SKL-04): `as` render, ref-per-`as`, merged props                 | Skeleton                                               | 3–4                                                               | Unit                     |
| `@ts-expect-error` probes (SKL-04/06): `as="div"` href, invalid variant/lines | Skeleton                                               | 3                                                                 | Compile-time             |
| `useSkeleton` hook (SKL-05): className/dataAttrs/aria                         | hook                                                   | 3–4                                                               | Unit                     |
| Data attributes (SKL-06): `data-variant`/`data-lines`/`data-as`               | Skeleton                                               | 2                                                                 | Unit                     |
| Existing suite (non-animation assertions)                                     | Skeleton                                               | 45 − animation assertions, MUST stay green UNCHANGED              | Unit                     |
| Storybook plays                                                               | Skeleton stories                                       | 13/13 green                                                       | `npm run storybook:test` |
| Consumers (10 sites)                                                          | Tooltip, Button, Link, Image, Label, Input, Code, Icon | green unchanged                                                   | Unit                     |
| Dead-code / types                                                             | static                                                 | `analyze:dead-code` — removed names absent; `type-check:strict` 0 | Static                   |

Existing tests MUST remain unchanged EXCEPT the SKL-01-authorized animation assertions (`:69, :75, :155-157, :167`) and the SKL-03 Reduced Motion replacement (`:340-386`).

## Implementation Order

```
Phase 1 (~1h) — Animation wiring: SKL-01
├── Update animation assertions to CSS vars FIRST (RED vs current behavior)
├── Rewrite singleLineStyle + line styles to --skeleton-duration/--skeleton-delay (consume cssVariables)
├── Verify: suite green; default path behavior-equivalent

Phase 2 (~0.5h) — Exports: SKL-02
├── index.ts: drop validator + 3 constants; remove outer guard in Skeleton.tsx
├── Verify: type-check + analyze:dead-code (names absent)

Phase 3 (~0.5h) — Motion test: SKL-03
├── Replace matchMedia tests with readFileSync source guard
├── Delete fake mocks; keep static DOM assertions

Phase 4 (~2.5h) — Polymorphic core: SKL-04
├── model/types.ts: SkeletonOwnProps + generic SkeletonProps<C>
├── ui/Skeleton.tsx: Divider memo-cast + <Component ref> + data-as
├── Probes + ref-per-as tests FIRST (RED vs closed typing), then implement

Phase 5 (~1h) — Hook: SKL-05
├── lib/hooks/useSkeleton.ts; validator call moves in; thin component
├── Behavioral-noop gate: non-animation assertions unchanged

Phase 6 (~1h) — Hardening: SKL-06
├── Replace 2 as-any sites with @ts-expect-error probes; data-attrs assertions

Phase 7 (~0.25h) — Docs + verify: SKL-07
├── ui-kit-contract.md ### Skeleton specifics section (row unchanged)
├── type-check:strict + lint (0) + vitest (45-with-exceptions + new) + storybook:test (13) + analyze:dead-code
```

## Risk Assessment

| Risk                                                                      | Impact | Mitigation                                                                                                       |
| ------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| SKL-01 updates animation assertions (authorized deviation from noop gate) | Low    | Scope locked to the 5 animation assertion sites; all other 40 assertions unchanged; defaults behavior-equivalent |
| `?raw` SCSS import fails in vitest                                        | Medium | Disk-read `readFileSync(new URL(..., import.meta.url))` — Paragraph-proven pattern                               |
| `as` polymorphism regresses the 45-test suite                             | Low    | Default `as='div'` byte-identical; Divider memo-cast copy; behavioral-noop gate                                  |
| Index removal breaks a hidden consumer                                    | Low    | grep-verified zero index-path consumers of the 4 names; type-check + dead-code gates                             |
| Validator guard move changes warn timing                                  | Low    | Validator is self-guarded; existing console.warn tests re-run green                                              |
| matchMedia "registration" unassertable (component never calls it)         | Medium | Honest split: deterministic source guard + static DOM assertions; no fake mocks                                  |
| Ref-type widening breaks strict consumers                                 | Low    | zero external `ref=` usage, grep-verified; TS-error-first, runtime noop                                          |

## Rollback Plan

- Per-concern commits (animation → exports → motion-test → polymorphic → hook → hardening → docs); `git revert <commit>` per concern is surgical.
- SKL-01 reverts to inline animation props (identical DOM, same dead behavior as today).
- SKL-02 re-exports are additive restores; SKL-04 default path unchanged, `as` prop drop is trivial.
- SKL-03 reverts to the matchMedia tests (restore the two describe blocks).
- SKL-05 reverts to inline memo computation (identical values).
- Docs revert trivially (`docs/specs/*.md` untracked by git — expected; commit scope = `src/` only).

## Success Criteria

- [ ] `type-check:strict` + `lint` (0 warnings); `npm run analyze:dead-code` — `validateSkeletonProps`, `SKELETON_CONSTANTS`, `SKELETON_VARIANTS`, `SKELETON_DEFAULTS` absent
- [ ] `delay`/`duration`/stagger actually drive the shimmer — CSS-var assertions on the elements that own them; no inline animation props on no-animation elements
- [ ] All non-animation existing test assertions pass UNCHANGED (behavioral-noop through `useSkeleton` + polymorphism); the 5 SKL-01-authorized animation assertions updated
- [ ] Reduced-motion source guard asserts `animation: none` on `::after`; fake matchMedia tests gone
- [ ] `as='div'` default; ref resolves per `as`; `data-as` string-only; `@ts-expect-error` probes consumed (no unused diagnostics)
- [ ] The 2 `as any` + eslint-disable sites replaced with probes; `data-variant`/`data-lines` asserted
- [ ] `ui-kit-contract.md` Skeleton specifics section; inventory row unchanged
- [ ] 10 consumers green unchanged; 13/13 storybook plays green
