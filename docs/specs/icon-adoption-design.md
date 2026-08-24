# Design: Icon Adoption — Raw `LucideIcon` → `<Icon>` Migration

**Change**: icon-adoption · **Status**: Draft · **Date**: 2026-08-07
**Scope source**: `docs/specs/icon-adoption-spec.md` (ICON-AD-01..08)
**Non-breaking gate**: all existing consumer tests green UNCHANGED; **zero** `Icon`/`Button`/`Input` conduit API changes (Option A, site-per-site).

## Overview

Convert 17 raw `<LucideIcon>`/`<TOAST_ICONS[type]>` render sites in `Modal/Toast/Code/Input/Sidebar/widgets` + `ThemeSwitch/LanguageSwitch/Contact` to the polymorphic `<Icon name size color="inherit" decorative />`. DOM becomes **byte-compatible** (inert `<span class="icon">` wrapper around the current svg) — not byte-identical — which existing fixtures tolerate (they query descendants via `querySelector('svg')`, roles, or `data-testid`, never the root node). All targets are decorative: `decorative`, `color="inherit"` (`→currentColor`), explicit numeric `size`, one `decorative` per `<Icon>`; consumer `aria-hidden` wrappers are untouched.

**Key verified facts (this session):**

- `Icon` default `size='md'` (20px) and `color='foreground'` (`var(--foreground)`) are liabilities — IF a site omits `size` its svg becomes inline-20px, and IF it omits `color` it gets `var(--foreground)` instead of the consumer's `currentColor`. This is why **every site passes explicit `size` + `color="inherit"`** except `InputSearch` (see §6).
- **Button conduits inject size via `ICON_SIZE_MAP`** (Button md→20, lg→24). Any migrated icon inside `IconButton`/`ButtonWithIcon` that omits `size` will be force-sized by the conduit, and the inline svg style now **beats** the consumer SCSS box (e.g. `Sidebar .menuIcon` 20px CSS currently defeats the 24px attribute; after migration the inline 24px would win → regression). → **explicit `size` on every Button-conduit site, equal to the CSS box.**
- **Toast.tsx:114 declares a local `const Icon = TOAST_ICONS[type]`** which shadows the imported `Icon` component. Must rename local → `TypeIcon`.
- **ContactCard.module.scss `.iconWrapper svg, .icon { width:2.5rem; height:2.5rem }`** — inline Icon `size` now overrides the stylesheet `svg` rule (inline > stylesheet). Requires a 40px decision (see §7).
- `.icon` wrapper (`display:inline-flex; vertical-align:middle`) is inert inside existing flex containers (Input `.icon` span, Button flex, Toast flex) — no layout churn.

## File tree (before → after) by layer

```
src/shared/ui/
  Modal/ui/ModalCloseButton/ModalCloseButton.tsx   MODIFY (impl: X → <Icon>; keep X import; CLOSE_ICON_SIZE)
  Modal/ui/ModalDrawer/ModalDrawer.tsx             MODIFY (closeIcon → <Icon name={X} size={20}…>)
  Toast/ui/Toast.tsx                               MODIFY (3 sites; rename local Icon→TypeIcon; keep X/Pause)
  Toast/model/constants.ts                          UNCHANGED (TOAST_ICONS map read, not edited)
  Code/ui/CodeBlockHeader/CodeBlockHeader.tsx      MODIFY (Copy/Copied → <Icon size=14>)
  Input/ui/Input.tsx                              MODIFY (Eye/EyeOff → <Icon size=PASSWORD_TOGGLE_ICON_SIZE>)
  Input/ui/InputSearch/InputSearch.tsx             MODIFY (<Search/> → <Icon name=Search…> NO size)
  Input/ui/InputEmail/InputEmail.tsx               MODIFY (<Mail size=18>→<Icon size=18>)
  Input/ui/InputPhone/InputPhone.tsx               MODIFY (<Phone size=18>→<Icon size=18>)
widgets/Sidebar/
  Sidebar.tsx                                      MODIFY (menuIcon)
  ui/MobileMenu/MobileMenu.tsx                     MODIFY (closeIcon)
  ui/ToggleButton/ToggleButton.tsx                 MODIFY (ChevronRight, explicit 20)
  ui/NavItem/NavItem.tsx                           MODIFY (navIcon — prop-injected)
  Sidebar.module.scss / MobileMenu/ / NavItem/     UNCHANGED (boxes land on wrapper span)
features/
  ThemeSwitch/ui/ThemeSwitch.tsx                    MODIFY (Moon/Sun, explicit 18 + controlIcon)
  LanguageSwitch/ui/LanguageSwitch.tsx              MODIFY (Globe, explicit 18 + controlIcon)
  Contact/ui/Contact.tsx                            MODIFY (Card icon → <Icon name={Mail} size={40}>)
  Card/ui/ContactCard/  scss                        UNCHANGED (delta accepted, §7)
docs/specs/ui-kit-contract.md                        MODIFY (Icon: adoption coverage, PR4)
src/.../icon-adoption.test.tsx                      NEW     (aggregation, PR4)
```

