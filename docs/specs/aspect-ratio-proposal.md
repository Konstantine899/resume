# Proposal: Aspect Ratio

**Change**: aspect-ratio · **Status**: Draft · **Date**: 2026-08-09
**Prior**: SDD explore (aspect-ratio session)

## Intent

Introduce `src/shared/ui/AspectRatio/` — a standalone, Divider-parity `shared/ui` component that locks content into a fixed ratio via native CSS `aspect-ratio` (inline style from a hook), with a fill-layer `.content` (`position:absolute; inset:0`) so children match Radix/Chakra behavior. Today the codebase has zero ratio helpers: cards/images (Image, CardImage, Hero) hand-roll ratio layouts per consumer. The component standardizes ratio sizing, is jsdom-testable, needs no new packages, and mirrors the in-repo Senior+ standard already proven by Divider/Paragraph.

## Scope

**In Scope**

- 9-file Divider-parity slice: `index.ts`, `ui/AspectRatio.tsx` + `.module.scss` + `.stories.tsx` + `.test.tsx`, `model/types.ts`, `model/constants.ts`, `lib/hooks/useAspectRatio.ts`, `lib/utils/validateAspectRatioProps.ts`
- Polymorphic `as` (generic `C extends ElementType = 'div'`), `ComponentRef<C>` refs, memo-cast — Divider/Paragraph pattern (NOT `component`; that name was forced on Link/Icon by Slot/Tooltip conflicts only)
- Required `ratio: \`${number}/${number}\``prop with runtime`DEFAULT_RATIO` fallback; regex-validated, self-guarded dev-warn validator (internal-only — NOT re-exported from index; Container's public validator is the anti-pattern we do NOT copy)
- `useAspectRatio` hook returning inline `aspectRatio` value + `dataAttrs` + merged className; UI component stays thin
- CSS module: `.box` wrapper and `.content` fill-layer; plays on ratio/polymorphic stories

**Out of Scope**

- padding-top hack, legacy-browserslist/Vite-target plugins (native property is safe for jsdom + modern browsers)
- ratio tokens/mixins in `shared/styles` (none exist; keep values inline)
- consumer adoption (zero real consumers; Image-composition path documented only, not wired)
- dead-code/knip runs; any deleted default-export cleanup — nothing to delete (new slice, named-only from birth)

## Approach

- **Ratio typed**: `export type AspectRatioString = `${number}/${number}`;`
- Hook: `useAspectRatio({ ratio, className, as })` → `{ style: { aspectRatio }, boxClassName, dataAttrs }`; reports `aspectRatio: ratio ?? DEFAULT_RATIO` and `data-aspect-ratio={ratio ?? DEFAULT_RATIO}` + `data-as` when string `as`.
- DOM: `<Component as="div" style={style} className={boxClassName} data-aspect-ratio="16/9" ...>`; children inside wrapper `.box` (aspect-ratio + overflow:hidden) + inner `.ratio-content` (position:absolute; inset:0).
- Validate: regex `/^\d+\/\d+$/`; dev-only `console.warn` with valid examples.

## Affected Areas

| Area                                                              | Impact                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/shared/ui/AspectRatio/` (9 files)                            | **New**                                                               |
| `docs/specs/ui-kit-contract.md` (inventory row + specifics-notes) | **Modified**                                                          |
| `docs/specs/aspect-ratio-spec.md` (follow-up)                     | **New** (spec phase)                                                  |
| `src/shared/ui/` consumers                                        | None — zero current consumers; doc-only composition pathway via Image |

## Consumer Impact

| Consumer                              | Impact                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `Image` / `CardImage` / Avatar family | None today; composition (`<AspectRatio><Image …/></AspectRatio>`) documented with `.ratio-content` fill rules |
| UI kit contract inventory             | Row added                                                                                                     |

## Risks

| Risk                                                  | Mitigation                                          |
| ----------------------------------------------------- | --------------------------------------------------- |
| Native `aspect-ratio` unsupported (very old browsers) | Low — no legacy-plugin requirement; baseline modern |

Keep short (proposal level; detailed risk table in spec):

| Risk                                                  | Mitigation                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| Native `aspect-ratio` unsupported (very old browsers) | jsdom `toHaveStyle` + modern baseline; no legacy-plugin requirement |
| Ratio prop invalid chars breaking CSS                 | regex validator + DEFAULT_RATIO fallback + dev-warn                 |
| `className` merge collision                           | `classNames` util, consumer className last                          |

## Rollback Plan

Single PR, fully additive: `git revert <commit>` removes the new slice; zero existing code touched, no schema change. Guard: one PR per concern (component → docs).

## Dependencies

- In-repo only: `classNames` (`src/shared/lib/utils`), React; precedent copies Divider/Paragraph. No new npm packages.
- Skills: `component-boilerplate` (scaffold), `test-generation` (unit), `storybook-setup` (stories + plays).

## Success Criteria

- [ ] `type-check:strict` + `lint` 0; `npx vitest run src/shared/ui/AspectRatio` green (~10–12 tests: ratio pass/fallback, `as` poly, refs, data-attrs, validator warn/no-warn)
- [ ] `toHaveStyle({ aspectRatio: '16 / 9' })` style assertions green (jsdom)
- [ ] `.box-ratio` + `.ratio-content` layers with `position:absolute; inset:0` per spec
- [ ] validator internal-only; media queries compiled correctly
- [ ] `analyze:dead-code` clean
- [ ] docs: `ui-kit-contract.md` row + `as-ratio` section updated
- [ ] `npm run storybook:test` plays pass (default, polymorphic, ratio-variants)

**Locked minor decisions** (this phase): `DEFAULT_RATIO = '16/9'`; data-attrs: `data-aspect-ratio`, `data-as` (string only); CSS classes: `aspectRatio_box` / `aspectRatio_ratioContent`; consumer `className` merges into the box wrapper (last wins).
