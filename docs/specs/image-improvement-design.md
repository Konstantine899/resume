# Design: Image Component Improvement

**Change**: image-improvements · **Status**: Draft · **Date**: 2026-08-09
**Scope source**: `docs/specs/image-improvement-spec.md` (IMG-01..10)
**Non-breaking gate**: 68 existing tests in `Image.test.tsx` (650 lines) pass UNCHANGED; 5 consumers untouched (Avatar, AvatarImage, AvatarAbout, AvatarHero, CardImage — all `import { Image }`, grep-verified; zero default imports anywhere).

## Verified facts (this session)

- Default exports: `Image.tsx:243`, `useImageLoading.ts:192`, `imageValidation.ts:169`. Zero default-import consumers.
- The IMG-02 knip set references ONLY their declarations + `index.ts` (no test/story/consumer) → removal is safe; `IMAGE_CONSTANTS` is an aggregator, so deleting it also removes its nested 3 (`PLACEHOLDER_CONFIG`, `SUPPORTED_IMAGE_TYPES`, `ARIA_DEFAULTS`).
- `INTERSECTION_OBSERVER_CONFIG`/`IMAGE_DEFAULTS` consumed by `useImageLoading`; `IMAGE_SIZE_VALUES`/`IMAGE_VARIANT_RADIUS` by `Image.tsx`; `IMAGE_VARIANTS/SIZES/OBJECT_FITS/PLACEHOLDERS/LAZY_MODES` + `VALIDATION_MESSAGES` by `imageValidation.ts` — ALL KEPT.
- `IMG-04` gate: `Image.test.tsx:501-506` asserts only `src` (srcSet absence not asserted) → green after fix.
- `IMG-08` gate: `Image.test.tsx:533-541` asserts `aria-describedby` truthy — VERIFIED kept truthy.
- `validateImageProps/normalizeImageProps/logValidationWarnings` are NOT called in `Image.tsx` render path (dev-only surface) — index removal has zero runtime impact.
- Locale files: 47 flat keys each; no `imageNotAvailable` key yet. 22 stories (count verified in stories file), 0 plays.

## Architecture

```text
src/shared/ui/Image/
├── index.ts                      MODIFY  (IMG-01/02/03: named-only surface)
├── ui/Image.tsx                  MODIFY  (IMG-04 srcSet, IMG-06 i18n, IMG-08 aria id, IMG-10 hook)
├── ui/Image.module.scss          UNCHANGED (fallback/placeholder classes kept)
├── ui/Image.test.tsx             UNCHANGED (68-gate — no-op)
├── ui/Image.improvements.test.tsx NEW    (IMG-04/08/06/10 tests)
├── ui/Image.stories.tsx          MODIFY  (IMG-07: 6 plays)
├── model/types.ts                UNCHANGED (src union already `string | {src; srcSet?}`)
├── model/constants.ts            MODIFY  (IMG-02: drop PLACEHOLDER_CONFIG, SUPPORTED_IMAGE_TYPES, ARIA_DEFAULTS, IMAGE_CONSTANTS)
├── lib/hooks/useImageLoading.ts  MODIFY  (IMG-01 default; IMG-02 drop useImageLoadingSimple)
├── lib/hooks/useImageRender.ts   NEW     (IMG-10 OPTIONAL)
├── lib/hooks/useImageRender.test.ts NEW  (IMG-10)
└── lib/utils/imageValidation.ts  MODIFY  (IMG-01 default)

docs/specs/ui-kit-contract.md     MODIFY  (IMG-09 Image specifics section)
src/shared/lib/i18n/locales/{en,ru}.json MODIFY (IMG-06 key)
```