**Icon itself (`src/shared/ui/Icon/`)** — **no change** (already polymorphic via ICR). `Button`/`Input` conduits and their `inferIconSize` — **no change**.

## Per-site design (17 incompatible sites)

Legend: **size** = explicit pixel (matches box); `name` = icon; `decorative`; `color="inherit"`.

| #   | File (site)                     | New JSX                                                                                                                   | size                                    |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | ModalCloseButton:34             | `<Icon name={X} size={MODAL_CONSTANTS.CLOSE_ICON_SIZE} color="inherit" decorative />`                                     | 20                                      |
| 2   | ModalDrawer:36                  | `<Icon name={X} size={20} color="inherit" decorative />`                                                                  | 20                                      |
| 3   | Toast:134 type                  | rename local→`TypeIcon`; `<Icon name={TypeIcon} size={TOAST_CONSTANTS.ICON_SIZE} color="inherit" decorative />`           | 20                                      |
| 4   | Toast:146 close                 | `<Icon name={X} size={TOAST_CONSTANTS.CLOSE_ICON_SIZE} color="inherit" decorative />`                                     | 16                                      |
| 5   | Toast:164 pause                 | `<Icon name={Pause} size={12} color="inherit" decorative />`                                                              | 12                                      |
| 6   | Code:119 copy/check             | `<Icon name={CopyIcon} size={14} color="inherit" decorative />` (CopyIcon=`icons?.copy ?? Copy` etc.)                     | 14                                      |
| 7   | Input:287-290 eye               | `<Icon name={showPassword?EyeOff:Eye} size={INPUT_CONSTANTS.PASSWORD_TOGGLE_ICON_SIZE} color="inherit" decorative />`     | 16                                      |
| 8   | InputSearch:33                  | `<Icon name={Search} color="inherit" decorative />` **no size** (inferIconSize injects)                                   | infer                                   |
| 9   | InputEmail:51                   | `<Icon name={Mail} size={18} color="inherit" decorative />`                                                               | 18                                      |
| 10  | InputPhone:60                   | `<Icon name={Phone} size={18} color="inherit" decorative />`                                                              | 18                                      |
| 11  | Sidebar:62 menu (IconButton lg) | `<Icon name={Menu} size={20} color="inherit" decorative className={styles.menuIcon} />`                                   | **explicit 20** (conduit would give 24) |
| 12  | MobileMenu:55 (IconButton md)   | `<Icon name={X} size={20} color="inherit" decorative className={styles.closeIcon} />`                                     | explicit 20                             |
| 13  | ToggleButton:28 (IconButton md) | `<Icon name={ChevronRight} size={20} color="inherit" decorative />`                                                       | explicit 20 (matches map)               |
| 14  | NavItem:48 (prop icon)          | `<Icon name={icon} size={20} color="inherit" decorative className={styles.navIcon} />` (prop `icon: LucideIcon` → `name`) | 20                                      |
| 15  | ThemeSwitch:45-51 (leftIcon)    | `<Icon name={themeIcon === 'dark'?Moon: Sun} size={18} color="inherit" decorative className={themeIconClasses} />`        | **explicit 18** (conduit md→20)         |
| 16  | LanguageSwitch:44               | `<Icon name={Globe} size={18} color="inherit" decorative className={languageIconClasses} />`                              | **explicit 18**                         |
| 17  | Contact:112 (ContactCard icon)  | `<Icon name={Mail} size={40} color="inherit" decorative />`                                                               | **explicit 40** (see §7)                |

Every site: remove the `aria-hidden="true"` on the migrated element (`decorative` provides it), except **consumer** `aria-hidden` wrappers (Toast `.icon` div, Input `.icon` span) stay. Data maps (`TOAST_ICONS`, `getNavItems` icon field) are only READ — never edited.

## Imports pattern

Rule: the lucide `import { X } from 'lucide-react'` is **KEPT** (name={<X>} references it). ADD `import { Icon } from '@/shared/ui/Icon'`. Toast additionally renames local `const Icon = TOAST_ICONS[type]` → `TypeIcon`. NavItem keeps `type { LucideIcon }` prop type.

## Styles / SCSS

