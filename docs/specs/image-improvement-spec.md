# Image Component Improvement Specification

**Change**: image-improvements
**Status**: Draft
**Date**: 2026-08-09
**Prior**: SDD explore + proposal (image-improvements session, user-approved scope)
**Priority**: 7 CRITICAL + 2 MEDIUM + 1 OPTIONAL (~9.5h core, 0h deferred)

---

## Scope

This specification hardens `src/shared/ui/Image/` (68 tests across ~650-line `Image.test.tsx`, 23 stories, 0 plays) to the in-repo standard: named-only exports (3 dead default exports), dead-export removal (knip-locked), validator off the public index, the object-src `srcSet` correctness fix (currently only `src.src` reaches the `<img>`), the broken `aria-describedby` reference (points at a nonexistent id), i18n of the hardcoded fallback text, 6 storybook plays (Link precedent), a dedicated docs-contract section, and an OPTIONAL render-hook extraction (`useParagraph`/`useIcon`/`useLink` precedent).

**Non-breaking constraint:** 68 existing tests in `Image.test.tsx` MUST pass UNCHANGED (behavioral-noop gate). 5 consumers stay untouched (named imports, grep-verified): `Avatar.tsx:2`, `AvatarImage.tsx:2`, `AvatarAbout.tsx:6`, `AvatarHero.tsx:6`, `CardImage.tsx:3`.

| #   | Improvement                                     | Requirement | Priority | Effort | Type     |
| --- | ----------------------------------------------- | ----------- | -------- | ------ | -------- |
| 1   | Named-only exports (3 `export default` removed) | IMG-01      | CRITICAL | 0.5h   | REMOVED  |
| 2   | Dead exports removal (knip-locked)              | IMG-02      | CRITICAL | 0.5h   | REMOVED  |
| 3   | Validator internal-only (off public index)      | IMG-03      | CRITICAL | 0.5h   | MODIFIED |
| 4   | object-src `srcSet` fix (correctness)           | IMG-04      | CRITICAL | 1h     | MODIFIED |
| 5   | i18n of fallback text                           | IMG-06      | CRITICAL | 0.5h   | ADDED    |
| 6   | Play functions on 6 key stories                 | IMG-07      | CRITICAL | 3h     | ADDED    |
| 7   | `aria-describedby` target fix                   | IMG-08      | MEDIUM   | 0.5h   | MODIFIED |
| 8   | Docs: dedicated contract section                | IMG-09      | MEDIUM   | 0.5h   | MODIFIED |
| 9   | Render hook (5 `useMemo` + 2 `useCallback`)     | IMG-10      | OPTIONAL | 1.5h   | MODIFIED |

**Documentation deliverable (no requirement):** refresh the Image row in `docs/specs/ui-kit-contract.md` as part of IMG-09.

**Out of scope:** Avatar migration (v2), data-map/conduit changes, new components, `lazyMode`/`priority` threading, overlay redesign.

---

## ADDED Requirements

### Requirement IMG-06: i18n of the fallback text

The system SHALL replace the hardcoded `Image not available` in the fallback path (`Image.tsx:151`) with `t('imageNotAvailable')` from `react-i18next` `useTranslation()`. The system SHALL add the key `imageNotAvailable` to `src/shared/lib/i18n/locales/en.json` ("Image not available") and `ru.json` ("Изображение недоступно") — flat keys, no nesting (i18n-spec convention). The `fallback` prop SHALL remain the escape hatch: custom string/ReactNode fallbacks MUST NOT be translated. `shared/ui` importing from `shared/lib` i18n is FSD-valid (shared layer).

#### Scenario: en fallback text

- GIVEN `<Image src={broken} alt="x">` rendering the fallback path with default language `en`
- WHEN the image errors
- THEN the fallback `<div>` MUST contain the text `Image not available`

#### Scenario: ru fallback text

- GIVEN `i18n.changeLanguage('ru')` and an error fallback render
- WHEN the image errors
- THEN the fallback text MUST be `Изображение недоступно`

#### Scenario: consumer fallback untouched

- GIVEN `<Image src={broken} fallback="/f.jpg">` or `fallback={<span>Custom</span>}`
- WHEN the image errors
- THEN the provided fallback MUST render verbatim (no translation applied)

### Requirement IMG-07: Play functions on 6 key stories

