# Design: Skeleton Component Improvement

**Change**: skeleton-improvements · **Status**: Draft · **Date**: 2026-08-13
**Scope source**: `docs/specs/skeleton-improvement-spec.md` (SKL-01..SKL-07)
**Non-breaking gate**: 45-test `Skeleton.test.tsx` suite passes with ONE authorized exception — the 5 animation assertions locking the DEAD behavior (inline `animationDelay`/`animationDuration` on no-animation elements) update to the CSS custom properties that actually drive the `::after` shimmer (SKL-01), plus the Reduced Motion describe replacement (SKL-03). All other assertions stay unchanged. 10 consumers import only `{ Skeleton }` (grep-verified) and stay untouched; default `as='div'` render path byte-identical.

## Overview

Close the last gaps between `src/shared/ui/Skeleton/` and the in-repo Senior+ standard: a real animation-wiring correctness fix (SKL-01 — the shimmer lives only on `.skeleton::after`, driven by `var(--skeleton-duration/delay)`, but the component writes inline animation props to elements with NO `animation` declaration), an internal-only public surface (SKL-02), an honest jsdom-aware reduced-motion test (SKL-03), generic polymorphic `as` + type-safe refs (SKL-04), a `useSkeleton` hook extraction (SKL-05), and test hardening (SKL-06), closing with a docs contract section (SKL-07).

**Key verified facts (this session):**

