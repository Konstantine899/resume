# Proposal: Migrate raw `LucideIcon` consumers to `Icon` component

**Change**: icon-adoption
**Status**: Draft
**Date**: 2026-08-07
**Prior**: SDD explore (icon-adoption session)

---

## Intent

Convert ~94% of raw `lucide-react` renders in `src/` to the polymorphic `<Icon>` component (`name: LucideIcon`, `size`, `color`, `className`, `decorative`, `component`), preserving byte-identical DOM/visuals per call-site. Rationale: the only production consumer of `<Icon>` today is `Link` (external-icon, `Link.tsx:138`); every other site renders raw `LucideIcon` directly, bypassing sizing, color, data-attrs, validation, and a11y coordination.

## Scope

**In scope** (all verified as raw lucide in `src/`):

- Modal: `ModalCloseButton.tsx` (`<X size={20}>`), `ModalDrawer.tsx` (`<X size={20}>` hardcode)
- Toast: `Toast.tsx` type-icon `<Icon size={20}>` (TOAST_ICONS), close `<X size={16}>`, pause `<Pause size={12}>`
- Code: `CodeBlockHeader.tsx` Copy/Check `size={14}` via `ButtonWithIcon`
- Input: password Eye/EyeOff `size=16`; Search (`inferIconSize`); Email/Phone `size=18` hardcode
- Sidebar: Menu/X via `IconButton.icon`; `ToggleButton` ChevronRight; `NavItem` prop-injected `LucideIcon` (`navIcon` 20px); switches `Moon/Sun/Globe` via `leftIcon`; `Contact.tsx` Mail via `ContactCard.icon`

**Out of scope**: `xl` harmonization (Icon 32 vs Button/Input 28 — latent, unused, separate follow-up); `InputClearIcon` (hand-written SVG, not lucide); `entities/**`; `.test`/`.stories` fixtures unless migration requires touching them.

## Approach — Option A (site-per-site), recommended

**Decision: A (site-per-site), reject B (slot-once).** Verified from code: `Button`/`Input` conduits type their icon props as `React.ReactNode` (`icon?: React.ReactNode`, `leftIcon/rightIcon`), NOT `LucideIcon`; `inferIconSize` clones a `<ReactNode>` adding `size` only when absent. Option B would force a `LucideIcon`-typed API, breaking current spread-target ReactNode consumers/tests (`icon={<Mail/>}`). No conduit API change → narrow, revertible PRs.

Per-site migration pattern, byte-identity:

| Site                  | Replace                                | Migration                                                                | Identity                                                    |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Toast/Modal close (X) | `<X size={20}>`                        | `<Icon name={X} size={20} decorative>`                                   | `aria-hidden` merged; svg sized via inline `{width,height}` |
| Toast type-icon       | `<Icon/> size=20` in `aria-hidden` div | `<Icon name={typeIcon} size={20} decorative>`                            | div keeps `aria-hidden`; inner svg swap                     |
| Input eye/search/mail | `<Mail size={18}/>`                    | `<Icon name={…} size={18} decorative>` (parent span keeps `aria-hidden`) |
| NavItem/Sidebar nav   | `<Icon className=n>` on raw svg        | `<Icon name={…} size={20} className={n}>`                                | svg inline-size equals CSS width (close)                    |
| Switches/Toggle       | `<Moon className><aria-hidden>`        | `<Icon name={Moon} size={18} className decorative>`                      |

**Byte-identity rule (per site):** replace `size=N` scalar, set `decorative` when the current site already carries `aria-hidden` (aliases an inert icon), forward `className`. **Fork decision:** default `component='span'` renders a wrapper `<span>` + inner `<svg>`, whereas raw call sites render `<svg>` as root — existing tests use `getByRole('img')`/`querySelector('svg')` (verified `Icon.test`/`ModalCloseButton.test`), so a ONE-node span wrapper is structurally compatible, but fixtures asserting `.lucide-*` on the ROOT (e.g. `Link.test.tsx:165`, raw NavItem asserts) will need a `querySelector('svg').lucide` tweak. Flag via grep `.lucide-`/`getByRole('img')` in touched test files.

## Affected Areas

| Layer     | Files                                                                    |
| --------- | ------------------------------------------------------------------------ |
| shared/ui | Modal×2, Toast×1 (+constants), Code×1, Input×3 (+Input.tsx), Icon (none) |
| widgets   | Sidebar, MobileMenu, NavItem, NavButton, ToggleButton                    |
| features  | ThemeSwitch, LanguageSwitch, Contact                                     |

## Risks

| Risk                                                                 | Likelihood | Mitigation                                                                                |
| -------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Root `<svg>`→`<span>` breaks `.lucide-*`/`getByRole('img')` fixtures | Med        | Audit touched test queries; use `querySelector('svg')` where asserted; no behavior change |
| `decorative` vs `aria-hidden` mismatch                               | Low        | set `decorative` per site matching current aria-hidden                                    |
| size mismatch (e.g. 18 → `sm`=16)                                    | Med        | pass explicit `size={18}` scalar, no preset                                               |
| IconButton/Input width regressions via inherited CSS                 | Low        | forward same `className`; keep `flex-shrink:0`                                            |

## Rollback

Single commit per slice-pr (Modal/Toast, Code/Input, Sidebar, features). `git revert <site-commit>` snaps to raw lucide; `<Icon>` import additive. fallback `decorative`→raw unchanged pattern.

## Recommendation + Effort

| Option                                  | Effort           | Rec            |
| --------------------------------------- | ---------------- | -------------- |
| **A — site-per-site (17 files)**        | ~4–6h            | **Yes (core)** |
| B — conduit slot API `icon: LucideIcon` | ~6–8h (breaking) | No             |
| xl-harmonization                        | follow-up        | defer          |

**Total: ~5h**, additive, per-site revertible, ~94% Icon coverage in `src/`.

**Next step:** `sdd-spec` for `icon-adoption`.
