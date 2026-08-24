# Tasks: Spinner Component Improvement

**Change**: spinner-improvements · **Date**: 2026-08-13
**Source**: `spinner-improvement-spec.md` (SPR-01..08) + `spinner-improvement-design.md` (decisions 1–7)
**Gate**: 237-line `Spinner.test.tsx` (24 `it()` blocks) passes UNCHANGED (behavioral-noop). 5 consumers (ButtonLoader, Toast, Input, Textarea, Image) stay green. 0 new files, 0 deleted.

## Review Workload Forecast

| Field                   | Value                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| Estimated changed lines | ~500–700 (`additions + deletions`)                                     |
| 400-line budget risk    | High                                                                   |
| Chained PRs recommended | Yes                                                                    |
| Suggested split         | PR 1 props → PR 2 delay+motion → PR 3 stories+plays → PR 4 docs+verify |
| Delivery strategy       | ask-on-risk                                                            |
| Chain strategy          | pending (ask user)                                                     |

```text
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal                                                               | PR   | Focused test command                                 | Runtime harness                                                     | Rollback                                                      |
| ---- | ------------------------------------------------------------------ | ---- | ---------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1    | Props: SPR-06/07 (types + useMemo merge + typeof guard, RED-first) | PR 1 | `npx vitest run src/shared/ui/Spinner`               | `npm run type-check:strict` (probes consumed); full vitest 237-gate | `git revert <commit>`; types/Spinner.tsx single-file surgical |
| 2    | Delay SPR-03 + reduced-motion SPR-04                               | PR 2 | `npx vitest run src/shared/ui/Spinner` (fake timers) | full vitest 237-gate; `npm run analyze:dead-code`                   | `git revert <commit>`; additive prop drop, tests additive     |
| 3    | Stories SPR-01/02/05 (22→18, args, plays)                          | PR 3 | `npm run storybook:test`                             | Storybook 18/18 + screenshot diff                                   | `git revert <commit>`; restore of 5 deleted story objects     |
| 4    | Docs SPR-08 + final verify                                         | PR 4 | `npm run analyze:dead-code`                          | full gate (type-check, lint, vitest, storybook)                     | docs revert trivially (`docs/specs/*.md` untracked by git)    |

Chain strategy: `pending` — ask user at apply (stacked-to-main vs feature-branch-chain).

## Tasks

| ID      | Req       | Batch | Title                           | Files                           | Work                                                                                                                                                                                                                                                                                                                                                                                                                     | Acceptance                                                                     | Deps    |
| ------- | --------- | ----- | ------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------- |
| [x] T1  | SPR-06/07 | 1     | RED: numeric size + alias tests | `ui/Spinner.test.tsx`           | Append describe blocks: `size={48}` → `--spinner-size: 48px`, no preset class, NO `data-size`; preset byte-identical; `animationDuration="fast"` → same `--spinner-speed` as `speed`; `borderWidth="thick"` → same `--spinner-thickness`; canonical-wins (`speed="slow" animationDuration="fast"` → 1.2s); double-ring alias pair; 2 `@ts-expect-error` probes (`size="huge"`, invalid alias value)                      | FAILS vs current closed typing + probes unused under `type-check:strict` — RED | —       |
| [x] T2  | SPR-06/07 | 1     | Widen types                     | `model/types.ts`                | `size?: SpinnerSize \| number`; add `animationDuration?: SpinnerSpeed`, `borderWidth?: SpinnerThickness`                                                                                                                                                                                                                                                                                                                 | `type-check:strict` compiles                                                   | T1      |
| [x] T3  | SPR-06/07 | 1     | useMemo merge + typeof guard    | `ui/Spinner.tsx`                | In existing single useMemo: `resolvedSpeed = speed ?? animationDuration`, `resolvedThickness = thickness ?? borderWidth` (same vars via speedMap/thicknessMap incl. double-ring pair); numeric size → `--spinner-size: ${size}px`, `styles[size]` typeof-guarded (classNames filters undefined); `data-size` string-only; `data-speed`/`data-thickness` canonical-only                                                   | T1 GREEN; 237-gate untouched                                                   | T2      |
| [x] T4  | SPR-03    | 2     | RED: delay tests                | `ui/Spinner.test.tsx`           | Fake-timer describe: nothing before delay (`queryByRole('status')` null, empty container); appears after `act(() => vi.advanceTimersByTime(300))` with aria-busy; unmount cancels (`clearTimeout` spy, no act/setState warning); `delay={0}` immediate; no-delay byte-identical                                                                                                                                          | All FAIL vs current (no delay) — RED                                           | —       |
| [x] T5  | SPR-03    | 2     | delay type                      | `model/types.ts`                | Add `delay?: number` (ms) to `SpinnerProps`                                                                                                                                                                                                                                                                                                                                                                              | `type-check:strict` passes                                                     | T4      |
| [x] T6  | SPR-03    | 2     | delay impl                      | `ui/Spinner.tsx`                | `useState(() => delay === undefined \|\| delay === 0)`; single intentional `useEffect([delay])` with `window.setTimeout(() => setVisible(true), delay)` + `return () => window.clearTimeout(timer)`; `if (!visible) return null` AFTER all hooks; no-prop path timer-free & byte-identical                                                                                                                               | T4 GREEN; 237-gate green                                                       | T5      |
| [x] T7  | SPR-04    | 3     | Reduced-motion tests            | `ui/Spinner.test.tsx`           | (a) source-guard: `readFileSync(new URL('./Spinner.module.scss', import.meta.url), 'utf-8')` (PAR-09 pattern; `?raw` broken in vitest) asserts the reduce block (SCSS:162) covers `.spinnerCircle`/`.outerRing`/`.innerRing` with `animation: none`; (b) sharpened matchMedia registration assert (query `(prefers-reduced-motion: reduce)`) + DOM contract (role/data attrs); NO computed-style assertion (jsdom limit) | both blocks green; existing matchMedia test (`:196`) re-runs fine              | T3, T6  |
| [x] T8  | SPR-01/05 | 4     | Stories rework 22→18            | `ui/Spinner.stories.tsx`        | `ThemeContainer` → `meta.decorators`; 11 simple stories → args objects; 6 composites keep custom render; DELETE 5 single-size stories (`:167-199`); ADD `ButtonLoaderIntegration` (`<Button loading loadingVariant="spinner">`, Spinner sm/secondary per ButtonLoader.tsx:45)                                                                                                                                            | 18 exported (count verified); 5 removed absent                                 | —       |
| [x] T9  | SPR-02    | 4     | 18 play functions               | `ui/Spinner.stories.tsx`        | `play` via `@storybook/test` `within`/`expect`, sync only: simple stories assert `role="status"` + `aria-busy="true"` + story `data-*`; composites loop option sets (AllSizes 6, AllVariants 2, ThemeComparison 2, ThicknessOptions/DoubleRingSpeed/WithTrackColor 3 each); ReducedMotion DOM-only; ButtonLoaderIntegration asserts `data-size="sm"`/`data-color="secondary"` inside button                              | `npm run storybook:test` — 18/18 green                                         | T8      |
| [x] T10 | SPR-08    | 5     | Docs contract                   | `docs/specs/ui-kit-contract.md` | `### Spinner specifics` section (after existing specifics): stories 18 / plays 18, new props (`delay`, `animationDuration`, `borderWidth`, numeric `size`), a11y model (`role="status"`, `aria-busy`, `aria-live="polite"`, `t('loading')`), 5 consumers; inventory row unchanged                                                                                                                                        | diff review; consistent with SPR-01/02/03/06/07                                | T9      |
| [x] T11 | —         | 6     | Final gate                      | (none)                          | `npm run type-check:strict` (0, probes consumed); `npm run lint` on touched files (0); `npx vitest run src/shared/ui/Spinner` (237 + ~12 new); `npm run storybook:test` (18 plays); `npm run analyze:dead-code` (no new dead names); 5 consumer suites green; commit scope = `src/` only                                                                                                                                 | all green; `git revert <unit-commit>` rehearsal per batch                      | T1..T10 |

**Deviation note**: T1/T4 RED tests placed BEFORE impl (TDD, Link/Icon/Image precedent). T7 is a regression-guard suite against existing SCSS (`:162-168`) — inherently green, locks behavior. Phasing follows the session instruction order (props → delay/motion → stories → docs), not the spec's listing order.

## Implementation Order

```
Phase 1 (PR 1)  T1 → T2 → T3          props: RED size/alias tests → types → useMemo merge + typeof guard
Phase 2 (PR 2)  T4 → T5 → T6          delay: RED fake-timer tests → type → single effect + null-return
Phase 3 (PR 2)  T7                    reduced-motion: source-guard (disk read) + matchMedia contract
Phase 4 (PR 3)  T8 → T9               stories: decorators/args/22→18 + ButtonLoaderIntegration → 18 plays
Phase 5 (PR 4)  T10                   docs: ui-kit-contract.md Spinner specifics section
Phase 6 (PR 4)  T11                   verify: type-check + lint + vitest + storybook:test + dead-code
```

Each phase = one revertible commit; whole change = chained PRs per Work Units (strategy `pending`, ask user at apply).

## Summary

| Phase          | Tasks   | Focus                                                         | PR  |
| -------------- | ------- | ------------------------------------------------------------- | --- |
| Props          | T1–T3   | RED size/alias tests → types → useMemo merge + typeof guard   | 1   |
| Delay + motion | T4–T7   | delay effect (fake timers) + reduced-motion guard             | 2   |
| Stories        | T8–T9   | 22→18 args-based stories + ButtonLoaderIntegration + 18 plays | 3   |
| Docs + verify  | T10–T11 | contract section + full gate                                  | 4   |

**Total ~500–700 changed lines** → 400-line budget risk: High → chained PRs recommended. Chain strategy `pending` — ask user at apply (stacked-to-main vs feature-branch-chain). ~7.5h core effort per spec.

## Result Contract

```json
{
  "status": "success",
  "executive_summary": "Created docs/specs/spinner-improvement-tasks.md — 11 tasks (T1–T11) in 6 phases: TDD props (RED size/alias → types → useMemo merge), delay effect with fake-timer tests, reduced-motion source-guard (readFileSync, ?raw-broken workaround), stories 22→18 with 18 plays, docs contract section, full verify gate.",
  "artifacts": [
    {
      "path": "docs/specs/spinner-improvement-tasks.md",
      "type": "tasks",
      "summary": "11-task breakdown for SPR-01..08: T1 RED numeric-size/alias/precedence tests → T2 types → T3 useMemo merge + typeof guard; T4 RED delay tests → T5 delay type → T6 single useEffect + null-return; T7 reduced-motion source-guard + matchMedia contract; T8 stories rework 22→18 (decorators/args/ButtonLoaderIntegration); T9 18 plays; T10 docs; T11 final gate. Forecast: High 400-line risk, chained PRs Yes, strategy pending (ask user)."
    }
  ],
  "next_recommended": "Launch sdd-apply (ask chain strategy first)",
  "risks": [
    "Story consolidation deletes 5 story URLs (revert = restore of deleted objects)",
    "delay reintroduces an intentional effect — single timer + clearTimeout cleanup, fake-timer tests guard it",
    "jsdom cannot resolve stylesheet animation — source-guard is the deterministic reduced-motion guarantee"
  ],
  "skill_resolution": {
    "skills_loaded": [],
    "skills_used": ["sdd-tasks"],
    "skills_recommended": [
      "test-generation (T1/T4/T7 suites)",
      "storybook-setup (T8/T9 stories+plays)"
    ]
  }
}
```

**Exact task count**: 11 implementation tasks (T1–T11).
**Dependency chain**: T1 → T2 → T3; T4 → T5 → T6; T7 → (T3, T6); T8 → T9 → T10 → T11; T11 final gate (T1..T10).