- `Skeleton.tsx` is `memo(forwardRef<HTMLDivElement, SkeletonProps>)` (`:28-29`) — **closed div typing**; SKL-04 widens it to generic `C extends ElementType = 'div'`.
- **The dead animation wiring (SKL-01):** the shimmer is ONLY on `.skeleton::after` (`Skeleton.module.scss:12-19`) with `animation: shimmer var(--skeleton-duration, 1.5s) var(--skeleton-delay, 0s) infinite` (`:18`). The component writes inline `animationDelay: ${delay}s` / `animationDuration: ${duration}s` to the ROOT div (`Skeleton.tsx:71-72`) and to `.line` spans (`:94-95`) — elements with NO `animation` declaration in SCSS (`:33-44`). Net effect: `delay`/`duration`/stagger are visually dead (always the 1.5s/0s fallback). `SKELETON_CONSTANTS.cssVariables` (`constants.ts:48-51`) documents `--skeleton-duration`/`--skeleton-delay` but is written NOWHERE — consuming it in the fix makes the constant live (no knip finding) and honors the documented var names.
- **Redundant outer guard (SKL-02):** `Skeleton.tsx:46-48` wraps `validateSkeletonProps(props)` in `if (process.env.NODE_ENV === 'development')` — but the validator is ALREADY self-guarded (`validateSkeletonProps.ts:17`). The outer guard is removable.
- **Index surface (SKL-02):** `index.ts` exports `SKELETON_CONSTANTS`/`SKELETON_VARIANTS`/`SKELETON_DEFAULTS` (`:4`) + `validateSkeletonProps` (`:5`) — zero index-path consumers (grep-verified; all 10 consumers import only `{ Skeleton }`). `Skeleton.tsx:7-8` already imports constants + validator DIRECT, so dropping them from the index breaks nothing internal.
- **The 2 test suppressions (SKL-06):** `Skeleton.test.tsx:233-234` passes `variant={'invalid' as any}` (type-invalid → probe-able); `:241-242` passes `lines={0 as any}` (type-VALID — `lines?: number` accepts 0; the `as any` is redundant, and a `@ts-expect-error` there would be an UNUSED directive failing `type-check:strict`). Honest split: probe the variant site, cleanly drop the suppression on the lines site. Existing probe precedent already in-file at `:285` (`@ts-expect-error Testing invalid prop`).
- **Reduced Motion tests are no-ops (SKL-03):** `:340-386` mocks `window.matchMedia` (the component NEVER calls it — grep-verified; reduced-motion is CSS-only, correct) and asserts inline `animationDuration: '1.5s'` (`:384`) — the component always writes that inline, so the assertion passes regardless of reduced-motion behavior. Both tests must be replaced by a deterministic source guard.
- **Data attrs never tested (SKL-06):** `data-variant` (`:85, :113`) and `data-lines` (`:86` multi-line always, `:114` single-branch `lines > 1 ? lines : undefined`) are emitted but asserted NOWHERE. NOTE: multi-line branch requires `lines > 1`, so the single formula `lines > 1 ? lines : undefined` reproduces BOTH branches exactly.
- **`?raw` SCSS imports are broken in this vitest pipeline** (`Paragraph.test.tsx:14-18` documents vitest's CSS-module stub intercepting them) — the repo-proven pattern is disk reads (`readFileSync(new URL(rel, import.meta.url), 'utf-8')`), Spinner SPR-04 precedent.
- Suite inventory: **45 `it()` blocks** (5 Basic Rendering + 6 Props + 6 Accessibility + 8 Multiple Lines + 3 Variants Specific + 8 Runtime Validation + 6 Edge Cases + 2 Reduced Motion + 1 React.memo); **13 stories / 13 plays** (`Skeleton.stories.tsx`; 13 `play` blocks at `:68,77,86,95,108,140,156,175,191,208,227,247,263`).

## Architecture

### File tree (before → after)

```
src/shared/ui/Skeleton/
├── index.ts                          MODIFY  (SKL-02: drop validator + 3 constants; keep Skeleton + types)
├── ui/Skeleton.tsx                   MODIFY  (CSS-var wiring SKL-01; guard removal SKL-02; generic as + memo-cast SKL-04; thin → useSkeleton SKL-05)
├── ui/Skeleton.module.scss           UNCHANGED (shimmer :12-19, reduced-motion :22-26 stay; vars already consumed by ::after)
├── ui/Skeleton.test.tsx              MODIFY  (SKL-01 authorized assertion updates :69/:75/:155-157/:167; SKL-03 reduced-motion replacement; SKL-06 as-any removal + probes + data-attrs)
├── ui/Skeleton.stories.tsx           OPTIONAL (play hardening — WithDelay story asserts CSS vars instead of inline anim; 13/13 gate otherwise)
├── model/types.ts                    MODIFY  (SKL-04: SkeletonOwnProps + generic SkeletonProps<C>; hook types)
├── model/constants.ts                MODIFY  (cssVariables CONSUMED by SKL-01 — stays, no dead-code finding)
├── lib/hooks/useSkeleton.ts          NEW     (SKL-05: useDivider/useParagraph template)
├── lib/hooks/useSkeleton.test.ts     NEW     (SKL-05 hook unit tests, Link/Icon precedent)
├── lib/utils/validateSkeletonProps.ts MODIFY  (SKL-02/05: signature narrows to SkeletonOwnProps — variant/lines/delay/duration are all own props)
└── ui/Skeleton.polymorphic.test.tsx  NEW     (SKL-04/06: polymorphic render, ref-per-as, @ts-expect-error, data-attrs)

docs/specs/ui-kit-contract.md         MODIFY  (SKL-07: ### Skeleton specifics; inventory row `| Skeleton | Yes | Yes | None |` unchanged)
```

**Dependency order**: types → cssVariables consumption (SKL-01) → exports (SKL-02) → motion test (SKL-03) → polymorphic core (SKL-04) → hook (SKL-05) → hardening (SKL-06) → docs (SKL-07). Each commit revertible (Rollback section).

## Per-requirement design

### SKL-01 — Animation wiring: CSS vars drive the shimmer

- `singleLineStyle` (`Skeleton.tsx:67-74`) becomes:

```ts
const singleLineStyle = useMemo(
  () => ({
    width,
    height,
    [SKELETON_CONSTANTS.cssVariables.duration]: `${duration}s`,
    [SKELETON_CONSTANTS.cssVariables.delay]: `${delay}s`,
  }),
  [width, height, delay, duration]
);
```

- Per-line style (`:94-95`) becomes `{ [cssVariables.delay]: `${lineDelay}s`, [cssVariables.duration]: `${duration}s` }` — consumed by the `::after` shimmer on each `.line` (CSS custom-property inheritance).
- **Authorized assertion updates (spec-locked to 5 sites):** `:69` (`animationDelay: '0.5s'` → root `--skeleton-delay: 0.5s`), `:75` (`animationDuration: '2s'` → root `--skeleton-duration: 2s`), `:155-157` (stagger → per-line `--skeleton-delay` `0.2s/0.3s/0.4s`), `:167` (multi-line → per-line `--skeleton-duration: 2.5s`). jsdom `toHaveStyle` handles CSS custom properties (`{ '--skeleton-delay': '0.5s' }`).
- **No-prop path:** `delay=0`/`duration=1.5` defaults → `--skeleton-delay: 0s` / `--skeleton-duration: 1.5s` — byte-equivalent to the SCSS var fallbacks (`1.5s`/`0s`), so the default render is behavior-equivalent (spec scenario). No SCSS change.

### SKL-02 — Validator + constants off the public index

- `index.ts`: `export type { SkeletonProps, SkeletonVariant }` + `export { Skeleton }` only. Internals keep direct-path imports (`Skeleton.tsx:7-8` — already direct; `useSkeleton` imports direct too). `SKELETON_CONSTANTS` stays USED internally (defaults destructuring `:32-37` + cssVariables in SKL-01) → no knip dead-name.
- Remove the outer guard `Skeleton.tsx:46-48`; the validator call moves into `useSkeleton` (SKL-05), self-guarded inside.

### SKL-03 — Honest reduced-motion test (jsdom-aware)

- Delete the two fake-matchMedia tests (`:340-386`) — the component never calls `matchMedia`.
- Replace with a source-level guard (Spinner SPR-04 / Paragraph PAR-09 disk-read precedent):

```ts
const readScss = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf-8');
const skeletonScss = readScss('./Skeleton.module.scss');
```

Assert the `@media (prefers-reduced-motion: reduce)` block (`:22-26`) contains `&::after` + `animation: none`. Keep static DOM assertions (`role="status"`, class presence) without matchMedia mocks.

### SKL-04 — Polymorphic `as` prop with generics

- `model/types.ts` — Divider-type split:

```ts
export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export interface SkeletonOwnProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  delay?: number;
  duration?: number;
  className?: string;
}
export type SkeletonProps<C extends ElementType = 'div'> = SkeletonOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof SkeletonOwnProps | 'as'> & { as?: C };
export type SkeletonComponent = (<C extends ElementType = 'div'>(
  props: SkeletonProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & { displayName?: string };
```

- Existing inherited `HTMLAttributes<HTMLDivElement>` surface (`aria-label`, `style`, `data-testid`, `id`, `restProps`) flows back through the `Omit<ComponentPropsWithRef<C>, …>` merge — consumers unaffected (default `C='div'`).
- `ui/Skeleton.tsx`: Divider memo-cast verbatim (`dividerRef`/`DividerMemo`/`DividerComponent` chain, `:21-89`); render `<Component ref={ref} className aria-label {...dataAttrs} {...restProps}>` in BOTH branches; `data-as` only when `typeof as === 'string'`. Prop named `as` (free — Skeleton composes no Tooltip/Popover/Slot children that own `as`).
- Refs: `ForwardedRef<ComponentRef<C>>` — default `HTMLDivElement`; `as="article"` → article element; custom component ref resolves per element.

### SKL-05 — `useSkeleton` hook

- `lib/hooks/useSkeleton.ts` (useDivider template — validator call OUTSIDE `useMemo`, computed values inside):

```ts
interface UseSkeletonParams extends SkeletonOwnProps {
  ariaLabel?: string;
  as?: ElementType;
}
interface UseSkeletonReturn {
  skeletonClassName: string;
  linesArray: Array<{ index: number; isLast: boolean; delay: number }> | null;
  singleLineStyle: CSSProperties;
  lineStyle: (lineDelay: number) => CSSProperties;
  effectiveAriaLabel: string;
  dataAttrs: Record<string, string>;
}
```

- Extraction is byte-identical: className computation (`:50`), `linesArray` `useMemo` with `Math.round((delay + index * 0.1) * 1000) / 1000` (`:53-64`), `singleLineStyle` `useMemo` (SKL-01 vars), `effectiveAriaLabel` (`:43`), validator call moved in with outer guard gone.
- **Data-attrs exactness (spec-locked):** `dataAttrs = { 'data-variant': variant, ...(lines > 1 && { 'data-lines': lines }), ...(typeof as === 'string' && { 'data-as': as }) }` — the `lines > 1` formula reproduces the multi-line always-set (`:86`) AND the single-branch conditional (`:114`) branches identically (multi-line implies `lines > 1`). Component stays thin.

### SKL-06 — Test hardening

- `:233-234` → `// @ts-expect-error — invalid variant` above typed `<Skeleton variant="invalid" />` (no cast — directive consumed; runtime dev-warn still fires via validator).
- `:241-242` → clean `<Skeleton lines={0} />` (0 is type-valid; `as any` + eslint-disable deleted — an `@ts-expect-error` there would be UNUSED and fail `type-check:strict`). **Decision 4**.
- Add compiler probes: `<Skeleton as="div" href="/x">` rejected (polymorphic surface); `<Skeleton lines={'bad'}>` rejected (genuinely invalid value probe — keeps the "probe per as-any site" intent for lines without the unused-directive trap).
- Add ref-per-`as` runtime assertions (default `HTMLDivElement`, `as="article"` element) and `data-variant`/`data-lines`/`data-as` attribute assertions (currently emitted, never tested).

### SKL-07 — Docs

`### Skeleton specifics` section in `docs/specs/ui-kit-contract.md` (placement: with the other component specifics sections): props contract (variant/width/height/lines/delay/duration), polymorphic `as` + refs, `useSkeleton` hook, a11y model (`role="status"`, `aria-busy`, `aria-label` with i18n `t('loading')`), the animation-vars model (`--skeleton-duration`/`--skeleton-delay` consumed by the `::after` shimmer), 10 consumers, stories 13 / plays 13. Inventory row `| Skeleton | Yes | Yes | None |` unchanged.

## Deliverable decisions

| #   | Decision                                                                                                                                                | Alternatives                                                                              | Rationale                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **SKL-01 consumes `SKELETON_CONSTANTS.cssVariables`** (`constants.ts:48-51`) for the var names                                                          | Hardcode `--skeleton-duration`/`--skeleton-delay` strings; drop the constant as dead code | The constant documents the exact var contract and becomes live (no knip finding); single source of truth for the CSS-var names                                                                                                          |
| 2   | **Reduced-motion guarantee = disk-read source guard + static DOM** (Spinner SPR-04 / Paragraph PAR-09 mechanism)                                        | `?raw` import; fake matchMedia                                                            | `?raw` is intercepted by vitest's CSS-module stub (documented `Paragraph.test.tsx:14-18`); component never calls `matchMedia` (grep-verified) — a registration assertion is unimplementable; disk reads are deterministic               |
| 3   | **Generic `as` design = Divider copy** (`SkeletonOwnProps` + `SkeletonProps<C>` + memo-cast + `ComponentRef<C>`), name `as` NOT `component`             | `component` name (Link/Icon precedent)                                                    | `as` is free here — Skeleton composes none of the slices that own `as` (Tooltip/Popover/Slot); Divider/Paragraph precedent is the closest sibling (div root, hook + validator, SCSS module)                                             |
| 4   | **`@ts-expect-error` on the variant site ONLY; lines site gets clean removal + a separate genuinely-invalid probe**                                     | Probes on both as-any sites per spec wording                                              | `lines={0 as any}` passes a type-VALID value (`lines?: number`) — a directive there is an unused-diagnostic and breaks `type-check:strict` (the spec's own gate). Honest split preserves the probe intent for lines via `lines={'bad'}` |
| 5   | **`data-lines` single formula `lines > 1 ? lines : undefined` in the hook**                                                                             | Branch-specific `dataAttrs` in the component                                              | Multi-line branch implies `lines > 1`, so one formula reproduces `:86` (always set) and `:114` (conditional) exactly — byte-identical after extraction, spec-locked                                                                     |
| 6   | **Validator signature narrows to `SkeletonOwnProps`** (variant/lines/delay/duration)                                                                    | Keep full generic `SkeletonProps<C>`                                                      | All four validated fields are own props; a generic props parameter would infect the validator with `C` for no reason. Self-guard at `:17` stays — callers need no guard                                                                 |
| 7   | **New `Skeleton.polymorphic.test.tsx` + `useSkeleton.test.ts` files; `Skeleton.test.tsx` touched ONLY at the 5 SKL-01 sites + Reduced Motion describe** | Rewrite the 45-test file in place                                                         | Isolates the authorized deviations; the 40 untouched assertions remain byte-identical (Link `Link.polymorphic.test.tsx` / Icon `Icon.polymorphic.test.tsx` precedent)                                                                   |

## Data flow (post-change)

```
<Skeleton as="article" variant="text" lines={3} delay={0.2} duration={2}>
  ├─ validateSkeletonProps({variant, lines, delay, duration})   [guard inside — SKL-02/05]
  ├─ useSkeleton({...})                                          [SKL-05]
  │     ├─ skeletonClassName = classNames(styles.skeleton, styles[variant], className)
  │     ├─ linesArray         = variant==='text' && lines>1 ? [{index, isLast, delay: rounded}] : null
  │     ├─ singleLineStyle    = { width, height, '--skeleton-duration': '2s', '--skeleton-delay': '0.2s' }  [SKL-01]
  │     ├─ dataAttrs          = { 'data-variant': 'text', 'data-lines': 3, 'data-as': 'article' }           [string as only]
  │     └─ effectiveAriaLabel = ariaLabel ?? t('loading')
  ├─ Component = 'article'
  │
  ├─ multi-line branch (lines>1 && variant='text'):
  │     <article class=… role="status" aria-busy aria-label data-variant data-lines data-as …rest>
  │       <span class=line style={--skeleton-delay:0.2s; --skeleton-duration:2s}>          ← ::after shimmer honors stagger
  │       <span class=line style={--skeleton-delay:0.3s; --skeleton-duration:2s}>
  │       <span class="line lastLine" style={--skeleton-delay:0.4s; --skeleton-duration:2s}>
  └─ single branch:
        <article class=… style={singleLineStyle} role="status" aria-busy aria-label data-variant data-as …rest>
```

The `::after` shimmer (`Skeleton.module.scss:12-19`, unchanged) reads `var(--skeleton-duration, 1.5s)` / `var(--skeleton-delay, 0s)` — **now actually driven** by the root/per-line vars instead of the hardcoded fallbacks.

## Test plan

| Layer           | What                                                                                                                                       | How                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Unit (existing) | 45-test suite — 40 assertions UNCHANGED; 5 SKL-01 sites updated; Reduced Motion describe replaced (SKL-03)                                 | `npx vitest run src/shared/ui/Skeleton`                                 |
| Unit (new)      | SKL-01 vars: single root `--skeleton-duration/delay`, per-line stagger `0.2/0.3/0.4s`, no-prop `1.5s/0s` defaults (2–3)                    | fake-less `toHaveStyle` CSS-var assertions                              |
| Unit (new)      | SKL-03: source guard (`animation: none` + `::after` in the reduce media block), no matchMedia mock, static DOM (2)                         | `readFileSync(new URL(..., import.meta.url), 'utf-8')` (PAR-09 pattern) |
| Unit (new)      | SKL-04: polymorphic render (default div / `as="article"` + `title` / custom comp), ref-per-`as`, `data-as` string-only (3–4)               | `Skeleton.polymorphic.test.tsx`                                         |
| Hook (new)      | SKL-05: className mapping, `linesArray` stagger values, `singleLineStyle` vars, `dataAttrs` incl. `data-lines` formula (3–4)               | `lib/hooks/useSkeleton.test.ts` (Link/Icon hook-test precedent)         |
| Compile-time    | SKL-04/06 probes: `variant="invalid"` (type-reject), `as="div" href` (polymorphic reject), `lines={'bad'}` (value probe); ref-per-`as` (3) | consumed by `type-check:strict` (no unused directives)                  |
| Attributes      | SKL-06: `data-variant`/`data-lines` (multi + single) /`data-as` asserted (2)                                                               | `Skeleton.polymorphic.test.tsx`                                         |
| Stories         | 13 stories / 13 plays stay green; optional `WithDelay` warm-up play asserts CSS vars                                                       | `npm run storybook:test`                                                |
| Consumers (10)  | TooltipContent, LinkSkeleton, CodeInlineUi, Label, CodeBlockHeader, CodeBlock, ImageSkeleton, ButtonLoader, Input, Icon.stories            | green unchanged — default `as='div'` byte-identical                     |
| Static          | `analyze:dead-code` no new names (cssVariables now consumed); `type-check:strict` 0; lint 0                                                | gate                                                                    |

## Risks

| Risk                                                           | Impact | Mitigation                                                                                                                                                                   |
| -------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SKL-01 authorized deviation from the noop gate                 | Low    | Scope locked to 5 assertion sites (`:69/:75/:155-157/:167`) + Reduced Motion describe; 40 other assertions untouched; no-prop defaults behavior-equivalent to SCSS fallbacks |
| `@ts-expect-error` on `lines={0}` would be unused (type-valid) | Low    | Decision 4: probe the truly-invalid variant site; lines site cleans up; separate `lines={'bad'}` probe keeps intent                                                          |
| `?raw` SCSS import breaks in vitest                            | Medium | Disk-read `readFileSync(new URL(..., import.meta.url))` — Paragraph-proven pattern                                                                                           |
| `as` polymorphism regresses the 45-test gate                   | Low    | Default `C='div'` keeps `HTMLDivElement` props via the Omit merge; Divider memo-cast verbatim; behavioral-noop gate                                                          |
| Index removal breaks a hidden consumer                         | Low    | grep-verified zero index-path consumers of the 4 names; `Skeleton.tsx:7-8` already imports direct; type-check + dead-code gates                                              |
| Validator signature narrowing changes warn timing              | Low    | All validated fields are own props (same values); guard internal; existing console.warn tests re-run green                                                                   |
| `data-lines` formula drift across branches                     | Low    | Decision 5 — single formula proven equivalent for both branches; SKL-06 attribute assertions added                                                                           |

## Migration / Rollout

No data migration, no feature flags. Per-concern commits (animation → exports → motion-test → polymorphic → hook → hardening → docs) so `git revert <commit>` is surgical per concern. SKL-01 reverts to inline animation props (identical DOM, same dead behavior as today); SKL-02 re-exports are additive restores; SKL-04 default path unchanged, `as` drop trivial; SKL-03 reverts to the matchMedia describes; SKL-05 reverts to inline memo computation. `docs/specs/*.md` untracked by git (expected; commit scope = `src/` only).

## Threat Matrix

**N/A** — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Changes are presentational + test-harness + export-surface only.

## Open Questions

- [ ] None blocking. (Decision 4 resolves the `lines={0}` probe trap honestly; `WithDelay` story hardening is optional per Decision 7 — the 13/13 play gate is unaffected either way.)

## Next Step

Ready for tasks (sdd-tasks).
