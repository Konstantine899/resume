# Specification: Icon Adoption — Migrate raw `LucideIcon` consumers to `<Icon>`

**Change**: icon-adoption
**Status**: Draft
**Date**: 2026-08-07
**Scope source**: `docs/specs/icon-adoption-proposal.md`
**Priority**: Option A (site-per-site, 17 render sites) — ~5h core. No conduit API change.
**Non-breaking gate**: all existing consumer tests stay green UNCHANGED (verified below); the `Link` production site is NOT touched (already via `<Icon>`).

---

## Scope

### In scope (migrate render sites only — data maps untouched)

Modal (2: ModalCloseButton, ModalDrawer), Toast (3: type-icon, close, pause), Code (1: CodeBlockHeader Copy/Check), Input (4: Input.tsx password toggle Eye/EyeOff, InputSearch, InputEmail, InputPhone), Sidebar/widgets (4: Sidebar Menu, MobileMenu X, ToggleButton ChevronRight, NavItem navIcon), features (3: ThemeSwitch, LanguageSwitch, ContactCard).

**Intentionally NOT evolved:** `Icon` itself, `Button`/`Input` conduits (`icon?: ReactNode`, `leftIcon/rightIcon`, `inferIconSize`) — API change = Option B, rejected. Data maps remain single source: `TOAST_ICONS`, `Sidebar/getNavItems` icon field — **read, not edited**.

### Out of scope

`xl` harmonization (`Icon xl=32` vs Button/Input `xl=28`); `InputClearIcon` (hand-drawn SVG, not lucide); `entities/**`; fixture refactor beyond those required; adoption into `.test`/`.stories` unless migration touches them.

---

## Byte-identity vs byte-COMPATIBILITY (formal)

Raw sites render `<svg class="lucide-*" width height ...>` as the ROOT node. `<Icon>` renders a `<span>` wrapper (`display:inline-flex`) around the inner `<svg>`. The DOM is therefore **NOT byte-identical** — it is **byte-compatible**: same rendered svg glyph, same size box, same a11y state, one extra inert wrapper. This is safe because:

- The inner svg keeps its `lucide-*` classes (lucide injects them regardless of host).
- Existing tests query descendants (`querySelector('svg')`), roles, or testids — never the raw root node — so the extra wrapper is invisible to them (verified per-fixture below).
- Effective extraction is all visual, not functional.

