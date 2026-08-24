# Proposal: Icon Component Improvement

**Change**: icon-improvements
**Status**: Draft
**Date**: 2026-08-07
**Prior**: SDD explore (icon-improvements session)

---

## Intent

Upgrade `src/shared/ui/Icon/` (9 files, 5 stories, 100% plays, ~67 test assertions) from a non-polymorphic, closed-typed `<span>` to the in-repo Senior+ component standard. The root is currently `forwardRef<HTMLSpanElement, IconProps>` + `React.memo` — the only `shared/ui` component still lacking a generic polymorphic `component` prop and a self-guarded dev validator. Integration reality is thin: exactly **one** production consumer (`Link` external-icon), plus two spec/test-only touches, so a core-only refactor is low-risk and fully isolated.

## Scope

### In Scope

- Generic polymorphic `component` prop (`C extends ElementType = 'span'`) with element prop merging (`Omit<ComponentPropsWithRef<C>, keyof IconOwnProps | 'component'>`).
- Type-safe ref forwarding (`ForwardedRef<ComponentRef<C>>`) + Heading `memo`-cast. The a11y/keyboard path today assumes `<span role="button">` — resolution must re-derive `tabIndex`/`role`/`aria-pressed`/`handleKeyDown` per rendered element without changing default behavior.
- `useIcon` hook + `validateIconSize`/`validateIcon` (dev-only `NODE_ENV`-guarded) covering `size`, `color`, `strokeWidth`, `name`. Additive.
- Icon size resolution centralized in the existing `getSizeInPixels` (already the single transform path). No cross-slice churn.
- `@ts-expect-error` compile coverage: rejected props on a non-interactive `component`, ref type per element.

### Out of Scope

- Consumer adoption into Button/Input/Toast/Sidebar raw-icon sites (follow-up, mirroring `ProjectCard` precedent for Link).
- Cross-slice size-map harmonization (`Icon xl=32` vs `Button`/`Input xl=28`).
- Extra variants, `asChild`/Slot, plays on all stories.
- Named-only removal — already done (no default export).

## Approach

- **`model/types.ts`**: add `IconOwnProps` (current closed `IconProps` fields) + `IconProps<C extends ElementType = 'span'> = IconOwnProps & Omit<ComponentPropsWithRef<C>, keyof IconOwnProps | 'component'> & { component?: C }`.
- **`ui/Icon.tsx`**: re-type to generic `IconComponent` + Heading `memo`-cast (`ComponentRef<C>`); render `<Component ref={ref} ...>`. When `C` is `'span'` (default) use the existing interactive-a11y fork (`onClick`/`role`/`tabIndex`/`handleKeyDown`); for other elements forward `onClick`/`onKeyDown`/`role` but REMOVE the auto-`role="button"`/`tabIndex` lift (elements decide it, e.g. a real `<button>` does it), preserving exact current attributes of default `span`.
- **`lib/hooks/useIcon.ts`**: returns `{ iconClassName, iconStyle, dataAttrs, ariaProps, isInteractive }`; thin UI.
- **`lib/utils/validateIcon.ts`**: dev-warn on invalid `size` (numeric must be `> 0`), `color` (valid `IconColor` or valid CSS), `strokeWidth` (`VALID_STROKE_WIDTHS`), `name` (must be a component). Self-guarded `NODE_ENV === 'development'`.
- **Non-divergence**: for default `component='span'` the single `useMemo` path must emit byte-identical DOM.

## Affected Areas

| Area                                              | Impact   | Description                                 |
| ------------------------------------------------- | -------- | ------------------------------------------- |
| `src/shared/ui/Icon/model/types.ts`               | Modified | `IconOwnProps`/generic `IconProps<C>`       |
| `src/shared/ui/Icon/model/constants.ts`           | Modified | `getSizeInPixels` single-source (core)      |
| `src/shared/ui/Icon/ui/Icon.tsx`                  | Modified | `memo`-cast + `Component` (default `span`)  |
| `src/shared/ui/Icon/lib/hooks/useIcon.ts`         | New      | className/style/aria/data derivation        |
| `src/shared/ui/Icon/lib/utils/validateIcon.ts`    | New      | Self-guarded dev validator                  |
| `src/shared/ui/Icon/ui/Icon.polymorphic.test.tsx` | New      | polym/ref/`@ts-expect-error` coverage       |
| `docs/specs/ui-kit-contract.md`                   | Modified | Icon row: `component`, `useIcon`, validator |

## Consumer Impact

| Consumer                                                                 | Type       | Risk                                                  |
| ------------------------------------------------------------------------ | ---------- | ----------------------------------------------------- |
| `Link/ui/Link.tsx:138` (`<Icon name size color="inherit" decorative />`) | Prod       | None — no `component`, default `span`, byte-identical |
| `Link` model (`IconName` type-only imports)                              | Type       | None — public types preserved                         |
| `Tooltip.stories.tsx`, `PopoverIntegration.test.tsx`                     | Story/Test | None (`getByRole('img')` intact)                      |

## Risks

| Risk                                                          | Likelihood | Mitigation                                                                   |
| ------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| Generic + `React.memo` incompatibility                        | blocking   | Heading/Button/Paragraph `memo`-cast, copy in-repo                           |
| Ref-type widening breaks a consumer                           | Low        | grep: zero external ref use on `Icon`; TS-first                              |
| Polymorphic a11y fork changes `<span role="button">` behavior | Medium     | Keep default-span exact; add stories/plays for `component="button"` lift-off |
| `useIcon` refactor regression                                 | Low        | Behavioral-noop gate: all ~67 assertions + 5 plays pass UNCHANGED            |

## Rollback Plan

- Core-only change is additive — a `git revert` of the single PR restores the closed `<span>`; `component` prop is additive and trivially removed.
- Validator addition is dev-only (`NODE_ENV`) — no prod surface; removal is a drop.
- `getSizeInPixels` refactor is a same-value move (no visible change).

## Dependencies

- In-repo precedent copies only (Heading memo-cast, Section `useX` + validator, Button/Link `component`). No new packages.

## Success Criteria

- [ ] `type-check:strict` + `lint:strict` 0; no introduced warnings.
- [ ] All ~67 Icon test assertions + 5 storybook plays pass UNCHANGED (core behavioral-noop).
- [ ] `component="a"` renders the correct element; `ref.current` per `component`.
- [ ] `@ts-expect-error` compile probes consumed (invalid props rejected).
- [ ] `validateIconProps` warns in dev, silent in prod, for bad `size`/`color`/`strokeWidth`/`name`.
- [ ] `docs/specs/ui-kit-contract.md` `Icon` row updated.
- [ ] No consumer regression (`Link` etc. green).

## Recommendation + Effort

| Option                                     | Effort            | Recommendation            |
| ------------------------------------------ | ----------------- | ------------------------- |
| Polymorphic `component` + refs + memo-cast | ~4–5h             | **Yes — core DoD**        |
| `useIcon` hook + `validateIconProps`       | ~2.5h             | **Yes — core**            |
| Size-map harmonization (`xl=28` vs `32`)   | ~1–2h cross-slice | **Follow-up**             |
| a11y/keyboard hooks reuse                  | optional          | Keep inline, non-blocking |
| Consumer adoption                          | follow-up         | **Deferred**              |

**Total core: ~8–9h dev-time**, all additive, no behavior change.