The system SHALL add `play` functions (via `@storybook/test` `within`/`expect`, Link.stories.tsx pattern) to 6 key stories in `ui/Image.stories.tsx`: `Default`, `Rounded`, `SizeSmall`, `ErrorWithFallback`, `PlaceholderSkeleton`, `LoadingModes`. All MUST pass via `npm run storybook:test`.

#### Scenario: Default play asserts role and state

- GIVEN the `Default` story
- WHEN the play runs
- THEN it MUST assert the `img` is found by role and the `figure` carries `data-loading`

#### Scenario: Variant play asserts data-variant

- GIVEN the `Rounded` story
- WHEN the play runs
- THEN it MUST assert `data-variant="rounded"` on the figure

#### Scenario: Size play asserts data-size

- GIVEN the `SizeSmall` story
- WHEN the play runs
- THEN it MUST assert `data-size="sm"` and the container inline width `64px`

#### Scenario: Error play asserts fallback + aria

- GIVEN the `ErrorWithFallback` story
- WHEN the play runs
- THEN it MUST assert the fallback is rendered and `aria-describedby` is present on the content `img`

#### Scenario: Skeleton placeholder play

- GIVEN the `PlaceholderSkeleton` story (3s demo)
- WHEN the play runs
- THEN it MUST assert the `Skeleton` placeholder markup is present during the loading phase

#### Scenario: LoadingModes play asserts eager vs lazy

- GIVEN the `LoadingModes` story
- WHEN the play runs
- THEN the `priority` image MUST have `loading="eager"` and the `lazyMode="native"` image `loading="lazy"`

---

## MODIFIED Requirements

### Requirement IMG-03: Validator internal-only

The system SHALL remove `validateImageProps`, `normalizeImageProps`, and `logValidationWarnings` from the public `index.ts` (lines 37–41). The three SHALL stay exported from `lib/utils/imageValidation.ts` (internals, dev-validator surface) and import directly from the utils file where needed; the `NODE_ENV === 'development'` self-guard in `logValidationWarnings` SHALL remain (LNK-15/PAR-04 precedent), and `validateImageProps(props, isDevelopment)` SHALL keep its explicit dev flag. `IMAGE_VARIANTS`/`IMAGE_SIZES`/`IMAGE_OBJECT_FITS`/`IMAGE_PLACEHOLDERS`/`IMAGE_LAZY_MODES`/`VALIDATION_MESSAGES` SHALL stay in `model/constants.ts` because `imageValidation.ts` consumes them.

(Previously: all three validators re-exported from the public index; knip listed them as unused public API)

#### Scenario: validators absent from public API

- GIVEN the updated `index.ts`
- WHEN inspected
- THEN `validateImageProps` / `normalizeImageProps` / `logValidationWarnings` MUST NOT be exported from the public index

#### Scenario: internals still importable

- GIVEN a consumer or dev-tool importing from `lib/utils/imageValidation`
- WHEN compiled
- THEN the direct-path import MUST resolve and `type-check:strict` MUST pass

#### Scenario: dev-warn behavior preserved

- GIVEN `logValidationWarnings` called with `blurAmount: 100` in development
- WHEN invoked
- THEN `console.warn` MUST fire (no behavior change vs current)

### Requirement IMG-04: object-src srcSet fix

The system SHALL pass BOTH `src` and `srcSet` to the `<img>` when `src` is the object form `{ src, srcSet? }`. Today only `src.src` is wired (`Image.tsx:72,81`). The string-form `src` and the string native `srcSet`/`sizes` SHALL continue to flow via restProps unchanged.

(Previously: object-form `srcSet` was silently dropped — the `<img>` received only `src`; test `Image.test.tsx:501–506` asserted only `src`)

#### Scenario: object src passes srcSet

- GIVEN `src={{ src: '/a.jpg', srcSet: '/small.jpg 400w, /big.jpg 800w' }}`
- WHEN rendered
- THEN the `<img>` MUST have `src="/a.jpg"` AND `srcset` equal to the object's `srcSet`

#### Scenario: object src without srcSet

- GIVEN `src={{ src: '/a.jpg' }}`
- WHEN rendered
- THEN the `<img>` MUST have `src="/a.jpg"` and NO `srcset` attribute

#### Scenario: string form unchanged

- GIVEN `src="/a.jpg" srcSet="/b.jpg 2x"`
- WHEN rendered
- THEN both must flow verbatim (string path untouched, 68-gate)

