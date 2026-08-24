# Tasks: Icon Component Improvement

**Change**: icon-improvements · **Date**: 2026-08-07
**Source**: `icon-improvement-design.md` (decisions 1–10) + `icon-improvement-spec.md` (ICR-01..08)
**Gate**: ~67 existing Icon test assertions + 5 storybook plays UNCHANGED. Link prod consumer (`Link.tsx:138`) byte-identical.

## Review Workload Forecast

| Field                   | Value                                              |
| ----------------------- | -------------------------------------------------- |
| Estimated changed lines | ~500–650 (`additions + deletions`)                 |
| 400-line budget risk    | Medium–High                                        |
| Chained PRs recommended | Yes                                                |
| Suggested split         | PR 1 core → PR 2 hook+validator → PR 3 docs+verify |
| Delivery strategy       | ask-on-risk                                        |
| Chain strategy          | pending (ask user)                                 |

```text
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium-High
```

### Suggested Work Units

| Unit | Goal                                                                | PR   | Focused test command                                          | Runtime harness                                      | Rollback                                    |
| ---- | ------------------------------------------------------------------- | ---- | ------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| 1    | Core: generic types + memo-cast + a11y fork + RED polymorphic tests | PR 1 | `npx vitest run src/shared/ui/Icon`                           | `npm run type-check:strict` (RED→GREEN)              | revert core commit; component prop additive |
| 2    | `useIcon` + `validateIconProps` + hook tests + index exports        | PR 2 | `npx vitest run src/shared/ui/Icon lib/hooks/useIcon.test.ts` | `npm run type-check:strict`; full vitest (noop gate) | revert commit; hook/validator internal      |
| 3    | Docs + final verification                                           | PR 3 | `npm run storybook:test`; `npm run analyze:dead-code`         | Storybook screenshot diff Link site                  | revert docs commit                          |

Chain strategy: `pending` — ask user at apply (stacked-to-main vs feature-branch-chain).

## Tasks

| ID     | Req       | Batch  | Title                                   | Files                                       | Work                                                                                                                                                                                                                                                                        | Acceptance                                                                                                                                                                                       | Deps   |
| ------ | --------- | ------ | --------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| [x] T1 | ICR-06/07 | 1      | RED polymorphic tests                   | `ui/Icon.polymorphic.test.tsx` (new)        | Write failing tests: polymorphic render (`a`/span/custom comp + element props ×4), ref-per-`component` (×2–3: `HTMLAnchorElement`, custom), `@ts-expect-error` probes (`component="span" href`; anchor-only attr on custom comp)                                            | `component` is INVALID against closed `IconProps` → `type-check:strict` FAILS (RED); probes consumed on impl                                                                                     | —      |
| [x] T2 | ICR-01    | 1      | `IconOwnProps` + generic `IconProps<C>` | `model/types.ts`                            | Add `IconOwnProps` (drop `onClick` to `MouseEvent<HTMLElement>`, keep economist fields); `IconProps<C extends ElementType='span'> = IconOwnProps & Omit<ComponentPropsWithRef<C>, keyof IconOwnProps 'component'> & { component?: C }`; hook/validator types per Decision 1 | `type-check:strict` compiles; default `IconProps` = span props                                                                                                                                   | T1     |
| [x] T3 | ICR-02    | 1      | Memo-cast + `<Component ref>`           | `ui/Icon.tsx`                               | `IconComponent` type + `IconImpl<C>` + `forwardRef` non-generic cast + `memo` cast (Link pattern verbatim, default `'span'`); render `<Component ref={ref} ...>` replacing hardcoded `<span>`                                                                               | T1 polymorphic + ref tests GREEN; noop gate                                                                                                                                                      | T2     |
| [x] T4 | ICR-03    | 1      | a11y/keyboard fork                      | `ui/Icon.tsx`                               | `Component === 'span'` → EXACT current JSX (role/tabIndex/aria-pressed/handleKeyDown/data-testid); non-span → forward `onClick`/`onKeyDown`/`role`/`tabIndex` via `restProps`, NO auto `role="button"`/`tabIndex`, NO `handleKeyDown` lift, NO `data-testid`                | default span tests unchanged green; `component="button"` lift-off test green (no injected role/tabIndex); no `data-testid` outside span                                                          | T3     |
| T5     | ICR-04    | 2      | `useIcon` hook                          | `lib/hooks/useIcon.ts` (new), `ui/Icon.tsx` | Single `useMemo` returning `{ iconClassName, iconStyle, dataAttrs, ariaProps, isInteractive }`; `data-interactive` = `String(isInteractive)`; `data-as` only when string component; thin component delegate                                                                 | ~67 assertions + 5 plays pass UNCHANGED (behavioral-noop gate)                                                                                                                                   | T4     |
| T6     | ICR-05    | 2      | `validateIconProps`                     | `lib/utils/validateIconProps.ts` (new)      | Self-guarded `if (process.env.NODE_ENV !== 'development') return;`; consume `ICON_CONSTANTS.VALID_*`; warn on invalid size/color/starWidth/name; non-throwing                                                                                                               | dev-warns on each invalid case; silent in prod                                                                                                                                                   | T5     |
| T7     | ICR-07    | 2      | `useIcon.test.ts`                       | `lib/hooks/useIcon.test.ts` (new)           | 4–5 tests: iconClassName mapping, iconStyle px/var, `dataAttrs` incl `'data-interactive':'false'`, dev-warn/no-warn                                                                                                                                                         | all hook assertions green without rendering                                                                                                                                                      | T5     |
| T8     | ICR-05    | 2      | index exports                           | `index.ts`                                  | Add `export { useIcon }` + generic `IconProps` type; keep getters/constants/Icon; `validateIconProps` internal-only                                                                                                                                                         | `analyze:dead-code` no new names; validator NOT public                                                                                                                                           | T5     |
| T9     | ICR-08    | 3      | Docs refresh                            | `docs/specs/ui-kit-contract.md`             | Icon row: `component` prop, `useIcon` hook, `validateIconProps`                                                                                                                                                                                                             | diff review; row accurate                                                                                                                                                                        | T8     |
| T10    | —         | verify | Final verification                      | (none)                                      | Full gate + Link screenshot diff                                                                                                                                                                                                                                            | `npm run type-check:strict`; `npm run lint:strict` (0); `npx vitest run src/shared/ui/Icon`; `npm run storybook:test` (5 plays); `npm run analyze:dead-code`; Link `Link.tsx:138` byte-identical | T1..T9 |

**Deviation note**: T1 (RED tests) placed BEFORE T2 (types) per TDD, honoring tests-first over batched listing order, mirroring Link T2.

## Implementation Order

Batch 1 core: T1→T4 (RED tests → types → memo-cast → a11y fork). Batch 2 hook+validator: T5→T8 (useIcon → validateIconProps → hook tests → index exports). Batch 3 docs+verify: T9→T10 (docs → full verify).

Rollback per unit surgical (`git revert <unit-commit>`). Each batch = one chained PR per Work Units above.
