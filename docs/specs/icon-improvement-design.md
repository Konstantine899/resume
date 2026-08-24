# Design: Icon Component Improvement

**Change**: icon-improvements · **Status**: Draft · **Date**: 2026-08-07
**Scope source**: `icon-improvement-spec.md` (ICR-01..08) + `icon-improvement-proposal.md`

---

## Overview

Upgrade `src/shared/ui/Icon/` (9 files, closed `forwardRef<HTMLSpanElement, IconProps>` + `React.memo` over a hardcoded `<span>`) to the in-repo Senior+ standard by copying proven patterns from sibling slices: **Link** (generic polymorphic `component` prop + `ForwardedRef<ComponentRef<C>>` memo-cast + `lib/hooks/useLink` + self-guarded `validateLinkProps`), **Paragraph/Heading** (`useX` hook + thin component + memo-cast). The polymorphic a11y fork is the one novel piece: the interactive `<span role="button">` path (Enter/Space lift, `tabIndex`, `aria-pressed`, `data-interactive`) MUST be byte-identical when `component` defaults to `'span'`, and MUST lift off when a real element is rendered.

**Key verified facts (this session):**

- `Icon.tsx` currently renders `role = isInteractive ? 'button' : (decorative ? undefined : 'img')`, `tabIndex = isInteractive&&!disabled ? 0 : undefined`, `aria-pressed` only when interactive + `isPressed !== undefined`, `onKeyDown = handleKeyDown` (Enter/Space → `e.currentTarget.click()`), `data-testid = decorative ? undefined : 'icon-wrapper'`, and `data-interactive` ALWAYS present as boolean (tests assert `'true'` AND `'false'`).
- `data-interactive` must serialize to STRING `'true'/'false'` (tests assert `toHaveAttribute('data-interactive', 'false')`).
- `name` is a `LucideIcon` component; `getSizeInPixels` (xs12/sm16/md20/lg24/xl32) + `getColorValue` (preset → CSS var, else raw) are already the single transform path — no cross-slice churn.
- Link prod consumer (`Link.tsx:138`): `<Icon name={externalIcon || ExternalLink} size={iconSize} color="inherit" decorative />` — no `component`, no `ref`. Zero external `ref=` usage (grep-verified, spec).
- `ICON_CONSTANTS` already carries `VALID_SIZES`/`VALID_COLORS`/`VALID_STROKE_WIDTHS`/defaults — the validator consumes them, no new constants needed.

---

## Architecture

### File tree (before → after)

```
src/shared/ui/Icon/
├── index.ts                          MODIFY  (add useIcon + generic IconProps type export; keep getters/constants/Icon)
├── model/types.ts                    MODIFY  (IconOwnProps / IconProps<C> / IconHookProps / UseIconReturn)
├── model/constants.ts                UNCHANGED (ICON_CONSTANTS + getSizeInPixels/getColorValue already sufficient)
├── model/constants.test.ts           UNCHANGED (noop gate)
├── ui/Icon.tsx                       MODIFY  (thin; useIcon + memo-cast + a11y fork; drop inline useMemo)
├── ui/Icon.module.scss               UNCHANGED (classes stay; fork only changes which element receives them)
├── ui/Icon.test.tsx                  UNCHANGED (behavioral-noop gate — ~67 assertions)
├── ui/Icon.polymorphic.test.tsx      NEW     (polymorphic render/refs, @ts-expect-error, a11y lift-off, ICR-06/07)
├── ui/Icon.stories.tsx               UNCHANGED (5 stories, 100% plays — spec: no new stories)
├── ui/test-icons.ts                  UNCHANGED
├── lib/hooks/useIcon.ts              NEW     (ICR-04: single useMemo → { iconClassName, iconStyle, dataAttrs, ariaProps, isInteractive })
├── lib/hooks/useIcon.test.ts         NEW     (ICR-07 hook tests)
└── lib/utils/validateIconProps.ts    NEW     (ICR-05: self-guarded NODE_ENV dev validator)

docs/specs/ui-kit-contract.md         MODIFY  (ICR-08: Icon row — component, useIcon, validator)
```

