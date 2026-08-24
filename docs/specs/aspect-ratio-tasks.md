# Tasks: Aspect Ratio Component

**Change**: aspect-ratio · **Date**: 2026-08-09
**Source**: `aspect-ratio-spec.md` (AR-01..AR-09) + `aspect-ratio-design.md` (decisions 1–7)
**Gate**: brand-new slice — 9 files, zero existing consumers, zero prior tests; nothing in the current codebase changes.

## Review Workload Forecast

| Field                   | Value                                                         |
| ----------------------- | ------------------------------------------------------------- |
| Estimated changed lines | ~450–550 (`additions + deletions`, new slice + contract docs) |
| 400-line budget risk    | High                                                          |
| Chained PRs recommended | Yes (split optional — single fully-additive PR acceptable)    |
| Suggested split         | PR 1 core slice (T1–T6) → PR 2 docs + verify (T7–T8)          |
| Delivery strategy       | ask-on-risk                                                   |
| Chain strategy          | pending (ask user; default single-PR)                         |

```text
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High
```

**Context**: unlike prior component refactors, there is ZERO regression surface — no consumers, no existing tests. Split is a size-gate preference, not a risk requirement. Chain strategy asked at apply (default: single PR).

### Suggested Work Units

| Unit | Goal                                                                        | PR   | Focused test command                       | Runtime harness                                                                                   | Rollback                                                             |
| ---- | --------------------------------------------------------------------------- | ---- | ------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1    | Core slice: types + SCSS + RED tests + validator + hook + component + index | PR 1 | `npx vitest run src/shared/ui/AspectRatio` | `npm run type-check:strict`; `npx vitest run src/shared/ui/AspectRatio`; `npm run storybook:test` | `git revert <commit>` removes the slice; zero fallout (no consumers) |
| 2    | Docs + final verify                                                         | PR 2 | `npm run analyze:dead-code`                | `npm run storybook:test`; `npm run analyze:dead-code`                                             | revert docs commit; contract row/section trivially restored          |

## Tasks

| ID  | Req                      | Batch | Title                             | Files                                                                              | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Acceptance                                                                                                                                                                                        | Deps           |
| --- | ------------------------ | ----- | --------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| T1  | AR-01/03                 | 1     | Slice scaffold: types + constants | `model/types.ts` (new), `model/constants.ts` (new)                                 | `AspectRatioString = \`${number}/${number}\``, `AspectRatioOwnProps`({ratio required, className}),`AspectRatioBaseProps<C = 'div'>`/`AspectRatioProps<C>`/`AspectRatioComponent`(Divider/Paragraph pattern);`DEFAULT_RATIO = '16/9'`                                                                                                                                                                                                                                                                         | `npm run type-check:strict` passes with the new types                                                                                                                                             | —              |
| T2  | AR-06                    | 1     | SCSS module                       | `ui/AspectRatio.module.scss` (new)                                                 | `.box` (`position:relative; width:100%; overflow:hidden`, aspect-ratio inline from hook) + `.content` (`position:absolute; inset:0` fill layer)                                                                                                                                                                                                                                                                                                                                                              | SCSS compiles; `.content` holds position/inset per AR-06                                                                                                                                          | T1             |
| T3  | AR-01/02/03/05/09        | 2     | RED: initial unit tests           | `ui/AspectRatio.test.tsx` (new)                                                    | Write the ~12-test suite FIRST: `toHaveStyle({ aspectRatio: '4 / 3' })` + `DEFAULT_RATIO` fallback, polymorphic (default div / `as="article"` + `title` / custom comp), refs (default + per-`as`), `data-aspect-ratio` always + `data-as` string-only, className consumer-last, validator dev-warn / prod no-warn / regex reject                                                                                                                                                                             | Suite FAILS against nonexistent slice (`AspectRatio` import unresolved) — RED gate; `type-check` fails too (probes)                                                                               | T2             |
| T4  | AR-04/07                 | 2     | Validator + hook                  | `lib/utils/validateAspectRatioProps.ts` (new), `lib/hooks/useAspectRatio.ts` (new) | Validator: self-guarded `NODE_ENV !== 'development'`, regex `/^\d+\/\d+$/`, non-throwing dev.warn naming invalid ratio + `DEFAULT_RATIO`, internal-only (NOT exported from index). Hook: `validateAspectRatioProps` OUTSIDE `useMemo`; `useMemo` returns `{ ratioStyle: { aspectRatio: canonicalRatio(resolved) }` ('4 / 3' spaced), `boxClassName: classNames(styles.box, className)` consumer last, `dataAttrs: { 'data-aspect-ratio': raw resolved, ...(typeof as === 'string' && { 'data-as': as }) }` } | T3 validator tests green (dev-warn / prod no-warn); `npx vitest run src/shared/ui/AspectRatio/lib/hooks/useAspectRatio.test.ts` (if added) or slice tests for hook                                | T3 (RED-first) |
| T5  | AR-01/02/05 + decision 6 | 2     | Component + index                 | `ui/AspectRatio.tsx` (new), `index.ts` (new)                                       | Thin component: `AspectRatioImpl<C>` (Paragraph ref-as-prop + `ComponentRef<C>`), Divider memo-cast + `displayName`; render `<Component ref className style {...dataAttrs} ...rest>{children in .content}`; consumer `style` wins `{ ...ratioStyle, ...style }`. `index.ts` named exports: `AspectRatio`, `AspectRatioString`/`OwnProps`/`Props`/`Component`, `DEFAULT_RATIO`, `useAspectRatio` (validator NOT exported)                                                                                     | T3 suite GREEN (style, poly, refs, data-attrs, className merge); `npm run type-check:strict` + `npm run lint:strict` 0                                                                            | T4, T1         |
| T6  | AR-08                    | 2     | Stories + plays                   | `ui/AspectRatio.stories.tsx` (new)                                                 | 4 stories, `play` via `@storybook/test` `within`/`expect` (sync only, no timers): `Default` (16/9 attr + aspectRatio), `Polymorphic` (`as="article"`/`"section"` + `data-as`), `RatioVariants` (4/3, 1/1, 21/9 attrs), `ContentFill` (children inside `.content` fill layer); preview sizing (e.g. 480px) handled by CSS                                                                                                                                                                                     | `npm run storybook:test` — 4 plays green                                                                                                                                                          | T5             |
| T7  | — (docs deliverable)     | 4     | Docs contract                     | `docs/specs/ui-kit-contract.md`                                                    | AspectRatio row → 25th inventory entry (Stories Yes, Tests Yes, Sub-components None) + `### AspectRatio specifics` section AFTER Image specifics, BEFORE `## File structure`: props/ratio/DEFAULT_RATIO, data-attrs, `.box`/`.content` layers, hook, 4 stories + 4 plays, knip-clean exports                                                                                                                                                                                                                 | diff review: row + section present, consistent with T6                                                                                                                                            | T6             |
| T8  | — (verify)               | 5     | Final gate                        | (none)                                                                             | `git revert <unit-commit>` rehearsed per batch; screenshot N/A (new slice — no regression surface)                                                                                                                                                                                                                                                                                                                                                                                                           | `npm run type-check:strict`; `npm run lint:strict` (0); `npx vitest run src/shared/ui/AspectRatio` (~12 green); `npm run analyze:dead-code` (new slice clean); `npm run storybook:test` (4 plays) | T1..T7         |