## Decisions

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Rationale                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --- | --------------------------------------------------- |
| 1   | **Resolved-src single source** (IMG-04): `const resolvedSrc = typeof src === 'string' ? { src, srcSet: undefined } : src;` → `<img src={resolvedSrc.src} srcSet={resolvedSrc.srcSet} …>`                                                                                                                                                                                                                                                                                  | Object `srcSet` currently dropped (`:81,219`). `srcSet={undefined}` omits the attr for string form (test-scen. 2 asserted). Place `srcSet` BEFORE `{...restProps}` so explicit native `srcSet`/`sizes` still win (string passthrough unchanged, IMG-04-03). |
| 2   | **Hook still receives `src.src`**: `useImageLoading({ src: typeof src === 'string' ? src : src.src …})` unchanged                                                                                                                                                                                                                                                                                                                                                         | Loading key must ignore `srcSet`; zero diff.                                                                                                                                                                                                                |
| 3   | **i18n (IMG-06)**: `const { t } = useTranslation()` from `react-i18next` inside `Image.tsx` (shared→shared FSD-valid); key `imageNotAvailable` (en "Image not available", ru "Изображение недоступно", flat). `fallback` STRING/ReactNode props **stay untranslated** (escape hatch, custom path unchanged `:146-149`).                                                                                                                                                   | Precedent: features consume the same pattern. Key missing → i18next returns the key string: both locales ship the key, risk accepted.                                                                                                                       |
| 4   | **Aria (IMG-08)**: single derivation `const fallbackDescriptionId = isError && !decorative ? \`image-${alt                                                                                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                                                                             | 'error'}-error\` : undefined;`— used for BOTH`aria-describedby`(existing) and`id`attached to the fallback node in all 3`renderFallback` branches (img / div / default div). Id set only when the reference exists (non-decorative error). | Keeps `:533-541` truthy gate; reference now resolves to a REAL node. `alt |     | 'error'` preserves current id scheme for empty alt. |
| 5   | **IMG-07 plays**: reuse `within(canvasElement)` Link pattern + `waitFor` where async (error/skeleton). Exact 6 stories: `Default`, `Rounded`, `SizeSmall`, `ErrorWithFallback`, `PlaceholderSkeleton`, `LoadingModes`                                                                                                                                                                                                                                                     | Fire `data-loading` may change after load → error story asserts via `waitFor`.                                                                                                                                                                              |
| 6   | **Not-central aggregator** (IMG-10): name `useImageRender` in `lib/hooks/`, signature `useImageRender(props: ImageProps, { loadingStatus, isError })` returning `{ containerStyle, imageStyle, containerClasses, placeholderClasses, ariaProps, fallbackDescriptionId, handleLoadSuccess, handleLoadError }` — the 5 inline `useMemo`s + 2 `useCallback`s move verbatim; thin component. OPTIONAL: drop-marker (`may be deferred`) — no blending into other requirements. | useParagraph/useIcon/useLink precedent; behavioral-noop gate.                                                                                                                                                                                               |

## Data flow

```
<Image src={obj|string} alt fallback placeholder …>
  ├─ resolvedSrc      = typeof src === 'string' ? {src, srcSet:undefined} : src   [D1]
  ├─ useImageLoading({ src: resolvedSrc.src, lazyMode, priority, forceLoading })
  │     → loadingStatus, isError, ref, onLoad, onError
  ├─ useImageRender(props, {loadingStatus, isError})   [IMG-10]
  │     → containerStyle (borderRadius/width/height/size), imageStyle (objectFit/blur/opacity),
  │       containerClasses, placeholderClasses, ariaProps (+describedby in error),
  │       fallbackDescriptionId, handleLoadSuccess/Error
  └─ render
      <figure className=… data-variant data-size data-loading style=…>
        ├─ showPlaceholder ? <div aria-hidden className=placeholder> Skeleton|Spinner|blur </div>
        ├─ <img ref src={resolvedSrc.src} srcSet={resolvedSrc.srcSet} loading decoding fetchPriority
        │        onLoad onError {ariaProps} {restProps}>          // restProps LAST → consumer wins
        └─ isError → renderFallback(fallbackDescriptionId)  (img | div | t('imageNotAvailable'))
```

## Per-requirement implementation notes