### Requirement IMG-08: aria-describedby target fix

The system SHALL give the error-fallback node the same id that `aria-describedby` references (`image-{alt}-error`), and SHALL keep `aria-describedby` only in the error state (current behavior, `Image.tsx:167–168`). The id SHALL be attached to the fallback `<img>`/`<div>` (or a wrapping node) rendered by `renderFallback()`, so the reference resolves when an error is announced.

(Previously: `aria-describedby="image-{alt}-error"` pointed at a DOM id that never existed — dangling ARIA reference)

#### Scenario: target exists in error state

- GIVEN an errored non-decorative `<Image alt="Photo">`
- WHEN rendered after `fireEvent.error(img)`
- THEN the content `img` SHALL carry `aria-describedby` and `document.getElementById('image-Photo-error')` MUST exist

#### Scenario: no reference outside error

- GIVEN a loaded `<Image alt="Photo">`
- WHEN rendered
- THEN `aria-describedby` MUST NOT be present on the `img` and no `image-Photo-error` id SHALL be in the DOM

#### Scenario: existing error-state tests stay green

- GIVEN the current `Aria attributes in error state` suite (`Image.test.tsx:533`)
- WHEN the suite runs
- THEN `img.getAttribute('aria-describedby')` MUST remain truthy (no-op gate)

### Requirement IMG-09: Dedicated contract section

**Type**: MODIFIED. The system SHALL add an `### Image specifics` section to `docs/specs/ui-kit-contract.md` next to Paragraph/Link/Icon/Divider: props summary (`src` string|object, `alt`, `variant` 4, `size` 4, `objectFit` 5, `placeholder` 4, `lazyMode` 3, fallback, decorative, priority, forceLoading), the loading hook, the 5 consumers, stories 22, plays 6, and the knip-clean export surface.

(Previously: Image appears only as an inventory-row entry with no details section)

#### Scenario: section present and accurate

- GIVEN the updated `docs/specs/ui-kit-contract.md`
- WHEN inspected
- THEN an `Image` section with props/hook/stories/plays/consumers MUST be present and consistent with IMG-07/10

### Requirement IMG-10: Render hook (OPTIONAL)

The system SHALL extract the 5 inline `useMemo` (containerStyle, imageStyle, containerClasses, placeholderClasses, ariaProps) and 2 `useCallback` (handleLoadSuccess, handleLoadError) in `ui/Image.tsx` into a render hook (e.g. `lib/hooks/useImageRender.ts` or `model/useImageRender.ts`), returning `{ containerStyle, imageStyle, containerClasses, placeholderClasses, ariaProps, handleLoadSuccess, handleLoadError }` — `useParagraph`/`useLink`/`useIcon` precedent. The component SHALL become thin. The refactor SHALL be a behavioral noop: all 68 tests MUST pass UNCHANGED. If at implementation time this proves risk-heavy, it MAY be deferred with a note (spec: OPTIONAL, drop WITHOUT blending into the other requirements).

(Previously: all memoization and handlers inline in `Image.tsx`)

#### Scenario: hook returns same values

- GIVEN `useImageRender({ variant:'rounded', size:'sm', ... })`
- WHEN called
- THEN the returned style/classes/aria objects MUST match the currently computed ones

#### Scenario: behavioral-noop gate

- GIVEN the refactored component using the hook
- WHEN the full Image test suite runs
- THEN all 68 existing tests MUST pass without modification

---

## REMOVED Requirements

### Requirement IMG-01: Named-only exports

The system SHALL remove the 3 default exports and switch to named-only: `export default Image` (`ui/Image.tsx:243`), `export default useImageLoading` (`lib/hooks/useImageLoading.ts:192`), `export default validateImageProps` (`lib/utils/imageValidation.ts:169`). Grep-verified zero default-import consumers (5 consumers use `import { Image }`).

(Reason: repo named-only rule — grep verifies zero default imports; knip lists all three exports as unused)
(Migration: None — named imports are already used everywhere)

#### Scenario: no default exports

- GIVEN the updated `Image.tsx`, `useImageLoading.ts`, `validateProp.ts`
- WHEN inspected
- THEN each file MUST NOT contain `export default`

#### Scenario: consumers compile

- GIVEN the 5 consumer files + stories importing `{ Image }`
- WHEN `type-check:strict` runs
- THEN no import errors MUST be reported

