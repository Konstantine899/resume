# Proposal: Spinner Improvements

**Change**: spinner-improvements
**Status**: Draft
**Date**: 2026-08-13
**Prior**: SDD explore (spinner-improvements session — verified, not hypotheses)

> **Scope note**: the a11y model (`role="status"`/`aria-busy`/`aria-live="polite"`), dead-code removal (`validateSpinnerProps`, `useEffect`, `SPINNER_CONSTANTS`), `speedMap`/`thicknessMap`, and the simplified `useMemo` ALREADY landed (commits `417596d`, `4fff67f`). This proposal covers ONLY the remainder.

---

## Intent

Close the last gaps between `src/shared/ui/Spinner/` (7 files, 237-line test suite, 570-line stories file) and the in-repo Senior+ standard: 100% Storybook play coverage on a deduplicated story set, working Controls, a `delay` prop that prevents flash-of-spinner on fast operations (Ant Design pattern), a meaningful `prefers-reduced-motion` test, and two CSS-native alias props (Chakra v3 style). No consumer API breaks: 5 consumers (ButtonLoader, Toast, Input, Textarea, Image) import `{ Spinner }` with current props.

## Scope

### In Scope

- **C3** — Stories rework: move `ThemeContainer` into a meta `decorators` entry; simple stories become args-based (Controls/autodocs work); size/color/speed tables stay composite renders.
- **C2** — Play functions on **all** stories (2/22 today → 18/18 after consolidation).
- **M4** — `delay?: number` prop: nothing rendered (no `role="status"` announcement, no visual) until `delay` ms elapse.
- **M5** — Real reduced-motion test: `@media (prefers-reduced-motion: reduce) { animation: none }` (SCSS:162-168) currently untested; current tests only mock `matchMedia` and assert render.
- **O2** — `ButtonLoaderIntegration` story: `<Spinner size="sm" color="secondary">` inside a loading Button (real consumer pattern, ButtonLoader.tsx:45).
- **O3** — Numeric size override: `size?: SpinnerSize | number` → `--spinner-size: Npx` (Chakra-style).
- **O4** — CSS-native aliases: `animationDuration?: SpinnerSpeed` (→ `--spinner-speed`), `borderWidth?: SpinnerThickness` (→ `--spinner-thickness`).
- Docs: refresh the `ui-kit-contract.md` Spinner row (story/play counts).

### Out of Scope

- C1/M1/M2/M3/M6/O1 — already done (`417596d`, `4fff67f`).
- Consumer migration (ButtonLoader/Toast/Input/Textarea/Image) — nothing changes for them.
- Variant/animation redesign; `prefers-reduced-motion` runtime JS (CSS-only handling is correct).

## Decision: Consolidate 22 → 18 stories (recommended)

| Option                                | Pros                                                                                                                                                                                    | Cons                                                                                                                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A: plays on all 22**                | zero deletion risk; per-size doc links                                                                                                                                                  | 5 single-size stories (Small/Medium/Large/ExtraLarge/DoubleExtraLarge) are 100% redundant with `AllSizes`; ~20 near-identical trivial plays (assert one `data-size`); more surface, no new information |
| **B: consolidate → 18** (recommended) | kills redundancy; composite plays (AllSizes loop over 6 sizes, ThemeComparison over 2 themes) deliver the same coverage in ~10 plays; matches Button `AllVariants`/`AllSizes` precedent | 5 story URLs disappear; slightly bigger diff                                                                                                                                                           |

**Recommendation: B.** 22 − 5 redundant size stories + 1 new `ButtonLoaderIntegration` = 18. After C3, Controls make every story explorable, so single-size stories lose their last justification; composite plays give argument-equivalent coverage with half the play functions. Individual color stories (Primary/Secondary/Accent/Orange) stay — they double as args-driven demos.

## Approach

1. **C3**: add `decorators: [(Story) => <ThemeContainer><Story/></ThemeContainer>]` to meta; convert simple stories to `{ args: {...} }`; keep `render` for composites (sizes, variants, theme, speed/thickness/track tables).
2. **C2**: play per story — simple stories assert `role="status"`, `aria-busy`, `data-*`; composites loop their option sets; `ReducedMotion` play asserts static DOM only (CSS motion is M5's domain).
3. **M4**: `delay` via mount-delay (AntD semantic — invisible AND silent until elapsed). Reintroduces a minimal effect + timer (M1 removed the old `useEffect`; this one is intentional and must clean up on unmount). Tests with fake timers: no `role="status"` before `delay`, present after `vi.advanceTimersByTime(delay)`.
4. **M5 (jsdom-aware)**: jsdom's `getComputedStyle` does NOT resolve stylesheet rules, so "computed `animation: none`" is untestable in vitest. Honest test: (a) keep the `matchMedia('(prefers-reduced-motion: reduce)')` registration assertion (a11y contract), and (b) add a source-level guard test that reads `Spinner.module.scss` and asserts the reduced-motion block covers `.spinnerCircle`/`.outerRing`/`.innerRing` with `animation: none` — a deterministic regression guard. Browser-level verification stays out (one CSS rule doesn't justify Playwright).
5. **O3**: `typeof size === 'number'` → inline `--spinner-size: ${size}px`, skip the preset class (`styles[size]` guarded). Preset path byte-identical.
6. **O4**: both aliases write the same CSS vars via `speedMap`/`thicknessMap`; explicit `speed`/`thickness` win on conflict (documented); no SCSS change.

