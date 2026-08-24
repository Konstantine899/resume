# Button Component Improvement Specification

**Change**: button-improvements  
**Status**: Draft  
**Date**: 2026-07-26  
**Priority**: CRITICAL + MEDIUM (9 items, ~20h estimated)

---

## Scope

This specification covers improvements #1–#9 from the Button analysis. Items #10–#13 (OPTIONAL) are deferred.

| #   | Improvement                                | Priority | Effort | Type     |
| --- | ------------------------------------------ | -------- | ------ | -------- |
| 1   | Polymorphic `component` prop with generics | CRITICAL | 6h     | ADDED    |
| 2   | Type-safe ref forwarding                   | CRITICAL | 1h     | MODIFIED |
| 3   | Interactive play tests in Storybook        | CRITICAL | 2h     | ADDED    |
| 4   | Tests for polymorphic rendering            | CRITICAL | 2h     | ADDED    |
| 5   | `useButton` hook                           | MEDIUM   | 4h     | ADDED    |
| 6   | `ButtonLoader` component                   | MEDIUM   | 2h     | ADDED    |
| 7   | Polymorphic stories                        | MEDIUM   | 1h     | ADDED    |
| 8   | Real-world use case stories                | MEDIUM   | 1h     | ADDED    |
| 9   | Icon size inference                        | MEDIUM   | 1h     | MODIFIED |

---

## ADDED Requirements

### Requirement: Polymorphic `component` prop

The system SHALL add a polymorphic `component` prop to all three Button variants (`Button`, `ButtonWithIcon`, `IconButton`), enabling rendering as semantic HTML elements (`<a>`, `<button>`, `<div>`) or React components (`<Link>`) while preserving Button styling and behavior.

The system SHALL use React's `ComponentPropsWithoutRef` + a generic `C extends React.ElementType` pattern:

```typescript
type PolymorphicProps<C extends React.ElementType, P = Record<string, never>> = {
  component?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof P> &
  P;
```

The system SHALL NOT use the `as` prop name — `component` is the chosen API name to avoid conflicts with CSS-in-JS libraries and to match MUI's established convention.

#### Scenario: Button renders as `<a>` with `href`

- GIVEN a `Button` with `component="a"` and `href="/about"`
- WHEN the component renders
- THEN the root element MUST be an `<a>` tag, not `<button>`

#### Scenario: Button renders as `<button>` by default

- GIVEN a `Button` with no `component` prop
- WHEN the component renders
- THEN the root element MUST be `<button>` (backward compatible)

#### Scenario: TypeScript infers correct props for `component="a"`

- GIVEN a `Button` with `component="a"`
- WHEN the consumer passes `href`, `target`, or `rel` props
- THEN TypeScript MUST NOT report type errors
- AND WHEN the consumer passes `type="submit"` (a button-only prop)
- THEN TypeScript SHOULD report a type error

#### Scenario: Polymorphic component passes rest props to the rendered element

- GIVEN a `Button` with `component="a"`, `href="/about"`, `target="_blank"`, `rel="noopener"`
- WHEN the component renders
- THEN the `<a>` element MUST have all three attributes: `href`, `target`, `rel`

### Requirement: Interactive play tests in Storybook

The system SHALL add Storybook interaction tests (`play` functions using `@storybook/test`) to ALL existing and new stories. Currently only `Primary`, `Disabled`, `LoadingWithSpinner`, and `LoadingWithSkeleton` have play functions — 16 of ~20 stories lack them.

#### Scenario: All variant stories have play assertions

- GIVEN each variant story (`Secondary`, `Outline`, `Ghost`, `Danger`)
- WHEN the story renders
- THEN the play function MUST assert the button is rendered with the correct variant class

#### Scenario: Size stories assert correct dimensions

- GIVEN each size story (`Small`, `Medium`, `Large`)
- WHEN the story renders
- THEN the play function MUST assert the button renders with the correct size class

#### Scenario: Composite stories have play assertions

- GIVEN the `AllVariants` and `AllSizes` stories
- WHEN the story renders
- THEN the play function MUST assert all rendered buttons are present

### Requirement: Tests for polymorphic rendering

The system SHALL add test coverage for the polymorphic `component` prop across all three Button components.

#### Scenario: Button renders as `<a>` element

- GIVEN `Button` with `component="a"` and `href="/test"`
- WHEN rendered
- THEN `screen.getByRole('link')` MUST find the element
- AND the element MUST have `href="/test"`

#### Scenario: IconButton renders as `<a>` element