### Requirement IMG-02: Dead exports removal

The system SHALL remove the knip-listed dead exports: `useImageLoadingSimple` function (`useImageLoading.ts:175`, exported only via `index.ts:36`), `PLACEHOLDER_CONFIG`, `SUPPORTED_IMAGE_TYPES`, `ARIA_DEFAULTS`, `IMAGE_CONSTANTS` (`model/constants.ts`). The system SHALL KEEP all internally-consumed constants: `IMAGE_DEFAULTS` and `INTERSECTION_OBSERVER_CONFIG` are imported by `useImageLoading`/`Image`; if re-runs show additional knip-flagged public-list entries (e.g. remaining index re-exports of enum lists), re-lock the EXACT list at implementation time, keeping anything consumed by the dev-validators or stories; delete any truly-unreferenced remaining public exports.

(Reason: knip lists these 5 as unused exports (verified 2026-08-09); they are single-source API surface, not behavior)
(Migration: None — no consumers import them; internal consumers already import direct from `model/constants`)

#### Scenario: knip output clean

- GIVEN the removed exports
- WHEN `npm run analyze:dead-code` runs
- THEN `useImageLoadingSimple`, `PLACEHOLDER_CONFIG`, `SUPPORTED_IMAGE_TYPES`, `ARIA_DEFAULTS`, `IMAGE_CONSTANTS` and the 3 default exports MUST NOT appear
- AND `Image`, `useImageLoading`, the constants that validators/stories consume, and all types MUST still be present/exportable

#### Scenario: dev-validators still compile

- GIVEN `imageValidation.ts` importing the enum lists + `VALIDATION_MESSAGES`
- WHEN `type-check:strict` runs
- THEN no errors MUST be reported (lists preserved)

#### Scenario: analyze re-lock note

- GIVEN IMG-02 implemented
- WHEN the EXACT final list differs from the above (knip re-run tells differently)
- THEN the implementer SHALL adjust the removed set to mirror knip — never removing consumed constants or behavior-importing exports

---

## Deferred Items (documented, NOT requirements)

| Item                                                       | Rationale                                                                                                                                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IMG-05 status-type dedup                                   | Merged into v3 hook-unify work — avoid type churn now                                                                                                                                    |
| IMG-11: root polymorphism (figure root + ref-to-img)       | `figure` root is test-locked by existing queries (`getByRole('img').closest('figure')`); needs split root/container prop design first                                                    |
| IMG-12: unified hook + Avatar migration                    | Dual-hook divergence today: `useImageLoading` (slice, only used by `Image`) vs `useImageStatus` (shared, used by Avatar family which ignores IO logic) — avatar migration is a v3 change |
| IMG-13: `lazyMode`/`priority` threading + overlay redesign | No current consumer need; separate change                                                                                                                                                |
| Preview/gallery feature (tracker follow-up)                | New feature — outside this cleanup change                                                                                                                                                |

---

## Test Expectations

| Area                                       | Component     | Tests                          | Type                        |
| ------------------------------------------ | ------------- | ------------------------------ | --------------------------- |
| srcSet object form (IMG-04)                | Image         | 2                              | Unit                        |
| aria-describedby target existence (IMG-08) | Image         | 2                              | Unit                        |
| i18n ru/en fallback (IMG-06)               | Image         | 1–2                            | Unit                        |
| Render hook, if included (IMG-10)          | hook          | 3–4                            | Unit                        |
| Existing Image suite                       | Image         | 68 (MUST stay green UNCHANGED) | Unit                        |
| Storybook plays (IMG-07)                   | Image stories | 6                              | `npm run storybook:test`    |
| Knip dead code (IMG-01/02)                 | static        | —                              | `npm run analyze:dead-code` |

Existing tests MUST remain unchanged except the deliberate `aria-describedby`-truthy expectation `Image.test.tsx:533` which stays green (IMG-08 keeps the attr truth-y).

## Implementation Order