**Per-site identity rule** (each `<Icon name={X} size={N} color="inherit" decorative className={...}>`): `X` = the exact original icon component; `size={N}` = the original pixel box (see table); `color="inherit"` → `currentColor` (preserves consumer's CSS color — see rule A); `className` = **same** class, now landing on the wrapper; `decorative` replaces prior `aria-hidden` hiding.

> **A-3 color rule (critical):** `Icon` ALWAYS injects `inline style.color` on the svg, which defeats a module-class color. `color="inherit"` emits `currentColor` inline — numerically identical to lucide's default, so the consumer's CSS color (e.g. `.menuIcon { color: currentColor }`) still governs via CSS inheritance on current context. Passing any palette name would override a consumer color → regression. Therefore **every site passes `color="inherit"` unless consumer SCSS fixes a named color** (then pass that name instead).

Per-site dimensions (verified against consumer `.module.scss`):

| Site                         | Icon                    | size px                                          | source of size     | decorative | className(s)                               |
| ---------------------------- | ----------------------- | ------------------------------------------------ | ------------------ | ---------- | ------------------------------------------ |
| ModalCloseButton (default)   | `X`                     | `MODAL_CONSTANTS.CLOSE_ICON_SIZE` (20)           | ✓                  | true       | —                                          |
| ModalDrawer closeIcon        | `X`                     | 20 (hardcoded)                                   | ✓                  | true       | —                                          |
| Toast type-icon              | `TOAST_ICONS[type]`     | `TOAST_CONSTANTS.ICON_SIZE` (20)                 | ✓                  | true       | inside `.styles.icon` div (keep)           |
| Toast close                  | `X`                     | `TOAST_CONSTANTS.CLOSE_ICON_SIZE` (16)           | ✓                  | true       | —                                          |
| Toast pause                  | `Pause`                 | 12                                               | ✓                  | true       | within `.pauseIndicator` div (keep)        |
| CodeBlockHeader copy / check | `CopyIcon`/`CopiedIcon` | 14                                               | ✓                  | true       | `className` from ButtonWithIcon `leftIcon` |
| Input.tsx Eye / EyeOff       | `Eye`/`EyeOff`          | `INPUT_CONSTANTS.PASSWORD_TOGGLE_ICON_SIZE` (16) | ✓                  | true       | —                                          |
| InputSearch                  | `Search`                | via `inferIconSize(InputSize)`                   | ✗ (conduit infers) | true       | —                                          |
| InputEmail                   | `Mail`                  | 18                                               | ✓                  | true       | —                                          |
| InputPhone                   | `Phone`                 | 18                                               | ✓                  | true       | —                                          |
| Sidebar Menu                 | `Menu`                  | 20 (via Button)                                  | ✗                  | true       | `styles.menuIcon`                          |
| MobileMenu X                 | `X`                     | 20 (same)                                        | ✗                  | true       | `styles.closeIcon`                         |
| ToggleButton ChevronRight    | `ChevronRight`          | 20 (same)                                        | ✗                  | true       | —                                          |
| NavItem navIcon              | data icon               | 20 (`.navIcon` box)                              | ✗                  | true       | `styles.navIcon`                           |
| ThemeSwitch Moon/Sun         | icon                    | 18 (CSS box)                                     | ✗                  | true       | `controlIcon`                              |
| LanguageSwitch Globe         | Globe                   | 18 (CSS box)                                     | ✗                  | true       | `controlIcon`                              |
| ContactCard Mail             | Mail                    | default                                          | ✗                  | true       | `styles.icon` box (ContactCard)            |

×(InputSearch): `inferIconSize` clones and injects `size={INPUT_SIZE_TO_ICON[InputSize]}` (md=20…lg=24…). Pass `<Icon name={Search} color="inherit" decorative/>` WITHOUT size so Input's inference keeps working — Icon reads the injected `size` prop. Do NOT hardcode size in InputSearch (would break the input-size coupling).

Safety: where the consumer SCSS fixes the box width/height (`.menuIcon`20, `.closeIcon`20, `.navIcon`20, `.controlIcon`18), pass `size=N` explicitly equal to that box so `Icon` doesn't default svg to 20px/md. For `controlIcon`=18 (Button size md → `inferIconSize` would force 20), pass explicit `size={18}`.

---

## A11y / decorative rule

- **Every migrated icon is decorative/inert** (supplemental icon): set `decorative` on the JSX (Icon auto emits `aria-hidden="true"` on the wrapper, none on inner svg, `role` undefined, `data-testid` undefined).
- **Preserve the existing consumer `aria-hidden` wrapper unchanged** (Input `styles.icon` span, Toast `styles.icon` div, Sidebar). These do NOT conflict: `decorative` adds one more `aria-hidden` on the inner `<Icon>` span, semantically identical (both hide the tree). Do not add a second `aria-hidden`/decorative attribute on icon elements that were already `aria-hidden` on the wrapper — the rule is: one `decorative` on the migrated `<Icon>`, untouched consumer wrapper.
- **No `role="img"`** — a non-decorative (`decorative=false`) Icon would inject `role="img"` on inert icons → role noise; rejected. All migrated sites are `decorative=true`.
- Contact social links inside `Link` already use the `Icon`/external logic — NOT in scope (Link untouched).

---

## ADDED Requirements

### ICON-AD-01 — Byte-compatible Icon adoption contract (shared, applies to all 17 sites)

All migrated sites in this change SHALL render via `<Icon name size color="inherit" decorative/>` (plus `className` and `component` only when needed). The data coordinates and rendering MUST be preserved: `name` = exact original lucide component (via map lookup where applicable, e.g. `TOAST_ICONS[type]`), `size` = original pixel integer (explicit; see per-site table; hidden size for InputSearch/`IconButton`-sited icons delegated to `inferIconSize`), `color="inherit"`, `decorative=true` for every inert site. The DOM change from raw `<svg>` root to `<span><svg/></span>` wrapper SHALL be accepted as byte-compatible (visual noop) per the Byte-compatibility contract above — not byte-identical.

#### Scenario: raw svg root vs Icon span wrapper

- GIVEN a raw site `<X size={20}>` and the migrated `<Icon name={X} size={20} color="inherit" decorative/>`
- WHEN both render (render-compare or single-migration screenshot)
- THEN the inner `<svg>` MUST preserve the lucide glyph, `width`/`height` 20px (inline style), and `currentColor` stroke
- AND the DOM differs only by the added inert `<span class=icon...>` wrapper (flex, no size box)
- AND NO `role`, `tabIndex`, `data-testid` appears on the wrapper (decorative+non-interactive)

#### Scenario: color does not regress

- GIVEN `.menuIcon { width:20px; height:20px; color:currentcolor }` (consumer SCSS)
- WHEN `<Icon name={Menu} color="inherit" decorative className={styles.menuIcon}/>` renders inside the mobile button
- THEN the svg computed color MUST equal the button font color (currentColor) — `color="inherit"` bypass preserved
- AND passing `color="foreground"` instead MUST be treated as a color regression risk (spec-prohibited)

#### Scenario: data-maps untouched

- GIVEN `TOAST_ICONS` map and `getNavItems()` returning `{icon: LucideIcon}`
- WHEN the migrated Toast/NavItem components render
- THEN the maps are NOT modified; the map is only ASSIGNED into `name=<...>`

### ICON-AD-02 — Modal group (2 sites) [ModalCloseButton, ModalDrawer]

The system SHALL migrate the **default** close icon in `ModalCloseButton` and the hardcoded close icon in `ModalDrawer` to `<Icon name={X} size={...} color="inherit" decorative/>`, keeping `MODAL_CONSTANTS.CLOSE_ICON_SIZE` each. The `closeIcon` override prop (ReactNode) stays unchanged (conduit API preserved).

#### Scenario: ModalCloseButton default icon

- GIVEN `<ModalCloseButton onClose/>` (default `closeIcon` undefined)
- WHEN renders
- THEN the button renders an inner `<span...>` wrapping an `<svg style="width:20px;height:20px"/>` rendering the `X` glyph — visually the same as `<X size={20}>`
- AND `button.querySelector('svg')` (existing assertion) is STILL found (descendant) — no fixture change

#### Scenario: custom closeIcon injection unaffected

- GIVEN `<ModalCloseButton closeIcon={<MyIcon/>}>`
- WHEN renders
- THEN `closeIcon` is rendered verbatim (ReactNode), bypassing `<Icon>` — no functional change

### ICON-AD-03 — Toast group (3 sites) [Toast.tsx type-icon, close, pause]

The system SHALL replace the raw `TOAST_ICONS[type]` type-icon (`<Icon size={20}>`), `<X size={16}>` close and `<Pause size={12}>` pause with `<Icon name size color="inherit" decorative/>`, respecting `TOAST_CONSTANTS.ICON_SIZE`/`CLOSE_ICON_SIZE` and the existing `.icon`/`.pauseIndicator` aria-hidden wrappers (kept).

#### Scenario: toast type icon by type

- GIVEN `<Toast type="success">`
- WHEN rendered
- THEN the inner `.icon` div (aria-hidden, kept) wraps `<Icon name={TOAST_ICONS.success} size={20} decorative/>`
- AND existing assertion `firstElementChild.toHaveAttribute('aria-hidden','true')` (Toast.test:231) still passes (the wrapper is the styles.icon div — unchanged)

#### Scenario: toast close/pause

- GIVEN `<Toast …>` rendering the close button and a paused state
- THEN the button contains a 16px decorative Icon, and the pauseIndicator shows a 12px decorative Pause — existing `data-testid="toast-close"` assertions intact.

### ICON-AD-04 — Code group (1) [CodeBlockHeader copy/check]

The system SHALL replace the copy/check icons rendered via `ButtonWithIcon leftIcon` (`<CopyIcon size={14}/>` and `<CopiedIcon size={14}/>` — where `CopyIcon = icons?.copy ?? Copy`, `CopiedIcon = icons?.copied ?? Check`) with `<Icon name={CopyIcon} size={14} color="inherit" decorative/>` (passed as the `leftIcon` ReactNode).

### ICON-AD-05 — Input group (4) [Input Eye/EyeOff, InputSearch, InputEmail, InputPhone]

The system SHALL replace `Eye`/`EyeOff` (passwordToggle), `Search`, `Mail`, `Phone` raw icons with `<Icon>`:

- Input.tsx password `Eye`/`EyeOff`: `<Icon name={Eye} size={INPUT_CONSTANTS.PASSWORD_TOGGLE_ICON_SIZE} decorative/>` inside the existing toggle `<button>`.
- InputSearch: `<Icon name={Search} color="inherit" decorative/>` — NO explicit `size`, so Input's `inferIconSize` injects the input-size-mapped pixel (conduit behavior preserved); wrapper must not break infer.
- InputEmail: `<Icon name={Mail} size={18} color="inherit" decorative/>`; InputPhone: `<Icon name={Phone} size={18} decorative/>`.

The rest of the visual/behavior of `Input` (`styles.icon` spans, underline, icon infer, a11y) SHALL stay as-is. The replacement only swaps the inner icon node inside the already-`aria-hidden` `Input` wrapper (which retains `aria-hidden="true"`).

#### Icon-hiding rule for Input

- GIVEN `Input` renders the `styles.icon` span with `aria-hidden="true"` wrapping the migrated `<Icon decorative>`
- WHEN rendered
- THEN `aria-hidden` (wrapper) and `decorative` (Icon) cooperate to hide the icon tree — exactly one `aria-hidden` node per hide (wrapper), `decorative` sets the inner Icon's span `aria-hidden` too — no screen-reader leak, no doubled roles

#### Scenario: InputEmail size preserved

- GIVEN `<InputEmail>` default
- WHEN rendered
- THEN the inner svg `width`/`height` = 18 (not 16/20) — hardcoded 18 preserved via explicit `size={18}` (`inferIconSize` won't override since an explicit `size` is present)

### ICON-AD-06 — Sidebar/widgets group (4 sites) [Sidebar Menu, MobileMenu X, ToggleButton ChevronRight, NavItem navIcon]

Sidebar `Menu` (`<Icon name={Menu} className={styles.menuIcon} decorative/>` inside `IconButton`), MobileMenu `X` (`className={styles.closeIcon}`), ToggleButton `ChevronRight` via `IconButton`, NavItem icon: `<Icon name={icon} className={styles.navIcon} decorative/>` — the `icon` prop remains `LucideIcon` from the data map (getNavItems not touched).

**SVG-размер vs CSS box:** Menu/close/nav sizes 20px come from consumer SCSS (`.menuIcon` etc). `Icon` inner svg → inline width/height from `size`. For `IconButton`-based sites, pass `size={20}` (matches CSS box). For ToggleButton `ChevronRight` → matches Button (size md=20) — pass `size={20}`. NavIcon: `.navIcon` 20px box; pass `size={20}`.

#### Scenario: sidebar icon and size

- GIVEN collapsed sidebar rendering `IconButton` with `<Icon name={Menu} className={styles.menuIcon} size={20} decorative color="inherit"/>`
- THEN svg reflects `Menu` lucide, 20px box (CSS class + inline svg), color from button; Sidebar transitions on `.menuIcon` affected as-is
- AND the Tooltip/NavItem `role="menuitem"` and `navIcon` flex-shrink invariants remain intact

### ICON-AD-07 — features group (3 sites) [ThemeSwitch, LanguageSwitch, ContactCard]

Replace `Moon`/`Sun` (ButtonWithIcon leftIcon wrapping `.controlIcon`), `Globe` (LanguageSwitch), `Mail` (`ContactCard` icon).

`ThemeSwitch`/`LanguageSwitch`: pass `size={18}` (matches `.controlIcon` 18px box; Button size md would infer 20 otherwise) + `color="inherit"` + `className={iconClasses}` where `iconClasses=classNames(styles.controlIcon, isTransitioning && styles.spinning)`.

`ContactCard` `Mail`: `<Icon name={Mail} decorative/>` inside `styles.iconWrapper` (ContactCard renders `{icon}` ReactNode).

#### Scenario: controlIcon spin preserved

- GIVEN ThemeSwitch toggle triggers `isTransitioning`
- THEN the CSS `.spinning` animation + transition (on the wrapped span) continue to rotate the icon — animation moved from svg → wrapper span, visual equivalent

#### Scenario: ContactCard decorative Mail

- GIVEN `<ContactCard title="Contact" icon={<Icon name={Mail} decorative/>}>`
- THEN the `.iconWrapper` houses the decorative icon (aria-hidden, no role), exactly as before

---

## ICON-AD-08 — Test fixtures (verified zero-svg-root; allow-touch if needed)

Formal rule: **migrated tests do NOT assert svg-root or an Icon-internal node → all existing tests pass UNCHANGED.**

| Test (file:line)                                                                                     | asserts                                                       | after migration                                           | action       |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- | ------------ |
| `ModalCloseButton.test.tsx:42`                                                                       | `button.querySelector('svg')`                                 | svg nested inside new span → still matches                | ✅ no change |
| `Toast.test.tsx:231`                                                                                 | `firstElementChild` (styles.icon div) `aria-hidden=true`      | div intact                                                | ✅ no change |
| `Toast.test.tsx` (toast-close, timers, dev-warn)                                                     | role/testid                                                   | unaffected                                                | ✅           |
| `CodeBlockHeader.test.tsx:56,63`                                                                     | `code-copy-button.querySelector('svg')`                       | nested svg still found                                    | ✅           |
| `Input.test.tsx:122–133,585,684–705`                                                                 | `aria-hidden` on Input's own `styles.icon` span / testid=icon | uses `<Mail>`/`<Mail>` fixtures (raw, not migrated)       | ✅ no change |
| `Sidebar`, `MobileMenu`, `ToggleButton`, `ThemeSwitch`, `LanguageSwitch`, `Contact`, `NavItem` tests | role/testid/class only (grep: no svg/lucide queries)          | pass                                                      | ✅ no change |
| `IconButton.test`, `ButtonWithIcon.test`, `InputClearButton.test`                                    | svg `width` attr                                              | these components' OWN icons are raw lucide (NOT migrated) | ✅ untouched |
| `Link.test.tsx:165` `querySelector('.lucide-github')`                                                | internal Icon already produces nested svg with `lucide-*`     | Link already on `<Icon>` (not this change)                | ✅ untouched |

**If** a consumer-fixture ever asserts the svg ROOT or `toHaveAttribute('width')` (a scenario that does not occur today), the fix is `querySelector('svg')` on the svg descendant — permitted as an assertion-only change, never a behavior change.

**Test-strategy additions (ADDED):**

- New dedicated spec tests in one aggregation file (`icon-adoption.test.tsx`) or per-slice minimal additions asserting, for a representative sample, `Icon` wrapper present + svg size preserved (e.g. ModalCloseButton getByTestId shows a svg 20; ThemeSwitch controlIcon spin class). Cover each group's dimension when the site sets a non-trivial size (18/20/14/16/12).

---

## Test expectations

| Area                                                                     | Type                        |
| ------------------------------------------------------------------------ | --------------------------- |
| Byte-compatible DOM + svg size (per-site representative)                 | Unit — new light assertions |
| No unit on fixture updates (all existing tests unchanged)                | gate                        |
| Consumer infra — each site resumes without regression (color, box, aria) | Unit                        |
| dead-code on removed lucide raw imports                                  | static                      |
| `type-check:strict`, `lint` 0; vitest src full                           | runtime                     |

---

## Implementation order (batches → PRs)

1. **PR1 shared + Modal + Toast** (ICON-AD-01,02,03) — smallest risky leaf sites; establish the color/decorative pattern; verify IconButton/Toast tests.
2. **PR2 Input + Code** (ICON-AD-04,05) — the `inferIconSize`-sensitive sites (Search, conduits).
3. **PR3 Sidebar/widgets + features** (ICON-AD-06,07) — ButtonWithIcon/IconButton consumer sites, NavItem icon-injection.
4. **PR4 tests + docs** (ICON-AD-08 fixture lock, `docs/specs/ui-kit-contract.md` entry, verification).

Each batch is a logical unit that can be reverted independently (`git revert <batch-commit>` — sites snap back to raw lucide; `<Icon>` import additive; conduit APIs untouched → zero consumer fallout).

---

## Risks

| Risk                                                                                             | Likelihood | Mitigation                                                                                                                                 |
| ------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Icon span wrapper (`display:inline-flex`) affects consumer flex/gap layout                       | Med        | inline-flex only wraps the svg; `vertical-align:middle`; systemic rule in AD-01 contract                                                   |
| Inline `style.color=currentColor` vs consumer SCSS color; palette var override                   | Med        | `color="inherit"` everywhere; where SCSS sets named color, use the right path; screenshot-diff 4 box types (Modal, Input, Button, Sidebar) |
| `inferIconSize`/`IconButton` size inference overriding explicit `size` (InputSearch/controlIcon) | Med        | explicit size on non-inferred sites (18/20/16); InputSearch deliberately no size (conduit map)                                             |
| Extra wrapper breaks `.menuIcon`/`.controlIcon` CSS `width/height` target (svg→span)             | Med        | pass `size` equal to CSS box in those contexts (18/20) so wrapper and svg agree; screenshot-verified                                       |
| Double `aria-hidden` (wrapper + decorative) — redundancy but not error                           | Low        | Acceptable; documented (single `decorative`, no re-added aria-hidden)                                                                      |
| `navIcon`/`controlIcon` data-map icon values differ in decorative/size uniformity                | Low        | per-site `name`/`size`/`decorative` table governs                                                                                          |

**Rollback:** per-PR revert; the `color`/`className`/`decorative` props are additive to every migrated site; no conduit API changed.

---

## Success Criteria

- [ ] `type-check:strict` + `lint` (0 new warnings), full vitest green
- [ ] No existing test modified or broken (gate: full vitest)
- [ ] Every migrated site renders an Icon wrapper; sizes/box/aria preserved per table
- [ ] Data maps (`TOAST_ICONS`, `getNavItems`) unmodified
- [ ] `docs/specs/ui-kit-contract.md` notes adoption coverage