### Dependency order (implementation batches per spec)

```
Phase 1 — Polymorphic core (~4h)
├── model/types.ts: IconOwnProps + generic IconProps<C> + hook types
├── ui/Icon.tsx: memo-cast (Link copy) + <Component ref> render + a11y fork (span EXACT)
├── ui/Icon.polymorphic.test.tsx FIRST (RED vs closed typing: `component` invalid prop → type-check fails)

Phase 2 — Hook + validator (~2.5h)
├── lib/hooks/useIcon.ts (single useMemo) + thin component rewrite
├── lib/utils/validateIconProps.ts (self-guarded)
├── Behavioral-noop gate: ~67 assertions + 5 plays green UNCHANGED

Phase 3 — Docs + verification (~1h)
├── ui-kit-contract.md Icon row
├── type-check:strict + lint:strict (0); analyze:dead-code; vitest Icon; Link consumer screenshot diff
```

---

## Per-requirement design

### ICR-01 — Polymorphic `component` prop

- **Files**: `model/types.ts`, `ui/Icon.tsx`.
- **Types** (model/types.ts):

```ts
export interface IconOwnProps {
  /** Иконка из lucide-react */
  name: LucideIcon;
  /** Размер в пикселях или preset (xs/sm/md/lg/xl) */
  size?: number | IconSize;
  /** Цвет из preset или кастомный CSS color */
  color?: string;
  /** Толщина линий (1–3) */
  strokeWidth?: IconStrokeWidth;
  /** Дополнительный CSS класс */
  className?: string;
  /** Альтернативный текст для доступности */
  ariaLabel?: string;
  /** Скрыть от скринридеров (декоративная иконка) */
  decorative?: boolean;
  /** Отключить интерактивность */
  disabled?: boolean;
  /** Обработчик клика (widened to HTMLElement for polymorphism) */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Состояние нажатия для toggle иконок */
  isPressed?: boolean;
  /** HTML id для якорных ссылок */
  id?: string;
}

export type IconProps<C extends ElementType = 'span'> = IconOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof IconOwnProps | 'component'> & { component?: C };
```

- Backward-compat: `IconProps` (no arg) = span props; `name` stays required; `size`/`color`/`strokeWidth`/`decorative`/`ariaLabel` untouched → Link consumer compiles unchanged.
- `component` name (NOT `as` — Tooltip/Popover/Slot own `as`; matches Button/Link precedent). Default `C='span'`.
- Render `<Component ref={ref} ...>` directly (Paragraph PAR-01 / Link precedent), replacing the hardcoded `<span>`.

### ICR-02 — Type-safe refs + memo-cast

- `ui/Icon.tsx` — copy Link's cast chain verbatim:

```ts
type IconComponent = <C extends ElementType = 'span'>(
  props: IconProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement;

function IconImpl<C extends ElementType = 'span'>(
  props: IconProps<C> & { ref?: ForwardedRef<ComponentRef<C>> },
  ref: ForwardedRef<ComponentRef<C>>
): ReactElement { … }

// forwardRef не умеет generic-функции — не-generic cast (Heading precedent)
const iconRef = forwardRef(
  IconImpl as unknown as ForwardRefRenderFunction<unknown, IconProps<'span'>>
);
// memo тоже не умеет generic — финальный cast восстанавливает типизацию
const IconMemo = memo(
  iconRef as unknown as (
    props: IconProps<'span'> & { ref?: ForwardedRef<HTMLSpanElement> }
  ) => ReactElement
);
IconMemo.displayName = 'Icon';
export const Icon = IconMemo as unknown as IconComponent;
```

- `ref.current` resolves to `HTMLSpanElement` (default) / `HTMLAnchorElement` (`component="a"`) / custom-component ref.

### ICR-03 — Polymorphic a11y/keyboard fork