```
Phase 1 (~1.5h) — Hygiene: IMG-03, IMG-01, IMG-02
├── IMG-03: validators off public index (keep lib/utils)
├── IMG-01: remove 3 default exports
├── IMG-02: remove knip-listed dead exports (re-run analyze to lock list)
├── Verify: type-check + analyze:dead-code

Phase 2 (~1.5h) — Correctness: IMG-04 srcSet fix + IMG-08 aria fix (+ tests)
├── Object srcSet prop, tests asserting both attrs
├── Fallback id + keep aria-describedby error-only; existing tests green

Phase 3 (~0.5h) — i18n: IMG-06
├── en/ru locale keys + useTranslation in Image.tsx fallback path

Phase 4 (~1.5h, OPTIONAL) — Render hook: IMG-10 (behavioral noop gate)

Phase 5 (~3h) — Plays: IMG-07 ×6 (storybook:test gate)

Phase 6 (~0.5h) — Docs: IMG-09 (ui-kit-contract.md Image section)

Phase 7 — Verify: type-check:strict + lint (exactly 0) + analyze:dead-code
    + npx vitest run src/shared/ui/Image + npm run storybook:test
```

## Risk Assessment

| Risk                                                       | Impact | Mitigation                                                                                           |
| ---------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Knip re-lock drift (IMG-02 list differs at implementation) | Low    | Re-run `analyze:dead-code` at goto-time; keep enum lists consumed by validators; adjust set per knip |
| srcSet fix breaks 68-test gate                             | Low    | String path identical; existing tests don't assert srcSet absence                                    |
| aria-describedby change breaks existing error test         | Low    | Keep attr truth always; only add id node; `Image.test.tsx:533` unchanged                             |
| i18n fallback translation in shared/ui                     | Low    | shared → shared/lib valid FSD; fallback slot keeps English fallback if key missing                   |
| Render hook regression (IMG-10)                            | Medium | OPTIONAL — pure extraction, behavioral-noop gate; drop list if risk-heavy                            |
| Storybook flakiness in 3s demo plays                       | Medium | Skeleton play asserts initial loading phase only; IO/eager plays use LoadingModes story attrs        |

## Rollback Plan

- Cleanup set (IMG-01/02/03): 100 shows re-export / default restore is trivial; no consumer impact (zero external imports).
- srcSet + aria (IMG-04/08): single-file surgical revert of Image.tsx (and the test lines if changed); 68-test gate.
- i18n (IMG-06): revert replaces `t('imageNotAvailable')` with the hardcoded text; locale keys revert.
- Docs (IMG-09): revert contract section.
- Render hook (IMG-10): revert restores inline memo/useCallback (identical values) — zero test delta.

Guard: single PR per concern (hygiene, correctness, i18n, hook, stories, docs) so each revert is surgical.

## Resolution Notes (apply 2026-08-09)

- **IMG-10 (render hook) — DROPPED WITH NOTE** (user decision): all CRITICAL requirements closed; `useImageRender` is a structural-only refactor with zero behavior, and the 68-test gate is already green. Spec allows drop-with-note. The 5 inline `useMemo` + 2 `useCallback` stay in `Image.tsx`; tracked for a future hook-unify change.
- **IMG-09 confirmed**: `### Image specifics` exists in `docs/specs/ui-kit-contract.md` (lines 70–77) — props/hook/a11y/stories/plays/export surface documented.
- **Final gate passed (T11)**: `type-check:strict` 0; `lint` on Image slice EXIT 0 (16 errors in `src/shared/types/common.ts` are pre-existing, last touched in 6450681, not in scope); `npx vitest run src/shared/ui/Image` → 76/76 (68 existing UNCHANGED + 8 new); `analyze:dead-code` → Image names (IMG-02 set + 3 defaults) clean; `storybook:test` → 52 suites / 618 tests pass.

## Success Criteria

- [ ] `type-check:strict` + `lint:strict` pass; `analyze:dead-code` no longer lists the IMG-02 names nor the 3 defaults
- [ ] All 68 existing Image tests pass UNCHANGED (behavioral-noop)
- [ ] +5–8 new tests: srcSet object form, aria-id resolution, i18n ru/en, render-hook (only if IMG-10)
- [ ] `srcSet` from object-form `src` renders on the `<img>` (previously dropped)
- [ ] `aria-describedby` reference resolves to a real element in error state; absent otherwise
- [ ] `imageNotAvailable` key in en.json + ru.json, fallback uses `useTranslation` in default path
- [ ] 6 key stories have passing plays (`npm run storybook:test`)
- [ ] `docs/specs/ui-kit-contract.md` has an Image specifics section; docs deliverable row refreshed
- [ ] UI contract `Image` row (inventory) reflects plays 6
