# Design: Aspect Ratio

**Change**: aspect-ratio · **Status**: Draft · **Date**: 2026-08-09
**Scope source**: `docs/specs/aspect-ratio-spec.md` (AR-01..AR-09)
**Non-breaking gate**: brand-new slice — zero existing consumers, zero existing tests; nothing in the current codebase changes.

## Overview

Add `src/shared/ui/AspectRatio/` — a 9-file Divider-parity slice locking content into a fixed ratio (native CSS `aspect-ratio` from an inline style computed by a hook, with an absolute-fill `.content` layer). Copies proven in-repo patterns only: Divider (polymorphic `as`, memo-cast, `useX` hook + self-guarded validator, SCSS module), Paragraph (ref-as-prop + `ComponentRef<C>`). Fully additive; `git revert` removes the slice with zero fallout.

## Verified facts (this session)

- **Divider structure** (8 files) mirrors the spec's 9-file layout; `lib/hooks` + `lib/utils` nested dirs confirmed.
- **Memo-cast**: `memo(refOrFn as unknown as (props: Props<'div'> & { ref?: ForwardedRef<HTMLElement> }) => ReactElement)` → `export const X = Memo as unknown as XComponent` (`Divider.tsx:74-89`).
- **Modern ref impl**: Paragraph uses React-19 ref-as-prop with `ref?: ForwardedRef<ComponentRef<C>>` + `<Tag ref={forwardedRef as Ref<ComponentRef<C>>}>` (`Paragraph.tsx:24,91`) — AR-02 target.
- **Hook pattern**: `validateXProps` self-guarded (`NODE_ENV !== 'development'`) called OUTSIDE `useMemo`; computed values inside (`useDivider.ts:46-87`).
- **classNames util** at `@/shared/lib/utils/classNames` (`classNames` + `cn` aliases; plain-string join).
- **Container anti-pattern confirmed**: `Container/index.ts:7` exports `validateContainerProps` publicly — the pattern AR-07 rejects. Divider's index does NOT export its validator — the pattern to copy.
- **jsdom**: `vitest.config.ts` → `environment: 'jsdom'`, `setupFiles: src/tests/setup.ts`, `@` alias `src`. `toHaveStyle({ aspectRatio: '4 / 3' })` compares the inline style string — works without layout engine.
- **Tokens**: `_theme.scss` defines both themes; `.content` fill layer needs no tokens (spec-confirmed).

## Architecture

### File tree (all NEW)

```
src/shared/ui/AspectRatio/
├── index.ts                        NEW  (AspectRatio, types, DEFAULT_RATIO, useAspectRatio — no validator)
├── model/types.ts                NEW  (AspectRatioString, AspectRatioOwnProps, BaseProps<C>, Props<C>, Component)
├── model/constants.ts            NEW  (DEFAULT_RATIO = '16/9')
├── lib/hooks/useAspectRatio.ts   NEW  (→ { ratioStyle, boxClassName, dataAttrs }; calls validator)
├── lib/utils/validateAspectRatioProps.ts NEW (self-guarded, regex /^\d+\/\d+$/, internal-only)
├── ui/AspectRatio.tsx            NEW  (thin; memo-cast + <Component ref> + fill layer)
├── ui/AspectRatio.module.scss    NEW  (.box + .content)
├── ui/AspectRatio.test.tsx       NEW  (~12 unit tests)
└── ui/AspectRatio.stories.tsx    NEW  (4 stories + plays)
docs/specs/ui-kit-contract.md     MODIFY (inventory 25th row + ### AspectRatio specifics after Image)
```

**Dependency order**: types/constants → SCSS → validator → hook → component → tests → stories → docs (spec Phase 1-7).

## Per-requirement design

### AR-01/AR-02 — Polymorphic `as` + refs

Divider-type split + Paragraph impl shape:

