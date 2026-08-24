# Proposal: Skeleton Component Improvement

**Change**: skeleton-improvements
**Status**: Draft
**Date**: 2026-08-13
**Prior**: SDD explore (skeleton-improvements session — verified, not hypotheses)

## Intent

Bring `src/shared/ui/Skeleton/` (8 files, 978 lines, 45 tests, 13 stories) to the in-repo Senior+ standard proven by Link/Icon/Image/Spinner. The slice's basics are solid — named-only exports, correct a11y contract (`role="status"`/`aria-busy`/`aria-label` with i18n `t('loading')`), a self-guarded dev validator, an SCSS reduced-motion block, 13/13 story plays. Five concrete gaps remain, one a real correctness bug.

## Scope

### In Scope

- **B1 — Fix dead animation wiring (correctness).** The shimmer lives ONLY on `.skeleton::after` (`Skeleton.module.scss:12-19`), driven by `var(--skeleton-duration, 1.5s)` / `var(--skeleton-delay, 0s)`. The component writes inline `animationDelay`/`animationDuration` to the root `<div>` and `.line` spans — elements with NO `animation` declaration in SCSS. `SKELETON_CONSTANTS.cssVariables` documents the CSS vars, but the component never writes them. Net effect: `delay`/`duration`/stagger are **visually dead** (always 1.5s/0s fallback). Tests pass only because they assert inline style presence (`Skeleton.test.tsx:66-76,148-168`), not animation. Fix: write `--skeleton-duration`/`--skeleton-delay` CSS vars from props (root + per-line stagger) so the `::after` shimmer actually honors them; keep inline props off no-animation elements.
- **B2 — Validator + constants off the public index.** `index.ts:5` re-exports `validateSkeletonProps` (Container anti-pattern, rejected by LNK-05/IMG-03/AR-07); `index.ts:4` re-exports `SKELETON_CONSTANTS`/`SKELETON_VARIANTS`/`SKELETON_DEFAULTS` — consumed nowhere outside the slice (grep-verified). Remove all 4 from public API; internals import direct paths. Also remove the outer `if (process.env.NODE_ENV === 'development')` guard in `Skeleton.tsx:46-48` — the validator is already self-guarded (LNK-15 precedent).
- **B3 — Honest reduced-motion test.** Current tests (`Skeleton.test.tsx:340-386`) mock `window.matchMedia` (which the component NEVER calls — CSS-only handling, correct) and assert inline `animationDuration: '1.5s'` — a no-op that passes regardless. Replace with a source-level guard: `readFileSync(new URL('./Skeleton.module.scss', import.meta.url), 'utf-8')` asserting the `@media (prefers-reduced-motion: reduce)` block sets `animation: none` on `::after` (SPR-04/PAR-09 precedent; `?raw` imports are broken in this vitest pipeline, documented in `Paragraph.test.tsx:14-18`).
- **B4 — Polymorphic `as` prop + type-safe refs.** Convert closed `forwardRef<HTMLDivElement, SkeletonProps>` to generic `C extends ElementType = 'div'` + `ComponentRef<C>` refs + Heading/Divider memo-cast. Prop name: `as` (free — Tooltip/Popover/Slot conflicts that forced `component` on Link/Icon don't apply; Divider/Paragraph precedent). Default `as='div'` byte-identical.
- **B5 — `useSkeleton` hook.** Extract the 2 inline `useMemo` + className/aria-label derivation into `lib/hooks/useSkeleton.ts` (useDivider/useParagraph template); thin component; behavioral-noop gate (45 existing tests).
- **B6 — Test hardening.** Replace the 2 `as any` + eslint-disable sites (`Skeleton.test.tsx:233-234,241-242`) with `@ts-expect-error` probes (Link/Icon precedent); add `@ts-expect-error` probes for the polymorphic surface (`as="div"` + `href` rejected); add ref-per-`as` tests and `data-variant`/`data-lines` attribute assertions (currently emitted but never tested).
- **B7 — Docs.** `### Skeleton specifics` section in `docs/specs/ui-kit-contract.md` (row 25 stays `| Skeleton | Yes | Yes | None |`): props contract, `as` polymorphism, hook, a11y model, 10 consumers, stories/plays counts.

### Out of Scope

- Consumer migration (10 sites — TooltipContent, ButtonLoader, LinkSkeleton, ImageSkeleton, Label, Input, CodeInlineUi, CodeBlockHeader ×3, CodeBlock, Icon.stories) — all stay on default `as='div'`, nothing changes.
- New variants; animation redesign; skeleton-in-card feature work; `aria-atomic`/`role="region"` debates.

## Approach

1. **B1**: in `Skeleton.tsx` single-line style → `{ width, height, '--skeleton-duration': `${duration}s`, '--skeleton-delay': `${delay}s` }`; per-line style → `{ '--skeleton-delay': `${lineDelay}s`, '--skeleton-duration': `${duration}s` }`. SCSS unchanged (vars already consumed by `::after`).
2. **B2**: `index.ts` → `export type { SkeletonProps, SkeletonVariant }` + `export { Skeleton }` only. Validator stays exported from `lib/utils/validateSkeletonProps.ts` (direct-path imports).
3. **B3**: module-level `readFileSync` source guard (Paragraph `PAR-09` pattern), asserting the media block + `animation: none`.
4. **B4**: `SkeletonOwnProps`/generic `SkeletonProps<C = 'div'>` split in `model/types.ts`; memo-cast in `ui/Skeleton.tsx`; `<Component ref={ref}>` JSX.
5. **B5**: `useSkeleton(props)` → `{ skeletonClassName, singleLineStyle, lineStyle, linesArray, effectiveAriaLabel, dataAttrs }`; component stays thin.
6. **B6**: tests-first (RED) for probes/refs/data-attrs; keep the 45 existing assertions unchanged.
7. **B7**: docs contract section consistent with B4/B5.

## Affected Areas

| Area                                              | Impact                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/shared/ui/Skeleton/ui/Skeleton.tsx`          | Modified — CSS-var wiring, polymorphic + memo-cast, useSkeleton                            |
| `src/shared/ui/Skeleton/model/types.ts`           | Modified — generic `SkeletonProps<C>` + hook types                                         |
| `src/shared/ui/Skeleton/model/constants.ts`       | Modified — `cssVariables` consumed or dropped (dead-code lock)                             |
| `src/shared/ui/Skeleton/lib/hooks/useSkeleton.ts` | New                                                                                        |
| `src/shared/ui/Skeleton/ui/Skeleton.test.tsx`     | Modified — add probes/refs/data-attrs/reduced-motion source-guard; 45 assertions unchanged |
| `src/shared/ui/Skeleton/ui/Skeleton.stories.tsx`  | Modified — optional play hardening (WithDelay asserts CSS vars)                            |
| `src/shared/ui/Skeleton/index.ts`                 | Modified — validator + constants off public API                                            |
| `docs/specs/ui-kit-contract.md`                   | Modified — Skeleton specifics section (row unchanged)                                      |
| 10 consumers                                      | None — default `as='div'` byte-identical                                                   |

## Consumer Impact

All 10 sites import `{ Skeleton }` from the index and pass only `variant`/`width`/`height`/`lines`/`className`/`style`/`aria-busy`/`data-skeleton` — none pass `as`, `ref`, `delay`, `duration` outside tests/stories. Zero risk from B2 (nobody imports the removed names, grep-verified) and B4 (default path unchanged).

## Risks

| Risk                                                     | Mitigation                                                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Fixing B1 changes perceived behavior (CSS var vs inline) | CSS vars drive the SAME `::after` shimmer; staggering becomes visually correct; tests updated to assert vars on the element that owns them |
| `as` polymorphism breaks the 45-test gate                | behavioral-noop gate — default `as='div'` byte-identical; memo-cast copy from Divider                                                      |
| `readFileSync` in test breaks CI env                     | Paragraph-proven pattern; plain Node fs in vitest (jsdom)                                                                                  |
| Removing 4 index exports breaks a hidden consumer        | grep-verified zero external imports; type-check:strict + dead-code gate                                                                    |
| Validator outer-guard removal changes warn timing        | validator is self-guarded; existing console.warn tests re-run green                                                                        |

## Rollback Plan

Per-concern commits (animation → exports → motion-test → polymorphic → hook → tests → docs); `git revert <commit>` per concern is surgical. B1 reverts to inline styles (identical DOM); B2 re-exports are additive; B4 default path unchanged.

## Dependencies

In-repo only: Divider (polymorphic `as`/memo-cast/hook), Paragraph (disk-read source-guard, `?raw` broken note), Spinner SPR-04 (reduced-motion test approach), LNK-05/IMG-03 (internal-only surface), Link/Icon (`@ts-expect-error` probes). No new packages.

## Success Criteria

- [ ] `type-check:strict` + `lint` (0 warnings); `npm run analyze:dead-code` no new dead names
- [ ] `delay`/`duration`/stagger actually drive the shimmer — CSS-var assertions on `::after`'s owner
- [ ] All 45 existing test assertions pass UNCHANGED (behavioral-noop through hook + polymorphism)
- [ ] Reduced-motion source-guard asserts `animation: none` in the media block; fake matchMedia tests gone
- [ ] `validateSkeletonProps` + 3 constants absent from `index.ts`; outer NODE_ENV guard removed
- [ ] `as='div'` default; ref resolves per `as`; `@ts-expect-error` probes consumed
- [ ] `ui-kit-contract.md` Skeleton specifics section; row unchanged

## Recommendation + Effort

| Item                       | Effort | Recommendation            |
| -------------------------- | ------ | ------------------------- |
| B1 animation wiring fix    | 1h     | **Yes — core** (real bug) |
| B2 exports + guard         | 0.5h   | **Yes**                   |
| B3 reduced-motion test     | 0.5h   | **Yes**                   |
| B4 polymorphic `as` + refs | 2.5h   | **Yes**                   |
| B5 `useSkeleton` hook      | 1h     | **Yes**                   |
| B6 test hardening          | 1h     | **Yes**                   |
| B7 docs                    | 0.25h  | **Yes**                   |

**Total: ~6-7h**, all additive/behavioral-noop except B1 (fix), per-concern revertible.

**Next step:** `sdd-spec` for `skeleton-improvements`.