- **`.menuIcon`, `.closeIcon`, `.navIcon`, `.controlIcon`** — kept unchanged. Each `width/height` box lands on the wrapper span; inner svg gets matching inline `width/height` from explicit `size` (20/20/20/18). `flex-shrink:0` still applies on span. `color:currentcolor` on `.menuIcon` now redundant (inline currentColor wins) but harmless — leave.
- **`.controlIcon` transition/spin** — `transform: rotate` + transition operate on wrapper `<span>` instead of `<svg>` — visual equivalent, no SCSS edit.
- **ContactCard `.iconWrapper svg, .icon` (2.5rem)** — inline Icon `size` (40px) beats the stylesheet `svg` rule. **Decision: pass `size={40}`; keep SCSS as-is.** Base (≤lg) 40px === 40px (exact current visual); at `lg` wrapper grows to 48px while svg stays 40px → accepted delta on decorative card (CardMeta 0.8rem→0.75rem precedent). Fallback (rejected): `.iconWrapper .icon svg { width:100% }` — inline beats it; clean fix needs Icon internal hook change (**out of scope**, documented follow-up).

## Test plan

**Untouched, must stay green (no-op gates):**
`ModalCloseButton.test` (querySelector('svg') nested — still matches), `Toast.test:231-236` (firstElementChild = `.icon` div), `CodeBlockHeader.test:56/63` (querySelector('svg')), `Input*.test` (fixtures render own raw `<Mail>` — not migrated), `IconButton.test`/`ButtonWithIcon.test` (own raw icons untouched), `NavItem.test` (message `menuitem`/href only), Sidebar/MobileMenu/Toggle/ThemeSwitch/LanguageSwitch/Contact tests (role/testid/class only — grep no svg/lucide root), `Icon.test.tsx` (noop), `Link.test.tsx` (already `<Icon>`).

**New: `src/__tests__/icon-adoption.test.tsx`** — aggregation, representative per group:

- svg inline `width` = 40 (Contact), 20 (Sidebar menu, NavItem, Modal close, Toggle, MobileMenu), 18 (Theme/Language switch), 16 (Toast close, Input eye), 14 (Code copy), 12 (Toast pause), 20 (InputSearch md inferred).
- wrapper present: node `querySelector('span.icon')` with `data-size`, `data-color="inherit"`, no `role`, aria-hidden via decorative.
- **anti-regression**: ThemeSwitch icon NOT 24 and NOT 20 (conduit md would inject 20 → our 18 held); Sidebar menu NOT 24 (lg conduit).
- **data-map guard**: assert `TOAST_ICONS[type]` for all 4 types and `getNavItems()` icon fields non-degenerate and NOT mutated across two renders.

**Forbidden** (hard rule, spec ICON-AD-08): no existing test fixture modified. Only assertion-only `querySelector('svg')` descendant swap is permitted if a future fixture ever asserts svg-root (does not occur today).

## Risks

| Risk                                                                                                         | Lik     | Mitigation                                                                           |
| ------------------------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------ |
| Toast local `const Icon` shadows imported `Icon` → wrong element / TS collision                              | high    | rename local → `TypeIcon` (blocking first task in Toast batch, caught by type-check) |
| Inline size beats SCSS box on Button-conduit sites (Sidebar lg→24, ThemeSwitch md→20) unless explicit `size` | med     | explicit `size` on all Button-sited: 11/12/13 (20), 15/16 (18); assertion in tests   |
| ContactCard inline 40px defeats `.iconWrapper svg` rule → @lg 8px delta                                      | med-low | `size={40}`; screenshot diff Contact card; accepted delta / follow-up documented     |
| Wrapper `<span class=icon>` inline-flex/vertical-align in existing flex containers                           | low     | sits in same container as old svg; byte-compatible; screenshot 4 boxes               |
| Double `aria-hidden` (consumer wrapper + decorative)                                                         | low     | accepted; single-`decorative`; no double roles                                       |
| lucide imports kept as `name` values → no dead/DNS imports                                                   | none    | every `name` renders is a lucide value; `analyze:dead-code` unchanged                |

## Migration / Rollout & PR sizing

Each batch = one chained PR, revert surgical (`git revert <unit-commit>` — sites snap back to raw lucide; `<Icon>` import additive; no API change):

| Batch                                 | Files                                          | Est LOC  | PR  |
| ------------------------------------- | ---------------------------------------------- | -------- | --- |
| shared + Modal + Toast (AD-01/02/03)  | Modal×2, Toast                                 | ~110–130 | PR1 |
| Input + Code (AD-04/05)               | Input.tsx, Search, Email, Phone, CodeHeader    | ~120     | PR2 |
| Sidebar/widgets + features (AD-06/07) | Sidebar×4 + ThemeSwitch×2 + Contact            | ~160     | PR3 |
| tests + docs (AD-08)                  | `icon-adoption.test.tsx`, `ui-kit-contract.md` | ~200     | PR4 |

**Total ~590–650 adjusted lines**, all isolation-risk per-PR revert.

## Next step

Ready for sdd-tasks (icon-adoption).