## Affected Areas

| Area                                           | Impact   | Description                                                                         |
| ---------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `src/shared/ui/Spinner/model/types.ts`         | Modified | `size?: SpinnerSize \| number`; +`delay`, `animationDuration`, `borderWidth`        |
| `src/shared/ui/Spinner/ui/Spinner.tsx`         | Modified | delay timer; numeric size var; alias var wiring                                     |
| `src/shared/ui/Spinner/ui/Spinner.stories.tsx` | Modified | 22 → 18 stories, decorators, args, plays                                            |
| `src/shared/ui/Spinner/ui/Spinner.test.tsx`    | Modified | +delay describe, +M5 block, +alias/numeric-size tests; existing 237 lines unchanged |
| `docs/specs/ui-kit-contract.md`                | Modified | Spinner row: stories 18, plays 18                                                   |

## Consumer Impact

| Consumer                                    | Impact                                                              |
| ------------------------------------------- | ------------------------------------------------------------------- |
| ButtonLoader, Toast, Input, Textarea, Image | None — additive props only; presets byte-identical; no prop renamed |

## Risks

| Risk                                            | Mitigation                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| jsdom can't compute stylesheet `animation` (M5) | Source-level guard + matchMedia registration assertion; browser test rejected as overkill |
| `delay` reintroduces an effect (M1 removed one) | Intentional, single timer, cleanup on unmount, fake-timer tests                           |
| Story consolidation removes 5 URLs              | Docs note; revert is a restore of the deleted story objects                               |
| O3 `styles[size]` typing with `number`          | `typeof` guard; `type-check:strict` gate                                                  |
| O4 dual-prop conflict ambiguity                 | Documented precedence: explicit `speed`/`thickness` win                                   |

## Rollback Plan

- Per-concern commits (stories → delay → tests → aliases → docs); `git revert <commit>` per concern.
- M4/O3/O4 are additive props — removal is a drop; existing preset tests unchanged (behavioral-noop).
- Story consolidation reverts to the 22-story file intact.

## Dependencies

- In-repo only: ButtonLoader consumer pattern (ButtonLoader.tsx:45), Link/Button play precedents, Ant Design `delay` semantics. No new packages, no Playwright.

## Success Criteria

- [ ] `type-check:strict` + `lint` 0; full vitest green; existing 237-line test suite assertions UNCHANGED
- [ ] `npm run storybook:test` — 18 stories, 18 passing plays
- [ ] Composites loop options: AllSizes (6), AllVariants (2), ThemeComparison (2), speed/thickness/track tables (3 each)
- [ ] `delay`: nothing before timer, `role="status"` after, timer cleaned up on unmount
- [ ] M5: source guard asserts `animation: none` for all 3 motion classes; matchMedia query registration asserted
- [ ] `<Spinner size={48}>` → `--spinner-size: 48px`; presets unchanged
- [ ] `animationDuration`/`borderWidth` set the same vars as `speed`/`thickness`; precedence documented
- [ ] `ui-kit-contract.md` Spinner row: stories 18, plays 18

## Recommendation + Effort

| Item                                                   | Effort | Recommendation                     |
| ------------------------------------------------------ | ------ | ---------------------------------- |
| C3 stories rework (decorator, args, consolidate 22→18) | 2h     | **Yes — core**                     |
| C2 plays on all 18                                     | 2.5h   | **Yes — core**                     |
| M4 `delay` prop                                        | 1h     | **Yes**                            |
| M5 reduced-motion test (jsdom-aware)                   | 0.5h   | **Yes**                            |
| O2 ButtonLoader integration story                      | 0.5h   | **Yes**                            |
| O3 numeric size                                        | 0.5h   | **Yes** (cheap, additive)          |
| O4 CSS-native aliases                                  | 0.5h   | **Yes** (matches Chakra v3; cheap) |
| Docs (ui-kit-contract row)                             | 0.25h  | —                                  |

**Total: ~7.5h**, single-PR-sized, additive-safe, per-concern revertible.

**Next step:** `sdd-spec` for `spinner-improvements`.