- **Detection**: `const Component = (component || 'span') as ElementType; const isDefaultSpan = Component === 'span';` — the fork keys on the RESOLVED element, so explicit `component="span"` also takes the exact span path.
- **Span path (byte-identical)** — emit the current JSX unchanged: `role={isInteractive ? 'button' : decorative ? undefined : 'img'}`, `tabIndex={disabled ? undefined : isInteractive ? 0 : undefined}`, `aria-pressed`, `handleKeyDown` (Enter/Space lift), `onClick={disabled ? undefined : onClick}`, `data-testid`, `data-size`, `data-color`, `data-interactive`.
- **Non-span path** — forward consumer semantics only, no lift:

```tsx
return (
  <Component ref={ref} className={iconClassName} {...dataAttrs} {...ariaProps} {...restProps}>
    <IconComponentChild
      style={iconStyle}
      strokeWidth={strokeWidth}
      aria-hidden={decorative ? 'true' : undefined}
    />
  </Component>
);
```

`restProps` (which includes consumer `onClick`/`onKeyDown`/`role`/`tabIndex`/`id`) is spread verbatim — the real element decides its own semantics/focusability (`component="button"` keeps native role/focus, no injected `role="button"`/`tabIndex`). The internal Enter/Space `handleKeyDown` is NOT applied (native `<button>` already handles it).

### ICR-04 — `useIcon` hook

- **File**: `lib/hooks/useIcon.ts` (useLink / useParagraph precedent).
- **Signature**:

```ts
export interface IconHookProps {
  name: LucideIcon;
  size?: number | IconSize;
  color?: string;
  strokeWidth?: IconStrokeWidth;
  className?: string;
  decorative?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  component?: ElementType;
}
export interface UseIconReturn {
  iconClassName: string;
  iconStyle: React.CSSProperties; // { width, height, color } px/vars
  dataAttrs: Record<string, string>; // data-size, data-color, data-interactive (string!), data-as?
  ariaProps: { 'aria-hidden': true } | { 'aria-label': string | undefined };
  isInteractive: boolean; // onClick !== undefined && !disabled
}
```

- Single `useMemo` per value (useLink pattern): `iconClassName` (`classNames(styles.icon, disabled && styles.disabled, isInteractive && styles.clickable, className)`), `iconStyle`, `dataAttrs`, plus derived `isInteractive` and `ariaProps`. Validator called in dev only (guard internal). The component becomes thin.

### ICR-05 — `validateIconProps` dev validator

- **File**: `lib/utils/validateIconProps.ts` (useLink/Paragraph validator precedent).
- **Signature**: `export function validateIconProps(props: IconValidationProps): void` where `IconValidationProps = { size?: number | IconSize; color?: string; strokeWidth?: IconStrokeWidth; name?: LucideIcon }`.
- **Guard**: `if (process.env.NODE_ENV !== 'development') return;` at top (LNK-15/PAR-04 pattern) — callers need no guard.
- **Warns** (console.warn, non-throwing): `size` numeric must be `> 0` (or a valid `IconSize` via `ICON_CONSTANTS.VALID_SIZES`); `color` must be a valid `IconColor` preset or plausible CSS string (`#hex`/`rgb(`/CSS var/`currentColor`); `strokeWidth` must be in `ICON_CONSTANTS.VALID_STROKE_WIDTHS`; `name` must be a function/component (`typeof name === 'function'`).
- **Return**: none (`void`) — validation is dev-only; graceful fallback (`getSizeInPixels` → `ICON_SIZES.md`) remains in the runtime path.

### ICR-06/07 — Tests

- **Files**: `ui/Icon.polymorphic.test.tsx` (NEW) + `lib/hooks/useIcon.test.ts` (NEW); `Icon.test.tsx`/`constants.test.ts` UNCHANGED (noop gate).
- RED-first: polymorphic tests written BEFORE the generic impl — `component` is an invalid prop against the closed `IconProps`, so `type-check:strict` fails until ICR-01 lands (Link T2 precedent).
- `@ts-expect-error` probes: `<Icon component="span" href="/x">`; anchor-only attr on a custom component without it; (accept-probe) `component="a"` + `href` + `download` is valid.