```ts
// model/types.ts
export type AspectRatioString = `${number}/${number}`;
export interface AspectRatioOwnProps {
  /** @required — ratio like "16/9" (runtime fallback DEFAULT_RATIO + dev-warn) */
  ratio: AspectRatioString;
  className?: string;
}
export type AspectRatioBaseProps<C extends ElementType = 'div'> = { as?: C } & AspectRatioOwnProps;
export type AspectRatioProps<C extends ElementType = 'div'> = AspectRatioBaseProps<C> &
  Omit<ComponentPropsWithRef<C>, keyof AspectRatioOwnProps | 'as' | 'ref'>;
export type AspectRatioComponent = (<C extends ElementType = 'div'>(
  props: AspectRatioProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & { displayName?: string };

// ui/AspectRatio.tsx — Paragraph impl shape
function AspectRatioImpl<C extends ElementType = 'div'>(
  {
    as,
    ratio,
    className,
    style: userStyle,
    children,
    ...restProps
  }: AspectRatioProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
  // no second arg: React 19 ref-as-prop
): ReactElement;
```

Impl reads `ref: forwardedRef` from props, `const Component = (as || 'div') as ElementType;` (Divider line 57). Memo-cast copies Divider verbatim; `displayName = 'AspectRatio'`; public export cast to `AspectRatioComponent`. Ref resolves per `as` via `ComponentRef<C>` (typed — `HTMLElement` for `HTMLDivElement` default).

### AR-03 — `ratio` + fallback

`ratio: AspectRatioString` REQUIRED at the type level (TS error when omitted); runtime `ratio ?? DEFAULT_RATIO` guards `as any` misuse. Canonicalization (Decision 3): input `'4/3'` → style `aspectRatio: '4 / 3'` (`'4 '` slash `' 3'`), keeping `data-aspect-ratio` RAW (`'4/3'`). NOTE: template type `${number}` admits floats/exponents (`1e3/2`) the regex `/^\d+\/\d+$/` rejects — runtime validator is the guard.

### AR-04 — Hook

```ts
interface UseAspectRatioParams {
  ratio?: AspectRatioString;
  className?: string;
  as?: ElementType;
}
interface UseAspectRatioReturn {
  ratioStyle: CSSProperties;
  boxClassName: string;
  dataAttrs: Record<string, string>;
}
// lib/hooks/useAspectRatio.ts
validateAspectRatioProps({ ratio: ratio ?? DEFAULT_RATIO }); // outside useMemo, self-guarded
useMemo(() => {
  const resolved = ratio ?? DEFAULT_RATIO;
  return {
    ratioStyle: { aspectRatio: canonicalRatio(resolved) }, // '16 / 9'
    boxClassName: classNames(styles.box, className), // consumer LAST
    dataAttrs: { 'data-aspect-ratio': resolved, ...(typeof as === 'string' && { 'data-as': as }) },
  };
}, [ratio, className, as]);
```

### AR-05 — Data attrs

`data-aspect-ratio` always (`ratio ?? DEFAULT_RATIO`, raw); `data-as` only `typeof as === 'string'` — absent on default `div`.

### AR-06 — SCSS layers

```scss
.box {
  position: relative;
  width: 100%;
  overflow: hidden;
} /* aspect-ratio inline */
.content {
  position: absolute;
  inset: 0;
} /* fill layer */
```

### AR-07 — Validator

`validateAspectRatioProps({ ratio })` — self-guarded top (`if (process.env.NODE_ENV !== 'development') return;`), regex `/^\d+\/\d+$/`, non-throwing `// eslint-disable-next-line no-console` `console.warn` naming the invalid ratio + `DEFAULT_RATIO`. NOT exported from `index.ts` (Container anti-pattern rejected).

### AR-08 — Stories (4, plays)

`Default` (16/9 + playbox), `Polymorphic` (`as="article"`/`"section"` + `data-as` plays), `RatioVariants` (4/3, 1/1, 21/9 table + attr plays), `ContentFill` (full-bleed img inside `.content`). All in `Shared/UI/AspectRatio`, `tags: ['autodocs']`, sync assertions only.

### AR-09 — Tests (~12)

| #     | Case                                                                                         | Assert    |
| ----- | -------------------------------------------------------------------------------------------- | --------- |
| 1-2   | `ratio="4/3"` → `toHaveStyle({ aspectRatio: '4 / 3' })`; `as any` omission → `'16 / 9'`      | style     |
| 3-5   | default `div`; `as="article"` + forwarded `title`; custom component receives className+props | element   |
| 6-7   | default ref `HTMLDivElement`; `as="article"` ref element                                     | ref       |
| 8     | `data-aspect-ratio="4/3"` always; `data-as` absent on default, `data-as="aside"` string-only | attrs     |
| 9     | consumer className merged last                                                               | class     |
| 10-12 | validator: dev-warn invalid ('abc'), prod no-warn, regex reject `1.5/2`                      | validator |

