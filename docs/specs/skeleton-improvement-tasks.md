# Tasks: Skeleton Component Improvement

**Change**: skeleton-improvements · **Date**: 2026-08-13
**Source**: `skeleton-improvement-spec.md` (SKL-01..07) + `skeleton-improvement-design.md` (decisions 1–7)
**Gate**: 45-`it()` `Skeleton.test.tsx` suite passes with ONE authorized exception — 5 animation-assertion sites (`:69, :75, :155-157, :167`) updated to CSS custom properties (SKL-01) + Reduced Motion describe replaced (SKL-03). 40 other assertions unchanged. 10 consumers (TooltipContent, LinkSkeleton, CodeInlineUi, Label, CodeBlockHeader, CodeBlock, ImageSkeleton, ButtonLoader, Input, Icon.stories — all `import { Skeleton }`) stay green. Default `as='div'` render path byte-identical. 3 new files, 0 deleted.

## Review Workload Forecast

| Field                   | Value                                                                         |
| ----------------------- | ----------------------------------------------------------------------------- |
| Estimated changed lines | ~500–650 (`additions + deletions`)                                            |
| 400-line budget risk    | High                                                                          |
| Chained PRs recommended | Yes                                                                           |
| Suggested split         | PR 1 correctness+hygiene → PR 2 polymorphic+hook → PR 3 hardening+docs+verify |
| Delivery strategy       | ask-on-risk                                                                   |
| Chain strategy          | feature-branch-chain (user decision 2026-08-13)                               |