### ICR-08 — Docs

- `docs/specs/ui-kit-contract.md` Icon row: add `component` prop, `useIcon` hook, `validateIconProps`, polymorphic refs.

---

## Deliverable decisions (explicit)

1. **useIcon location — `lib/hooks/useIcon.ts`** (NOT `model`). Matches `useLink`/`useParagraph`/`useSection` in-repo convention; validator sibling in `lib/utils/`. `model/` stays types + constants.
2. **IconOwnProps vs IconProps split** — `IconOwnProps` (closed Icon-specific surface, `onClick` to `MouseEvent<HTMLElement>`) + generic `IconProps<C = 'span'> = IconOwnProps & Omit<ComponentPropsWithRef<C>, keyof IconOwnProps | 'component'> & { component?: C }` + `IconHookInputProps`/`UseIconReturn`. Memo-cast per Link (ICR-02). Justification: only the `component` default needs generics; own props stay closed; `onClick` widening is runtime-noop (TS only).
3. **a11y fork detection — `Component === 'span'` on the RESOLVED element** (`const Component = (component || 'span') as ElementType`). Covers both implicit default and explicit `component="span"`. Non-span forwards `onClick`/`onKeyDown`/`role`/`tabIndex` via `restProps` with zero auto-lift.
4. **`data-interactive` serialized as STRING boolean** — `{ 'data-interactive': String(isInteractive) }` — required by existing tests asserting `'false'`. `dataAttrs` typed `Record<string, string>`. `data-as` added only when `typeof component === 'string'` (like the Link pattern) — absent on the default span → byte-identical.
5. **Validator placement — `lib/utils/validateIconProps.ts`**, consumed by `useIcon` (single call site). Consumes existing `ICON_CONSTANTS.VALID_*`; no new constants, no public export from `index.ts` (`useIcon` IS exported from index for testability — Link precedent).
6. **`aria-pressed` stays span-path-only** — part of the interactive span a11y coordinate; non-span consumers manage their own via `restProps`.
7. **`data-testid` stays span-path-only** (computed from `decorative`) — test infra for the default element; non-span consumers query by role/element. No test breakage (existing tests never pass `component`).
8. **Hook return shape** — `{ iconClassName, iconStyle, dataAttrs, ariaProps, isInteractive }` per ICR-04; `iconStyle` computed via `getSizeInPixels`/`getColorValue` (single source, unchanged).
9. **Test organization** — `Icon.test.tsx` (~67 assertions) + `constants.test.ts` untouched; NEW `Icon.polymorphic.test.tsx` (polymorphic 4, refs 2–3, compile 2–3, a11y lift-off 2) + `useIcon.test.ts` (4–5). Storybook plays: 5 existing, 0 new (spec: stories unchanged).
10. **`disabled` in non-span path** — forwarded as-is; native semantics (e.g. `<button disabled>`) handle gating. Span path keeps `onClick={disabled ? undefined : onClick}` EXACTLY.

---

## Data flow (useIcon internals)