## Deliverable decisions

| #   | Decision                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Ratio canonicalization** for `ratioStyle`: `'4/3'` → `{ aspectRatio: '4 / 3' }` (spaced); `data-aspect-ratio` keeps raw. Satisfies the `toHaveStyle` scenario verbatim.                                 |
| 2   | **Impl shape = Paragraph** (function + ref-as-prop + `ComponentRef<C>`), memo-cast Divider copy — newest in-repo standard; AR-01/02 both met.                                                             |
| 3   | **`ratio` required** at type level; `DEFAULT_RATIO` runtime fallback only.                                                                                                                                |
| 4   | **Hook fields**: `ratioStyle` / `boxClassName` / `dataAttrs` (spec delta honored; `ratioStyle` carries `{ aspectRatio }`).                                                                                |
| 5   | **Style merge**: `{ ...ratioStyle, ...userStyle }` — consumer `style` wins (useDivider precedent).                                                                                                        |
| 6   | **index.ts**: exports `AspectRatio`, `AspectRatioProps/OwnProps/Component`, `AspectRatioString`, `DEFAULT_RATIO`, `useAspectRatio`. Validator NOT exported — confirmed (Container anti-pattern rejected). |
| 7   | **`data-as` on string `as` only**; consumer className last; `.content` always rendered for children.                                                                                                      |

## Data flow / DOM output

```
<AspectRatio ratio="4/3" as="article" className="x" style={{maxWidth:480}}>
  ├─ validateAspectRatioProps → dev-warn if invalid (guard inside)          [AR-07]
  ├─ useAspectRatio → ratioStyle {aspectRatio:'4 / 3'}, boxClassName, dataAttrs [AR-04]
  ├─ Component = 'article'; merged style {aspectRatio, maxWidth}            [D2,D6]
  └─ render
      <article class="box_h1s x" data-aspect-ratio="4/3" data-as="article"
               style="aspect-ratio: 4 / 3; max-width: 480px">
        <span class="content_2fk">children</span>   ← absolute fill (inset:0)
      </article>
```

## Test plan

| Layer       | What                                | How                                                     |
| ----------- | ----------------------------------- | ------------------------------------------------------- |
| Unit        | AR-03/05/06/09 (12 tests)           | `npx vitest run src/shared/ui/AspectRatio`              |
| Interaction | 4 story plays                       | `npm run storybook:test`                                |
| Static      | types/lint/dead-code                | `type-check:strict`, `lint:strict`, `analyze:dead-code` |
| Docs        | contract row 25 + specifics section | diff review                                             |

## Threat Matrix

**N/A** — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No data migration, no flags. Single fully-additive PR. Rollback: `git revert <commit>` — with zero consumers nothing else touched; docs revert trivially. Per-region guard: component → tests → stories → docs commits.

## Risks

| Risk                                | Impact            | Mitigation                                            |
| ----------------------------------- | ----------------- | ----------------------------------------------------- |
| `aspect-ratio` unsupported (legacy) | Low               | jsdom + modern baseline; spec excludes legacy plugins |
| Regex vs `${number}` type gap       | Low               | validator is runtime gate; test `'1.5/2'` rejected    |
| `toHaveStyle` spacing mismatch      | Low               | D1 canonicalization → exact `' / '` string            |
| Generic + `memo`                    | Blocking (if hit) | Divider/Paragraph memo-cast copy                      |
| Storybook flake on plays            | Low               | sync assertions only; no timers                       |

## Dependencies / skills

- **In-repo copies**: Divider (memo-cast, hook+validator, SCSS module), Paragraph (`ComponentRef<C>`), `classNames`.
- **No new npm packages**.
- **Skills (task phase)**: `component-boilerplate` (scaffold), `test-generation` (AR-09 tests), `storybook-setup` (AR-08 stories+plays).

## Open Questions

None. CSS class names resolved to `.box`/`.content`; index exports locked per D6.

## Next Step

Ready for tasks (sdd-tasks-deepseek).