```text
Decision needed before apply: No (resolved — feature-branch-chain)
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal                                 | PR   | Focused test command                                  | Runtime harness                                                               | Rollback                                                                                  |
| ---- | ------------------------------------ | ---- | ----------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1    | Correctness + hygiene: SKL-01/02/03  | PR 1 | `npx vitest run src/shared/ui/Skeleton`               | `npm run type-check:strict`; `npm run analyze:dead-code`; full vitest 45-gate | `git revert <commit>`; the 5 authorized assertion updates revert with it                  |
| 2    | Polymorphic + hook: SKL-04/05        | PR 2 | `npx vitest run src/shared/ui/Skeleton`               | full vitest 45-gate; `npm run storybook:test` (13 plays); 10 consumer suites  | `git revert <commit>`; `as` additive drop; hook reverts to inline memo (identical values) |
| 3    | Hardening + docs + verify: SKL-06/07 | PR 3 | `npm run analyze:dead-code`; `npm run storybook:test` | full gate (type-check, lint, vitest, storybook)                               | revert commit; docs revert trivially (`docs/specs/*.md` untracked by git)                 |

Chain strategy: `feature-branch-chain` (user decision 2026-08-13) — one feature branch, PRs stacked on it, final squash merge to main.

## Tasks

| ID  | Req    | Batch  | Title                             | Files                                                                                                                            | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Acceptance                                                                                                                                                          | Deps    |
| --- | ------ | ------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --- | ---- | ----------- | ----------------------------------------- | --- |
| T1  | SKL-01 | 1      | RED: CSS-var animation assertions | `ui/Skeleton.test.tsx`                                                                                                           | Update the 5 authorized sites to jsdom `toHaveStyle` CSS-custom-property assertions: `:69` root `--skeleton-delay: 0.5s`, `:75` root `--skeleton-duration: 2s`, `:155-157` per-line stagger `--skeleton-delay` `0.2s/0.3s/0.4s` (rounded `Math.round((delay + index*0.1)*1000)/1000`), `:167` multi-line per-line `--skeleton-duration: 2.5s`; assert NO inline `animationDelay`/`animationDuration` remains on root/`.line`                                                                                                                                                                                                                                                                        | Assertions FAIL vs current inline animation props (`Skeleton.tsx:71-72, 94-95`) — RED                                                                               | —       |
| T2  | SKL-01 | 1      | Animation var wiring              | `ui/Skeleton.tsx`                                                                                                                | `singleLineStyle` (`:67-74`) → `{ width, height, [SKELETON_CONSTANTS.cssVariables.duration]: \`${duration}s\`, [cssVariables.delay]: \`${delay}s\` }`(consumes`constants.ts:48-51`— Decision 1, makes the constant live, no knip finding,`constants.ts` unchanged); per-line style (`:94-95`) → `{ [cssVariables.delay]: \`${lineDelay}s\`, [cssVariables.duration]: \`${duration}s\` }`so the`::after` shimmer honors duration/delay/stagger via CSS-var inheritance                                                                                                                                                                                                                               | T1 GREEN; 45-gate untouched (default path `1.5s`/`0s` byte-equivalent to SCSS fallbacks `Skeleton.module.scss:18`)                                                  | T1      |
| T3  | SKL-02 | 1      | Exports + guard removal           | `index.ts`, `ui/Skeleton.tsx`                                                                                                    | Drop `validateSkeletonProps` + `SKELETON_CONSTANTS`/`SKELETON_VARIANTS`/`SKELETON_DEFAULTS` from `index.ts` (`:4-5`); keep `Skeleton` + `SkeletonProps`/`SkeletonVariant`; internals keep direct-path imports (`Skeleton.tsx:7-8` already direct); remove redundant outer `NODE_ENV` guard (`:46-48`) — validator self-guards (`validateSkeletonProps.ts:17`)                                                                                                                                                                                                                                                                                                                                       | `type-check:strict` 0; `analyze:dead-code` — the 4 names absent                                                                                                     | T2      |
| T4  | SKL-03 | 1      | Reduced-motion source guard       | `ui/Skeleton.test.tsx`                                                                                                           | Replace the fake-matchMedia describe (`:340-386`, no-op `:384`) with a module-level disk-read source guard (Decision 2 — readFileSync PAR-09/SPR-04 pattern; `?raw` broken, `Paragraph.test.tsx:14-18`): slice-and-match the `@media (prefers-reduced-motion: reduce)` block (`Skeleton.module.scss:22-26`) asserting `animation: none` for the `.skeleton::after` shimmer (`:12-19`); keep static DOM asserts (`role="status"`); DELETE the mock                                                                                                                                                                                                                                                   | guard green; no `matchMedia` mock installed in the describe; no computed-style assertion attempted (jsdom cannot resolve stylesheet rules)                          | T3      |
| T5  | SKL-04 | 2      | RED: polymorphic tests            | `ui/Skeleton.polymorphic.test.tsx` (new)                                                                                         | Write failing tests: default `as='div'` render; `as="article"` + forwarded `title` + `data-as="article"`; custom component receives merged className + `width`; ref-per-`as` (default `HTMLDivElement`, `as="article"` element); `@ts-expect-error` probes — `<Skeleton as="div" href="/x">` rejected, `<Skeleton as="a" href="/x">` accepted                                                                                                                                                                                                                                                                                                                                                       | `as` prop invalid vs closed `SkeletonProps` → `type-check:strict` FAILS (RED); probes consumed after impl                                                           | —       |
| T6  | SKL-04 | 2      | Generic types                     | `model/types.ts`                                                                                                                 | `SkeletonOwnProps` (variant/width/height/lines/delay/duration/className) + `SkeletonProps<C extends ElementType = 'div'> = SkeletonOwnProps & Omit<ComponentPropsWithRef<C>, keyof SkeletonOwnProps \| 'as'> & { as?: C }` (existing `HTMLAttributes` surface flows back through the Omit merge — consumers unaffected) + `SkeletonComponent` type; hook types (`UseSkeletonParams`/`UseSkeletonReturn`)                                                                                                                                                                                                                                                                                            | `type-check:strict` compiles; default `C='div'` keeps div props                                                                                                     | T5      |
| T7  | SKL-04 | 2      | Component polymorphic + memo-cast | `ui/Skeleton.tsx`                                                                                                                | Divider memo-cast chain (`skeletonRef`/`SkeletonMemo`/`SkeletonComponent` + `displayName`); render `<Component ref={ref} className aria-label {...dataAttrs} {...restProps}>` in BOTH branches; `data-as` only when `typeof as === 'string'`; Decision 5 `dataAttrs` formula ready for T8                                                                                                                                                                                                                                                                                                                                                                                                           | T5 GREEN; 45-gate green (default `as='div'` byte-identical)                                                                                                         | T6      |
| T8  | SKL-05 | 2      | `useSkeleton` hook                | `lib/hooks/useSkeleton.ts` (new), `lib/hooks/useSkeleton.test.ts` (new), `ui/Skeleton.tsx`, `lib/utils/validateSkeletonProps.ts` | Move `skeletonClassName` (`:50`), `linesArray` `useMemo` (`:53-64`), `singleLineStyle` `useMemo` (SKL-01 vars), `lineStyle` fn, `effectiveAriaLabel` (`:43`), validator call (outer guard gone) into the hook — useDivider template (validator OUTSIDE `useMemo`, values inside); return `{ skeletonClassName, linesArray, singleLineStyle, lineStyle, effectiveAriaLabel, dataAttrs }`; thin component; `dataAttrs = { 'data-variant': variant, ...(lines > 1 && { 'data-lines': lines }), ...(typeof as === 'string' && { 'data-as': as }) }` (reproduces `:86`/`:114` exactly — Decision 5); validator signature narrows to `SkeletonOwnProps` (Decision 6 — all validated fields are own props) | 40 non-animation assertions pass UNCHANGED (behavioral-noop); hook unit tests green (className mapping, stagger values, vars, dataAttrs incl. `data-lines` formula) | T7, T3  |
| T9  | SKL-06 | 3      | Hardening (probes + attrs)        | `ui/Skeleton.test.tsx`, `ui/Skeleton.polymorphic.test.tsx`                                                                       | `:233-234` → `// @ts-expect-error` above typed `<Skeleton variant="invalid" />` (no cast — Decision 4); `:241-242` → clean `<Skeleton lines={0} />` + eslint-disable deleted (0 is type-VALID; a directive there would be an UNUSED diagnostic breaking `type-check:strict`) + separate `lines={'bad'}` probe; add `data-variant`/`data-lines` (multi + single-branch)/`data-as` attribute assertions (emitted today, never tested)                                                                                                                                                                                                                                                                 | `type-check:strict` consumes all probes (no unused directives); attribute asserts green                                                                             | T5, T8  |
| T10 | SKL-07 | 3      | Docs contract                     | `docs/specs/ui-kit-contract.md`                                                                                                  | Add `### Skeleton specifics` section (after existing component specifics): props contract (variant/width/height/lines/delay/duration), polymorphic `as` + refs, `useSkeleton` hook, a11y model (`role="status"`, `aria-busy`, `aria-label` `t('loading')`), animation-vars model (`--skeleton-duration`/`--skeleton-delay` consumed by the `::after` shimmer), 10 consumers, stories 13 / plays 13; inventory row `                                                                                                                                                                                                                                                                                 | Skeleton                                                                                                                                                            | Yes     | Yes | None | ` unchanged | diff review; consistent with SKL-01/04/05 | T9  |
| T11 | —      | verify | Final gate                        | (none)                                                                                                                           | `npm run type-check:strict` (0, probes consumed); `npm run lint` on touched files (0); `npx vitest run src/shared/ui/Skeleton` (40 unchanged + 5 updated + new ~15); `npm run storybook:test` (13 plays); `npm run analyze:dead-code` (4 removed names absent, `cssVariables` live, no new dead); 10 consumer suites green; commit scope = `src/` only                                                                                                                                                                                                                                                                                                                                              | all green; `git revert <unit-commit>` rehearsal per batch                                                                                                           | T1..T10 |

**Deviation note**: T1/T5 RED tests placed BEFORE impl (TDD, Link/Icon/Image precedent). T4 is a regression-guard suite against existing SCSS (`Skeleton.module.scss:22-26`) — inherently green, locks behavior (Spinner T7 precedent). Phasing follows the spec's Implementation Order (animation → exports → motion-test → polymorphic → hook → hardening → docs).

## Implementation Order

```
Phase 1 (PR 1)  T1 → T2 → T3 → T4        animation vars (RED) → wiring → exports/guard → reduced-motion source guard
Phase 2 (PR 2)  T5 → T6 → T7 → T8        polymorphic: RED tests → generic types → component memo-cast → useSkeleton hook
Phase 3 (PR 3)  T9 → T10                 hardening: probes + data-attrs → docs contract
Phase 4 (PR 3)  T11                      verify: type-check + lint + vitest + storybook + dead-code
```

Each phase = one revertible commit; whole change = chained PRs per Work Units (strategy `feature-branch-chain`, user decision 2026-08-13).

## Summary

| Phase                 | Tasks  | Focus                                                                                     | PR  |
| --------------------- | ------ | ----------------------------------------------------------------------------------------- | --- |
| Correctness + hygiene | T1–T4  | CSS-var animation wiring (RED first), exports/guard removal, reduced-motion source guard  | 1   |
| Polymorphic + hook    | T5–T8  | RED poly tests → generic types → Divider memo-cast → `useSkeleton` (behavioral-noop gate) | 2   |
| Hardening + docs      | T9–T10 | `@ts-expect-error` probes + data-attrs assertions, contract section                       | 3   |
| Verify                | T11    | full gate                                                                                 | 3   |

**Total ~500–650 changed lines** → 400-line budget risk: High → chained PRs recommended. Chain strategy `feature-branch-chain` (user decision 2026-08-13). ~6.75h core effort per spec.

## Result Contract

```json
{
  "status": "success",
  "executive_summary": "Created docs/specs/skeleton-improvement-tasks.md — 11 tasks (T1–T11) in 4 phases: TDD CSS-var animation wiring (T1 RED → T2 impl, SKL-01 authorized 5-site deviation), exports/guard cleanup (T3), reduced-motion disk-read source guard (T4, ?raw-broken workaround), polymorphic as (T5 RED → T6 types → T7 Divider memo-cast), useSkeleton hook extraction (T8, Decision 5 data-lines formula), hardening (T9 probes + attrs), docs contract (T10), full verify gate (T11).",
  "artifacts": [
    {
      "path": "docs/specs/skeleton-improvement-tasks.md",
      "type": "tasks",
      "summary": "11-task breakdown for SKL-01..07: T1 RED CSS-var assertions → T2 wiring (cssVariables consumed); T3 index/guard; T4 reduced-motion source guard; T5 RED polymorphic → T6 types → T7 memo-cast; T8 useSkeleton hook; T9 hardening probes/attrs; T10 docs; T11 final gate. Forecast: High 400-line risk, chained PRs Yes, strategy feature-branch-chain (user decision 2026-08-13)."
    }
  ],
  "next_recommended": "Launch sdd-apply",
  "risks": [
    "SKL-01 is an authorized deviation from the behavioral-noop gate — the 5 animation assertions must change (locked to :69/:75/:155-157/:167)",
    "Skeleton.test.tsx:241-242 lines={0} is type-valid — @ts-expect-error there would be an unused diagnostic (Decision 4: clean removal + lines={'bad'} probe)",
    "jsdom cannot resolve stylesheet animation — source guard (readFileSync) is the deterministic reduced-motion guarantee"
  ],
  "skill_resolution": {
    "skills_loaded": [],
    "skills_used": [],
    "skills_recommended": [
      "component-boilerplate (T2/T6/T7)",
      "test-generation (T1/T5/T9 suites)",
      "storybook-setup (13/13 plays gate)"
    ]
  }
}
```

**Exact task count**: 11 implementation tasks (T1–T11).
**Dependency chain**: T1 → T2 → T3 → T4; T5 → T6 → T7 → T8 (T8 also requires T3); T9 → T10 → T11 final gate (T1..T10).