```
<Icon name={Home} onClick={fn} component="button" ariaLabel="Go">
  ├─ validateIconProps({ size, color, strokeWidth, name })   [guard inside, dev-only]
  ├─ isInteractive = onClick !== undefined && !disabled
  ├─ iconStyle  = { width: getSizeInPixels(size), height: getSizeInPixels(size), color: getColorValue(color) }
  ├─ iconClassName = classNames(styles.icon, disabled&&styles.disabled,
  │                              isInteractive&&styles.clickable, className)
  ├─ dataAttrs  = { 'data-size': size, 'data-color': color,
  │                 'data-interactive': String(isInteractive),
  │                 ...(typeof Control==='string' && { 'data-as': component }) }
  ├─ ariaProps  = decorative ? { 'aria-hidden': true } : { 'aria-label': ariaLabel }
  │
  ├─ Component = component || 'span'
  │
  ├─ Component === 'span' ?  (default — EXACT)
  │     <span ref id className onClick={disabled?undefined:onClick} onKeyDown={handleKeyDown}
  │           tabIndex role aria-pressed data-testid {...dataAttrs} {...ariaProps}>
  │       <LucideIcon style={iconStyle} strokeWidth aria-hidden={decorative}/>
  │     </span>
  │
  └─ else  (real element — native semantics, no lift)
        <Component ref className {...dataAttrs} {...ariaProps} {...restProps}>
          <LucideIcon style={iconStyle} strokeWidth aria-hidden={decorative}/>
        </Component>
```

---

## Test plan (Decision 9)

| File                               | Covers                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ui/Icon.test.tsx`                 | ~67 existing assertions — **UNCHANGED (behavioral-noop gate)**                                                                                                                                                                                                                                                                                         |
| `model/constants.test.ts`          | existing — UNCHANGED                                                                                                                                                                                                                                                                                                                                   |
| `ui/Icon.polymorphic.test.tsx` NEW | polymorphic render (a/span/custom comp + element props, 4); ref-per-`component` (2–3: `HTMLSpanElement` default, `HTMLAnchorElement`, custom); `@ts-expect-error` compile (2–3: `href` on span, anchor-attr on custom); a11y lift-off (2: `component="button"` gets NO injected `role="button"`/`tabIndex`, native attrs preserved; onClick forwarded) |
| `lib/hooks/useIcon.test.ts` NEW    | hook return shape: iconClassName mapping, iconStyle px/var, dataAttrs incl. `'data-interactive':'false'`, dev-warn on invalid size/color/strokeWidth/name, no-warn in production (4–5)                                                                                                                                                                 |
| `Link` integration                 | prod site (`Link.tsx:138`) compiles + byte-identical DOM; no `component` prop passed                                                                                                                                                                                                                                                                   |
| `npm run storybook:test`           | 5 existing plays stay green                                                                                                                                                                                                                                                                                                                            |
| `analyze:dead-code`                | no new dead names from index changes                                                                                                                                                                                                                                                                                                                   |

---

## Risks

| Risk                                         | Mitigation                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| Generic + `memo` incompatibility             | Link/Heading/Button memo-cast, copy verbatim (ICR-02)                            |
| a11y fork regresses `<span role="button">`   | `Component === 'span'` byte-identical branch; `component="button"` lift-off test |
| `data-interactive` boolean → string coercion | `String(isInteractive)`; existing tests assert `'false'` string                  |
| Ref-type widening breaks strict consumers    | grep: zero external `ref=` usage on Icon; TS-error-first, runtime noop           |
| `useIcon` refactor regression                | Behavioral-noop gate: ~67 assertions + 5 plays pass unchanged                    |
| Link consumer break                          | byte-identical default element; no `component` at Link site; screenshot diff     |

---

## Migration / Rollout

No data migration. Single PR per concern (types/core → hook/validator → tests/docs) so any revert is surgical: `git revert <core-commit>` restores the closed `<span>`; `component` prop is additive and drop-worthy; validator (ICR-05) is dev-only (`NODE_ENV`), removal is a drop.

## Dependencies

- **In-repo only**: Link (memo-cast, `useLink`, validator pattern), Button (`useButton`), Paragraph (`useParagraph`/`useSection`), `@/shared/lib/utils/classNames`. No new npm packages.
- **Precedent copies**: Link memo-cast chain, Link/Button validator guard, Button hook shape.

## Open Questions

- [ ] None blocking. (Spec resolved: `component` naming, fork semantics, no consumer adoption, stories unchanged. Two follow-ups tracked separately: consumer adoption of raw-icon sites; size-map harmonization `xl=28` vs `32`.)

---

## Next Step

Ready for tasks (sdd-tasks).