- GIVEN `IconButton` with `component="a"`, `href="/test"`, valid `icon`/`ariaLabel`
- WHEN rendered
- THEN the element MUST be a link with `href="/test"`
- AND it MUST have `aria-label` from `ariaLabel` prop

#### Scenario: Polymorphic component preserves existing Button styles

- GIVEN `Button` with `component="a"`, `variant="primary"`, `size="lg"`
- WHEN rendered
- THEN the element MUST have the same CSS classes as a non-polymorphic Button

### Requirement: `useButton` hook

The system SHALL extract a shared `useButton` hook into `Button/model/useButton.ts` consolidating duplicated logic: className computation, guarded click handler, loader rendering, loading state.

#### Scenario: Hook returns computed className

- GIVEN `useButton({ variant: 'primary', size: 'lg', loading: true, fullWidth: true })`
- WHEN called
- THEN the returned `buttonClassName` MUST contain all relevant CSS module classes

#### Scenario: Hook returns guarded click handler

- GIVEN `useButton({ disabled: true })` with the returned `handleClick`
- WHEN the click handler is called
- THEN the original `onClick` MUST NOT be invoked

#### Scenario: Components work identically after refactor

- GIVEN the three Button components refactored to use `useButton`
- WHEN all existing tests are re-run
- THEN zero tests MUST fail — the refactor is behavioral-noop

### Requirement: `ButtonLoader` component

The system SHALL extract a `ButtonLoader` component into `Button/ui/ButtonLoader/` isolating spinner/skeleton rendering.

#### Scenario: ButtonLoader renders Spinner for loadingVariant="spinner"

- GIVEN `ButtonLoader` with `loadingVariant="spinner"`
- WHEN rendered
- THEN a Spinner with `label="Loading"` MUST be present

#### Scenario: ButtonLoader renders null when loading is false

- GIVEN `ButtonLoader` with `loading={false}`
- WHEN rendered
- THEN nothing MUST render

### Requirement: Polymorphic stories (2–3 new)

#### Scenario: Button as link has correct accessibility

- GIVEN the "As Link" story with `component="a"` and `href="https://example.com"`
- WHEN the play function runs
- THEN `screen.getByRole('link')` MUST find the element
- AND it MUST have `href="https://example.com"`

### Requirement: Real-world use case stories (2 new)

#### Scenario: Form submit story

- GIVEN the "Form Submit" story rendering a Button inside a form
- WHEN the play function runs
- THEN the button MUST have `type="submit"`

---

## MODIFIED Requirements

### Requirement: Type-safe ref forwarding

The current `forwardRef<HTMLButtonElement, ButtonProps>` always types the ref as `HTMLButtonElement`. The system SHALL make the ref type depend on the `component` prop's resolved element type.

(Previously: Ref always resolves to `HTMLButtonElement` regardless of rendered element)

#### Scenario: Ref type matches rendered element type

- GIVEN `Button` with `component="a"` and a ref callback
- WHEN rendered
- THEN the ref callback MUST receive an `HTMLAnchorElement`

#### Scenario: Existing button ref usage continues to work

- GIVEN current consumers using `ref` with `Button` (default `component="button"`)
- WHEN they upgrade
- THEN no type errors MUST appear

### Requirement: Icon size inference

`IconButton` and `ButtonWithIcon` currently require consumers to manually set icon sizes. The system SHOULD auto-infer icon size from the Button's `size` prop when the icon accepts a `size` prop.

Mapping: `sm` → `16`, `md` → `20`, `lg` → `24`

(Previously: Icon size is always set manually by the consumer)

#### Scenario: IconButton auto-sizes icon

- GIVEN `IconButton` with `icon={<Mail />}` and `size="lg"`
- WHEN rendered
- THEN the Mail icon SHOULD have `size={24}`

#### Scenario: Manual icon size override takes precedence

- GIVEN `IconButton` with `icon={<Mail size={32} />}` and `size="md"`
- WHEN rendered
- THEN the Mail icon MUST have `size={32}`

---

## Technical Approach: Polymorphic `component` Prop

### Type Pattern

```typescript
type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // ... other existing props
};

type PolymorphicProps<C extends React.ElementType, P = Record<string, never>> = {
  component?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof P> &
  P;
```

### ForwardedRef Pattern

```typescript
function ButtonImpl<T extends React.ElementType = 'button'>(
  props: PolymorphicProps<T, ButtonOwnProps>,
  ref: React.ForwardedRef<React.ComponentRef<T>>
): React.ReactElement;
```