| Req    | File(s)                                                    | Exact change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IMG-01 | `ui/Image.tsx`                                             | delete `export default Image` (`:243`); `useImageLoading.ts` delete `export default useImageLoading` (`:192`); `imageValidation.ts` delete `export default validateImageProps` (`:169`). Named exports remain.                                                                                                                                                                                                                                                                                                                                                   |
| IMG-02 | `model/constants.ts`, `index.ts`                           | delete `PLACEHOLDER_CONFIG` (`:79`), `SUPPORTED_IMAGE_TYPES` (`:125`), `ARIA_DEFAULTS` (`:159`), `IMAGE_CONSTANTS` (`:173`, aggregator removes nested group); `useImageLoading.ts` delete `useImageLoadingSimple` (`:175`); drop the 5 re-exports from `index.ts`. **Knip re-lock**: run `analyze:dead-code` after → if `IMAGE_SIZE_VALUES`/`VARIANT_RADIUS`/`INTERSECTION_OBSERVER_CONFIG`/`IMAGE_DEFAULTS`/`VALIDATION_MESSAGES` (internally consumed) appear as public-list surplus, adjust re-export set per knip — never remove runtime-consumed constants. |
| IMG-03 | `index.ts`                                                 | remove `validateImageProps`/`normalizeImageProps`/`logValidationWarnings` (`:37-41`); internals (`ui/Image.tsx` none, stories use named only) import direct path `./lib/utils/imageValidation`.                                                                                                                                                                                                                                                                                                                                                                  |
| IMG-04 | `ui/Image.tsx:81,219`                                      | per D1. New tests: object `{src, srcSet}` → `src` + `srcset` attrs; object without `srcSet` → no attr; string + native `srcSet` passthrough.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| IMG-06 | `ui/Image.tsx:151`, `locales/en.json`, `ru.json`           | default fallback node → `{t('imageNotAvailable')}`. Tests: en text; `i18n.changeLanguage('ru')` → ru text; custom `fallback` untranslated.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| IMG-07 | `ui/Image.stories.tsx`                                     | 6 `play` blocks (D5). Assertions: Default → `getByRole('img')` + `figure[data-loading]`; Rounded → `figure[data-variant=rounded]`; SizeSmall → `data-size=sm` + container inline width `64px`; Error → `await waitFor` fallback `img.fallback` + `aria-describedby` truthy on content img; PlaceholderSkeleton → `[aria-hidden=true]` placeholder contains Skeleton markup; LoadingModes → imgs name-filtered by alt: `loading=eager` (priority) vs `loading=lazy` (native).                                                                                     |
| IMG-08 | `ui/Image.tsx:144-168,231`                                 | per D4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| IMG-09 | `ui-kit-contract.md`                                       | `### Image specifics` section: props summary (src union, alt, 4 variants, 4 sizes, 5 object-fits, 4 placeholders, 3 lazy modes, fallback/re-expression/priority/forceLoading), loading hook, 5 consumers list, 22 stories (+ plays 6), knip-clean exports. Inventory row → plays 6.                                                                                                                                                                                                                                                                              |
| IMG-10 | `ui/Image.tsx`, `lib/hooks/useImageRender.ts` (new + test) | move 5 useMemo + 2 useCallback verbatim; thin component; 68-gate + new hook unit tests. OPTIONAL: if risk shows at implementation, defer per spec without touching other reqs.                                                                                                                                                                                                                                                                                                                                                                                   |

## Test plan

| File                                   | Covers                                                                                                                           | Type        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `ui/Image.test.tsx`                    | 68 existing — **UNCHANGED** (no-op gate; `:490-506` src-object test stays green)                                                 | Unit        |
| `ui/Image.improvements.test.tsx` NEW   | srcset object (2), aria-id resolution (2), i18n en/ru+escape (1-2), hook-implementation smoke (optional (IMG-10): useImageRender | Unit        |
| `lib/hooks/useImageRender.test.ts` NEW | hook return shape (± deps), dev-warn (3–5)                                                                                       | Unit        |
| `ui/Image.stories.tsx`                 | 6 plays → `npm run storybook:test`                                                                                               | Interaction |
| static                                 | `npm run analyze:dead-code` (5 names + 3 defaults gone); `type-check:strict` 0; `lint` 0                                         | Gate        |

## Risks

| Risk                                                       | Mitigation                                                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| srcSet fix regresses 68-gate                               | no test asserts srcset absence; MAS `{...restProps}` order keeps native path; focused unit tests                        |
| Knip re-lock drift on remaining public constants           | re-lock per knip EXACT list at implementation; never remove consumed constants (hook/validator/stories)                 |
| i18n `useTranslation` in shared/ui affects render/bundling | already a repo-wide dependency (44-key spec); fallback key present in both 22 localities → no key-missing string        |
| aria-id string contains spaces/jsdelivr alt                | `<img id>` allows any string; same value as describedby → RESOLVES (spec) — matches existing `image-{alt}-error` scheme |
| IMG-10 regression                                          | OPTIONAL: pure extraction, behavioral-noop gate (68 tests); drop-with-note allowed by spec at implementation            |
| Storybook flakiness on 3s demo plays                       | skeleton play asserts initial loading phase only; data-loading assertions use `waitFor`                                 |

## Migration / Rollout

No data migration. Single PR zone; rollback per unit: `git revert <unit-commit>` — IMG-01/02/03 (index/model re-exports) restore trivially with zero consumer fallback; IMG-04/08 (single-file `Image.tsx`) revert cleanly; i18n locale keys revert 2 lines; IMG-07/09 revert design changes; IMG-10 revert restores inline memo/callback (identical values).

## Open Questions

- [ ] None blocking. (IMG-10 optional: keep vs defer decided at sdd-tasks — spec allows drop-with-note; knip re-lock absolute list confirmed at implementation.)

## Next Step

Ready for tasks (sdd-tasks).