**Deviation note**: T3 (RED tests) placed BEFORE T4/T5 (validator → hook → impl) per TDD — the suite is RED against the missing slice and turns GREEN only after T4+T5 land (Link/Icon/Image precedent). Validation probes (`@ts-expect-error` for rejected `href` on `as="div"`) also RED-gate T5's generic typing.

**Deviations no extra**: Threat matrix N/A (no routing/shell/subprocess boundaries — new presentational slice only, mirrors Divider). No `lint:styles` script exists in this repo — SCSS acceptance is compile + class presence.

## Implementation Order

```
Batch 1  T1 → T2        slice scaffold (types/constants → SCSS)
Batch 2  T3 → T5        RED tests → validator+hook → component+index (per TDD, T3 deps first T4)
Batch 3  T6             stories + plays
Batch 4  T7             docs contract (row + specifics)
Batch 5  T8             full gate verify
```

Each batch = one reverted commit (`git revert <unit-commit>`); PR 1 = T1–T6, PR 2 = T7–T8 (or single PR, default).

## Summary

| Batch      | Tasks | Focus                                          | PR   |
| ---------- | ----- | ---------------------------------------------- | ---- |
| Scaffold   | T1–T2 | types, constants, SCSS layers                  | PR 1 |
| RED + impl | T3–T5 | tests-first → hook/validator → component/index | PR 1 |
| Stories    | T6    | 4 stories + sync plays                         | PR 1 |
| Docs       | T7    | contract row + specifics                       | PR 2 |
| Verify     | T8    | full gate                                      | PR 2 |

**Total ~450–550 changed lines** → 400-line budget risk: High → chained split optional (single additive PR, zero consumers). Chain strategy `pending` — ask user at apply (default single-PR).

## Result Contract

```json
{
  "status": "success",
  "executive_summary": "Created docs/specs/aspect-ratio-tasks.md — 8 tasks (T1–T8) in 5 batches: scaffold → RED tests + impl → stories → docs → verify, mirroring image-improvements task structure.",
  "artifacts": [
    {
      "path": "docs/specs/aspect-ratio-tasks.md",
      "type": "tasks",
      "summary": "8-task breakdown for the new 9-file AspectRatio slice (AR-01..09): T1 scaffold types → T2 SCSS → T3 RED unit tests → T4 validator+hook → T5 component+index → T6 stories/plays → T7 docs contract → T8 full gate. Workload forecast with 2 optional PR splits; addition chain per dependency."
    }
  ],
  "next_recommended": "Launch sdd-apply-deepseek",
  "risks": [],
  "skill_resolution": {
    "skills_loaded": ["sdd-task"],
    "skills_used": [],
    "skills_recommended": [
      "component-boilerplate (scaffold T1/T5)",
      "test-generation (T3 suite)",
      "storybook-setup (T6 stories+plays)"
    ]
  }
}
```

**Exact task count**: 8 implementation tasks (T1–T8).
**Dependency chain**: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8, with two parallel feeds per T3 RED gate: T2 (resources) / T1 (types) — build and T3..T8 strictly sequential. T8 is the full-gate verification at PR 2.