### Implementation Notes

1. **CSS-only**: No new styles — reuses existing `buttonClassName`
2. **`type` prop**: Only forwarded when `component` is `'button'` (or default)
3. **`disabled` on `<a>`**: Use `aria-disabled` + `pointer-events: none` via class, because `<a>` has no `disabled` attribute
4. **`memo` compatibility**: `React.memo` does not support generic components. Use explicit cast: `React.memo(ButtonImpl as React.FC<any>)` or restructure to non-generic display wrapper
5. **`className` merging**: Consumer's `className` appended via `classNames()` — no override

### Breaking Changes Assessment

| Change                    | Breaking?                                                               | Mitigation                                          |
| ------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------- |
| `component` prop added    | **NO** — optional, defaults to `'button'`                               | Existing `<Button>` usage unchanged                 |
| `useButton` extraction    | **NO** — behavioral noop                                                | Run full test suite                                 |
| `ButtonLoader` extraction | **NO** — behavioral noop                                                | Run full test suite                                 |
| Icon size inference       | **NO** — only activates when icon has no explicit `size`                | Manual size still works                             |
| Ref type change           | **POTENTIALLY** — consumers with explicit `HTMLButtonElement` ref types | Breaking only with `component="a"` + wrong ref type |

---

## Test Expectations

| Area                           | Component      | Tests | Type |
| ------------------------------ | -------------- | ----- | ---- |
| Polymorphic rendering          | Button         | 3–4   | Unit |
| Polymorphic ref types          | Button         | 1–2   | Unit |
| Polymorphic + IconButton       | IconButton     | 2     | Unit |
| Polymorphic + ButtonWithIcon   | ButtonWithIcon | 2     | Unit |
| Polymorphic style preservation | Button         | 1     | Unit |
| Icon size inference            | IconButton     | 2     | Unit |
| Icon size inference            | ButtonWithIcon | 2     | Unit |
| `useButton` hook               | model/         | 4–5   | Unit |
| `ButtonLoader`                 | ButtonLoader   | 3     | Unit |

Existing tests MUST remain unchanged through the `useButton`/`ButtonLoader` refactor.

---

## Storybook Requirements

| Story             | Play?    | Assertions                    |
| ----------------- | -------- | ----------------------------- |
| Secondary         | ADD play | Renders, correct variant      |
| Outline           | ADD play | Renders, correct variant      |
| Ghost             | ADD play | Renders, correct variant      |
| Danger            | ADD play | Renders, correct variant      |
| Small             | ADD play | Renders, correct size         |
| Medium            | ADD play | Renders, correct size         |
| Large             | ADD play | Renders, correct size         |
| FullWidth         | ADD play | Has fullWidth class           |
| AllVariants       | ADD play | All variant buttons present   |
| AllSizes          | ADD play | All size buttons present      |
| As Link (NEW)     | YES      | `role="link"`, `href` present |
| Form Submit (NEW) | YES      | `type="submit"`               |

---

## Implementation Order

```
Phase 1 (~6h) — Polymorphic core
├── Add PolymorphicProps type to model/types.ts
├── Refactor Button for polymorphic component prop
├── Add polymorphic unit tests
├── Refactor IconButton and ButtonWithIcon

Phase 2 (~3h) — Ref forwarding + type safety
├── Make ref type depend on component generic
├── Add ref type tests
├── Handle non-button attributes (data-* for a/div)

Phase 3 (~6h) — Hook + Loader extraction
├── Create useButton hook
├── Create ButtonLoader component
├── Refactor all 3 components to use hook + loader
├── Run full test suite — zero regressions

Phase 4 (~1h) — Icon size inference
├── Add size→icon mapping in useButton
├── Add icon size tests

Phase 5 (~4h) — Stories
├── Add play functions to all existing stories
├── Add polymorphic stories (At least 1)
├── Add real-world stories (At least 1)
```

---

## Risk Assessment

| Risk                                               | Impact   | Mitigation                                    |
| -------------------------------------------------- | -------- | --------------------------------------------- |
| Generic `component` + `React.memo` incompatibility | Blocking | Use explicit memo cast or non-generic wrapper |
| `<a>` has no `disabled` attribute                  | Medium   | `aria-disabled` + `pointer-events: none`      |
| Ref type widening breaks strict consumers          | Low      | TypeScript error first, runtime noop          |
| `forwardRef` with generics — TypeScript limitation | Medium   | Use function overload pattern                 |
