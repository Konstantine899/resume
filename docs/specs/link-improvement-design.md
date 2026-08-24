# Design: Link Component Improvement

**Change**: link-improvements
**Status**: Draft
**Date**: 2026-08-06
**Scope source**: `docs/specs/link-improvement-spec.md` (19 requirements LNK-01..LNK-19)
**Non-breaking gate**: 54 existing unit tests pass UNCHANGED + 16 stories render.

---

## Overview

Upgrade `src/shared/ui/Link/` to the in-repo Senior+ standard by copying proven patterns from sibling slices: Heading (generic polymorphic `component` + memo-cast), Section/Paragraph (`useX` hook + self-guarded dev validator + `dataAttrs`), Button (`useButton` + `ButtonLoader` + `ICON_SIZE_MAP`). All changes are additive or behavioral-noop; the default render path (`<a>`) is byte-identical in the DOM.

**Key verified facts (this session):**

- `SidebarHeader.tsx` ALREADY consumes `Link` (`variant="ghost" underline="never"`) — it is not a raw `<a>` site; the actual remaining raw `<a>` consumers are **6**: Sidebar skip-link, HomePage skip-link, NavItem, Hero CTA, About CTA, Contact social.
- `src/shared/ui/Card/ui/ProjectCard/ProjectCard.tsx:82` is a 7th raw `<a>` — **out of LNK-10 scope** (fully custom card-link styling; flag as follow-up, do NOT migrate in this change).
- `--gradient-text` is ALREADY defined in `_theme.scss` (light+dark, lines 19/67/99, from Paragraph PAR-06) — LNK-06 only aligns the `.gradient` SCSS to the var.
- Zero default-import consumers of `Link` (grep-verified) — LNK-04 safe.

---

## Architecture

### File tree (before → after)

```
src/shared/ui/Link/
├── index.ts                         MODIFY  (exports: drop validateLinkProps; add LinkSkeleton, useLink, ICON_SIZE_MAP, isExternalLink? NO — utils live in shared/lib)
├── ui/Link.tsx                      MODIFY  (thin; delegates to useLink + LinkSkeleton)
│                                   +        (remove export default)
├── ui/Link.module.scss              MODIFY  (LNK-06 gradient → var(--gradient-text); keep .skeletonPlaceholder)
├── ui/Link.stories.tsx              MODIFY  (+plays, composition, real-world stories)
├── ui/Link.test.tsx                 UNCHANGED (54 no-op gate)
├── ui/Link.polymorphic.test.tsx     NEW     (polymorphic, ref-per-component, @ts-expect-error, a11y)
├── ui/LinkSkeleton/
│   ├── LinkSkeleton.tsx             NEW     (ButtonLoader precedent)
│   └── LinkSkeleton.test.tsx        NEW
├── lib/hooks/useLink.ts             CREATE  (consolidate 5 useMemo + validator call)
├── model/types.ts                   MODIFY  (LinkOwnProps / LinkProps<C> / LinkHookProps / UseLinkReturn)
├── model/constants.ts               MODIFY  (add ICON_SIZE_MAP)
└── lib/utils/validateLinkProps.ts   MODIFY  (NODE_ENV guard internal — LNK-15)

src/shared/lib/utils/
├── externalLink.ts                  CREATE  (isExternalLink + getExternalLinkAttrs)
├── externalLink.test.ts             NEW
└── index.ts                         MODIFY  (export both helpers)
```

### Dependency order (implementation batches per spec)

Batch 1 core (LNK-13→01→02→08→03→04→05→06→09→15), Batch 2 integration (LNK-10), Batch 3 stories (LNK-07/11/12/17/18/19).

---

## Per-requirement design

### LNK-01 — Polymorphic `component` prop

- **Files**: `model/types.ts`, `ui/Link.tsx`.
- **Types** (model/types.ts):

```ts
export interface LinkOwnProps {
  href: string;
  children?: ReactNode;
  variant?: LinkVariant;
  size?: LinkSize;
  external?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  showExternalIcon?: boolean;
  externalIcon?: LucideIcon;
  unstyled?: boolean;
  underline?: LinkUnderline;
  withLift?: boolean;
  requireHref?: boolean;
  skeleton?: boolean;
}
export type LinkProps<C extends ElementType = 'a'> = LinkOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof LinkOwnProps | 'component'> & { component?: C };
```

- Backward-compat: `LinkProps` (no arg) = anchor props; `href` stays required. Existing `rel`/`target` come from `Omit<…, 'a'>`.
- `component` name (NOT `as` — Tooltip/Popover/Slot own `as`). Default `C='a'` → `<a>`.
- Build as `<Component ref={ref} href={href} …>{…}</Component>` (JSX direct — Paragraph PAR-01 precedent, fixes Link's current `forwardRef<HTMLAnchorElement>` closed type).

### LNK-02 — Type-safe refs + memo-cast

- `ui/Link.tsx`:

```ts
type LinkComponent = <C extends ElementType = 'a'>(props: LinkProps<C> &
  { ref?: ForwardedRef<ComponentRef<C>> }) => ReactElement;
const linkRef = forwardRef(function LinkImpl<C extends ElementType = 'a'>(
  { href, children, component, ...rest }: LinkProps<C>,
  ref: ForwardedRef<ComponentRef<C>>): ReactElement { … });
const LinkMemo = memo(linkRef as unknown as
  (props: LinkProps<'a'> & { ref?: ForwardedRef<HTMLAnchorElement> }) => ReactElement);
LinkMemo.displayName = 'Link';
export const Link = LinkMemo as unknown as LinkComponent;
```

### LNK-03 — `useLink` hook

- `lib/hooks/useLink.ts`. Single `useMemo` returning all values (useHeading/useSection pattern). Signature in **Decision 1** below.

### LNK-04 — No default export

- `ui/Link.tsx`: replace `export const Link = …; export default Link;` with named-only. Grep-verified zero default-import consumers.

### LNK-05 — Validator internal-only

- `index.ts`: remove `export { validateLinkProps }`. Keep `LINK_CONSTANTS`, `LINK_DEFAULTS`, `Link`, all types. Internals import validator directly from `lib/utils/validateLinkProps`.

### LNK-06 — Gradient via var

- `Link.module.scss` `.gradient`: `background: var(--gradient-text, $gradient-text);` (var already defined in both themes). Visual noop.

### LNK-07/18/19 — Play functions

| Stories                        | Plays assert                                       |
| ------------------------------ | -------------------------------------------------- |
| Default                        | `role=link`, `href`                                |
| External                       | `target=_blank`, rel ⊇ `noopener noreferrer`       |
| Skeleton                       | `aria-disabled=true`, `data-skeleton=true`         |
| Gradient / Variants / Sizes    | gradient/size/variant classes render               |
| External-vs-internal (LNK-19)  | one external URL + attrs; internal has no `_blank` |
| 09 Polymorphic custom (LNK-19) | merged className present, prop forwarded           |

### LNK-08/16 — Tests

See **Test plan**. `@ts-expect-error` compile probes: `<Link component="button" href download>` and `<Link component="a" disabled>` (Button/PAR precedent).

### LNK-09 — `LinkSkeleton`

- `ui/LinkSkeleton/LinkSkeleton.tsx`:

```tsx
export interface LinkSkeletonProps {
  className: string;
}
export const LinkSkeleton = ({ className }: LinkSkeletonProps) => (
  <span className={className} aria-disabled="true" data-skeleton="true">
    <Skeleton variant="text" className={skeletonStyles.skeletonPlaceholder} />
  </span>
);
```

- Imports `styles` from `../Link.module.scss` for `.skeletonPlaceholder`. Main `Link` delegates: `if (skeleton) return <LinkSkeleton className={linkClassName}/>`.

### LNK-13 — External utils

- `src/shared/lib/utils/externalLink.ts`:

```ts
export function isExternalLink(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}
export function getExternalLinkProps(rel?: string): { target: '_blank'; rel: string } {
  return { target: '_blank', rel: classNames(rel, 'noopener', 'noreferrer') };
}
```

- Add to `src/shared/lib/utils/index.ts`. `useLink` delegates both (single source of truth).

### LNK-14 — `ICON_SIZE_MAP`

- `model/constants.ts`:

```ts
import type { IconSize } from '@/shared/ui/Icon';
export const ICON_SIZE_MAP: Record<LinkSize, IconSize> = { sm: 'xs', md: 'sm', lg: 'md' } as const;
```

- Replaces inline map in `ui/Link.tsx` (behavioral noop).

### LNK-15 — Dev-guard internal to validator

- `validateLinkProps.ts`: add `if (process.env.NODE_ENV !== 'development') return;` at top (Section/Paragraph pattern). Remove the now-redundant guard in `ui/Link.tsx`/`useLink`.

---

## Deliverable decisions (explicit)

1. **useLink return shape** — follows useSection/useParagraph:

```ts
export interface LinkHookProps {
  href: string;
  variant?: LinkVariant;
  size?: LinkSize;
  external?: boolean;
  showExternalIcon?: boolean;
  unstyled?: boolean;
  underline?: LinkUnderline;
  withLift?: boolean;
  skeleton?: boolean;
  requireHref?: boolean;
  className?: string;
  rel?: string;
  target?: string;
  component?: ElementType;
}
export interface UseLinkReturn {
  linkClassName: string;
  dataAttrs: Record<string, string>;
  isExternal: boolean;
  relValue: string | undefined;
  targetValue: string | undefined;
  iconSize: IconSize;
}
```

2. **LinkOwnProps vs LinkProps split**: LinkOwnProps (Link-specific) + generic `LinkProps<C>` (own + element props) + `LinkHookProps`/`UseLinkReturn` — all in `model/types.ts`, re-exported from `index.ts`. Memo-cast per Heading (LNK-02). Justification: only the `component` default needs to be generic; own props stay closed.
3. **ICON_SIZE_MAP**: `Record<LinkSize, IconSize>` (values `xs/sm/md`), `m const` in `model/constants.ts`.
4. **External utils**: `src/shared/lib/utils/externalLink.ts`; both added to `shared/lib/utils/index.ts`. `shared/ui` may import from `shared/lib` (valid FSD direction).
5. **LinkSkeleton**: standalone folder + test, zero own SCSS, `className` injected (ButtonLoader precedent). See LNK-09.
6. **dataAttrs**: `{ 'data-variant', 'data-size' }` + `...('data-as' when component is string)` + `...('data-external':'true' when isExternal)` (Heading `data-gradient` / Paragraph `data-as` pattern). Additive — no test breakage.
7. **Stories**: LNK-07 key plays (Default, External, Skeleton, Gradient); LNK-18 remaining (Variants, Sizes, Icon); LNK-19 (external-vs-internal, custom-component). Composition (LNK-11): **LinkInSection, LinkInContainer, LinkInPopover** = 3 (spec) + optional 4th LinkInCard = 4. Real-world (LNK-12): **SidebarNavHeader, HeroCta, FooterLinkGroup** = 3.
8. **Integration (6 sites)** — see table below.
9. **Test organization** — new files; `Link.test.tsx` (54) untouched. See Test plan.

---

## Data flow (useLink internals)

```
<Link component="a" href="https://e" external>
  ├─ validateLinkProps({…})              [guard inside, LNK-15]
  ├─ isExternal  = external || isExternalLink(href)     [LNK-13]
  ├─ rel/target  = isExternal ? getExternalLinkProps(rel) : (rel, target)  [LNK-13]
  ├─ iconSize    = ICON_SIZE_MAP[size]                  [LNK-14]
  ├─ linkClassName = classNames(styles.link, variant, size, underline*, unstyled, withLift, skeleton, className)
  ├─ dataAttrs   = { data-variant, data-size, data-as?, data-external? }
  │
  ├─ skeleton ? <LinkSkeleton className={linkClassName}/>            [LNK-09]
  └─ else <Component ref={ref} className={linkClassName} rel target
             {...dataAttrs} onClick {...rest}>
        {icon}{children}{iconRight}{isExternal&&showExternalIcon&&!unstyled → externalIcon}
```

---

## Integration plan — 6 raw `<a>` sites (LNK-10)

| #   | File:line                                   | Current                                                | Link usage                                                                                                            | Verify                                      |
| --- | ------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | `widgets/Sidebar/Sidebar.tsx:40`            | `<a href="#main-content">` skip                        | `<Link href="#main-content" unstyled variant="ghost" underline="never" className={styles.skipLink}>`                  | keyboard-focus + `#main-content`            |
| 2   | `pages/Home/HomePage.tsx:22`                | same skip                                              | same pattern as #1                                                                                                    | keyboard-focus                              |
| 3   | `widgets/Sidebar/ui/NavItem/NavItem.tsx:79` | `<a {...anchorProps}>`                                 | `<Link unstyled variant="ghost" underline="never" {...anchorProps} className={anchorClassName}>`                      | menuitem nav intact                         |
| 4   | `features/About/ui/About.tsx:30`            | `<a href="#contact">` CTA                              | `<Link href="#contact" unstyled variant="ghost" underline="never" className={styles.ctaButton}>`                      | CTA click → anchor                          |
| 5   | `features/Hero/ui/Hero.tsx:68`              | `<a href="#">` resume                                  | `<Link href="#" unstyled variant="ghost" underline="never" className={styles.resumeButton} onClick={preventDefault}>` | onClick preserved                           |
| 6   | `features/Contact/ui/Contact.tsx:91`        | `<a href="{href}" target blank rel noreferrer>` social | `<Link href={href} external variant="ghost" underline="never" className={styles.socialLink}>`                         | `_blank` + `noopener noreferrer`; icon kept |

Sites 1–5 use `unstyled` → base Link flex/gap are inert (`all: unset`), consumer SCSS wins → visual noop. Site 6 keeps default styling so the external icon + rel render; consumer `.socialLink` flex verified by screenshot. **Verification**: screenshot diff each site before/after; fallback = add `unstyled` where clash (site 6) at the cost of the redundant external icon (it has its own icon).

---

## Test plan (Decision 9)

| File                                            | Covers                                                                                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/Link.test.tsx`                              | 54 existing — **UNCHANGED (behavioral-noop gate)**                                                                                                              |
| `ui/Link.polymorphic.test.tsx` NEW              | polymorphic render (custom comp + element props, 4), ref-per-`component` (2-3), `@ts-expect-error` compile (2-3), a11y role/focus/skip-link + ext-icon aria (3) |
| `lib/hooks/useLink.test.ts` NEW                 | className, attrs, dev-warn/no-warn (4-5), iconSize inference (2)                                                                                                |
| `ui/LinkSkeleton/LinkSkeleton.test.tsx` NEW     | placeholder markup/aria, main delegates, no anchor in DOM (3)                                                                                                   |
| `src/shared/lib/utils/externalLink.test.ts` NEW | isExternalLink, getExternalLinkProps rel merge (3)                                                                                                              |

`@ts-expect-error` probes verified under `type-check:strict` (no unused diagnostics). Storybook plays via `npm run storybook:test`.

---

## Risks

| Risk                                              | Mitigation                                                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Generic + `memo` incompatibility                  | Heading/Button memo-cast, copy in-repo                                                               |
| Transformation LNK-10 site styling conflicts      | `unstyled` across all custom-classified sites; screenshot diff each site; site 6 fallback documented |
| Ref-type widening breaks consumers                | grep: zero external ref usage; TS-error-first, runtime noop                                          |
| Typedef `LinkProps` → generic breaks type imports | default `C='a'`; type import must compile `@type-check:strict`                                       |
| Validator guard move (LNK-15) changes warn timing | behavioral noop; existing console.warn tests re-run                                                  |

---

## Migration / Rollout

No data migration. Per spec: one PR per concern (core → integration → stories). Rollback: `git revert <integration-commit>` (6 sites snap back to raw `<a>`; Link API unchanged); re-export/validator/default restore trivial; gradient `<--gradient-text>` → hardcoded identical value (visual noop both ways).

## Dependencies

- **In-repo only**: `@/shared/lib/utils/externalLink.ts`, `@/shared/ui/Skeleton` (existing), `@/shared/ui/Icon` `IconSize`, `@newmaster/ui` none. No new npm packages.
- **Precedent copies**: Heading (memo-cast), Section/Paragraph (hook + validator), Button (useButton/ButtonLoader/ICON),
- **Gate**: PAR-06 `--gradient-text` token, already landed.

## Open Questions

- [ ] Site 6 (Contact social): confirm screenshot-verify external-icon visibility vs `unstyled` fallback — decide at task-implementation time.
- [ ] `ProjectCard.tsx:82` raw `<a>` — confirm out of scope for this change (recommend keep; track follow-up).

---

## Next Step

Ready for tasks (sdd-tasks).
