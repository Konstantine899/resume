# SPEC — FSD slice generator and repo scripts

| Field   | Value                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------------- |
| Status  | draft                                                                                                |
| Date    | 2026-10-07 (ARCH-1 amendment — owner architecture, see REQ-G8 in §3.2)                               |
| Plan    | `resume-app/wiki/plan/implementation-plan.md` (Obsidian vault; revision 2 — review findings applied) |
| Source  | `Konstantine899/advansed-frontend-app` @ `master`, `scripts/` (19 files, 17 executable, all read)    |
| Target  | resume-app @ `dev` — Vite 8 / React 19 / TS 6.0 / RTK 2.13 / Storybook 10, ESM (`"type": "module"`)  |
| Tracker | `scripts/spec/TODO.md` (staged task breakdown)                                                       |

---

## 1. Goal

Adapt the automation scripts of `advansed-frontend-app` to resume-app: a fail-fast **FSD slice
generator**, two **boundary-check tools**, and a **single source of truth for FSD layers** — all
passing `npm run validate` on generated output with zero manual edits.

## 2. Scope

### 2.1 In scope (deliverables)

| ID  | Deliverable                                                | Path                                                                          |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| D1  | SSOT for FSD layers + thin ESM wrapper                     | `scripts/fsd-layers.json`, `scripts/fsd-layers.mjs`                           |
| D2  | Slice generator (rewritten templates, fail-fast semantics) | `scripts/createSlices/**` + npm `generate:slice`                              |
| D3  | Alias-consistency checker (dry-run by default)             | `scripts/refactoring/update-imports.mjs` + npm `refactor:imports`             |
| D4  | `shared/ui` public-API checker (dry-run / `--fix`)         | `scripts/refactoring/check-shared-ui-public-api.mjs` + npm `check:public-api` |
| D5  | Tests for D1–D4                                            | `scripts/__tests__/**`                                                        |
| D6  | Decision records and docs                                  | AGENTS.md section, `wiki/scripts/*` status, engram + vault                    |

### 2.2 Out of scope (non-goals, fixed decisions)

- `clear-cache.js`, `getApiUrl.js` + `build:dev` (xargs), Loki `generate-visual-json-report.js` —
  not ported (no `postinstall`, dead `__API__`, no `.loki/`; POSIX pipelines are forbidden).
- Source `README.md` files (learning material of another project).
- In-slice `spec/` generator (plan Appendix A, stage P4 — starts only after a manual trial).
- Auto-editing composition root (`src/storeReducers.ts`, `src/pages/routerConfig.tsx`,
  `src/pages/Home/ui/HomePage/HomePage.tsx`, `en.json`/`ru.json`) — generator prints "Next
  steps" instead.
- User-facing text in generated code → no i18n keys are ever emitted in v1.

## 3. Requirements

### 3.1 SSOT — layers (REQ-S)

- **REQ-S1** `scripts/fsd-layers.json` is the ONLY place that declares FSD layers. No script may
  declare a local layer array (enforced by review + AGENTS.md rule).
- **REQ-S2** File shape (exact):

  ```json
  {
    "layers": ["app", "shared", "entities", "features", "widgets", "pages"],
    "generatorLayers": ["entities", "features", "pages", "widgets"],
    "allowedImports": {
      "app": ["shared"],
      "pages": ["app", "pages", "widgets", "features", "entities", "shared"],
      "widgets": ["app", "pages", "features", "entities", "shared"],
      "features": ["entities", "shared"],
      "entities": ["shared"],
      "shared": ["shared"]
    }
  }
  ```

  `generatorLayers` = the four slice layers — **OPEN-1 decided (owner, 2026-10-04): the
  generator must work uniformly in ANY slice layer**, so every generator layer emits the
  identical tree (REQ-G8) with no per-layer variants. The fact that the four existing entities
  have no `ui/` is treated as history, not as a layer rule. **OPEN-2 decided (owner,
  2026-10-04): `pages` is included from day one** — route registration stays a manual gate
  (Next steps, REQ-G11); `shared` and `app` remain out of scope (different slice structure).

- **REQ-S3** `.opencode/eslint/eslint-plugin-fsd-imports.cjs` reads the JSON via
  `require('../../scripts/fsd-layers.json')` — depth `../../` from `.opencode/eslint/`.
  **`../../../` escapes the repository root and must not be used** (would crash every `npm run lint`).
- **REQ-S4** Plugin hygiene: the tracked test `.opencode/eslint/eslint-plugin-fsd-imports.test.js`
  imports `./eslint-plugin-fsd-imports.js`, which is **gitignored (`*.js`) and absent on a fresh
  clone**, and no vitest glob executes this test (`.opencode/eslint/**` is not in `include`).
  Resolution (OPEN-3): repoint the test at the `.cjs` implementation and add
  `.opencode/eslint/**` to the vitest unit `include` (human-approved config change), or delete the
  test. The live plugin stays the `.cjs` loaded by `eslint.config.js`.
- **REQ-S5** Invariant test (`scripts/__tests__/fsd-layers.test.ts`):
  - `keys(allowedImports) == layers` (set equality);
  - `generatorLayers ⊆ layers`;
  - `layers ⊆ keys(BuildPath in vite.config.ts)` **minus**
    `{src, locales, buildLocales}` (subset check — naive set equality fails on the extra keys);
  - layer regexes inside the plugin are constructed FROM the JSON (no second hardcoded list).
- **REQ-S6** After REQ-S3 lands, the invariant's plugin side is tautological; the meaningful
  assertions are the vite/config side + regex construction. Document this in the test.

### 3.2 Generator — `scripts/createSlices/` (REQ-G)

- **REQ-G1** CLI: `npm run generate:slice -- <Layer> <SliceName> [--with-slice] [--force] [--dry-run]`.
  Entry `scripts/createSlices/index.mjs`; all modules `.mjs` ESM (a `.ts` entry would fail
  `npm run lint` `no-console` — verified).
- **REQ-G2** Validation: `layer ∈ generatorLayers`; `SliceName` matches `/^[A-Z][a-zA-Z0-9]*$/`;
  `await run()` inside `try/catch` → `process.exitCode = 1` (never a silent exit 0).
- **REQ-G3** Naming rules:

  | Artifact                    | Rule                                                            | Example (`ContactForm`)              |
  | --------------------------- | --------------------------------------------------------------- | ------------------------------------ |
  | Directory / component       | PascalCase, argument as-is                                      | `ContactForm`                        |
  | RTK `name`, store key, file | first char lower-case                                           | `contactForm`, `contactFormSlice.ts` |
  | SCSS class                  | camelCase (stylelint pattern)                                   | `.contactForm`                       |
  | Story title                 | `<LayerPascal>/<Name>`                                          | `Features/ContactForm`               |
  | `data-testid`               | kebab: `s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()` | `contact-form`, `contact2-form`      |

- **REQ-G4** All-or-nothing write: build the full target path list → conflict check → write the
  entire tree into a staging directory next to the target (`src/<layer>/.<Name>.tmp-<ts>/`, same
  filesystem) → atomic `rename` into place → remove staging on any failure. Target dir is never
  left in a mixed state (kills CRITICAL issue #1 and HIGH #3/#4 of the source).
- **REQ-G5** Existing target without `--force` → error **before any write**, exit 1, byte-identical
  tree (regression test with checksums). With `--force`: swap semantics (staged tree replaces the
  target atomically with rollback on failure); **only generator-owned files are replaced — foreign
  files are never deleted**, they are reported in the output.
- **REQ-G6** Recovery message on a leftover/partial target:
  `Target <path> already exists. Remove it manually or rerun with --force.`
- **REQ-G7** `--dry-run`: prints the full future file tree, zero writes, exit 0.
- **REQ-G8** Output tree — base (no `--with-slice`):

  ```
  src/<layer>/<Name>/
  ├── index.ts
  ├── model/
  │   └── types/
  │       └── types.ts      # <Name>Props (self-named file, ARCH-1: no index barrel)
  └── ui/
      └── <Name>/
          ├── <Name>.tsx
          ├── <Name>.test.tsx
          ├── <Name>.stories.tsx
          └── <Name>.module.scss
  ```

  Extra with `--with-slice`:

  ```
  ├── model/
  │   ├── types/
  │   │   └── types.ts      # + <Name>State, <Name>RootState (structural)
  │   ├── slices/
  │   │   ├── <name>Slice.ts       # file MUST match *Slice.ts (no-param-reassign override)
  │   │   └── <name>Slice.test.ts
  │   └── selectors/
  │       └── selectors.ts         # self-named file, no index barrel (ARCH-1)
  ```

  **ARCH-1 (owner, 2026-10-07) — canonical slice architecture**, derived from the owner's
  hand-applied restructuring of `src/` and binding for the generator:
  - **`ui/` is per-component directories**: `ui/<Name>/<Name>.{tsx,test.tsx,stories.tsx,module.scss}`
    (precedent: `features/About/ui/About/`, `pages/Admin/ui/<Page>/`). Flat `ui/<Name>.tsx`
    is no longer emitted.
  - **`model/` holds ONLY subdirectories; every file is self-named** (`types/types.ts`,
    `selectors/selectors.ts`, `slices/<name>Slice.ts`, `constants/constants.ts`,
    `schemes/schema.ts`) — no `index.ts` barrels inside `model/`, so importers spell the
    full path (`./model/types/types`, precedent `entities/Job/index.ts`). Importer specifiers
    therefore DO change when a slice migrates (unlike the index-barrel design of plan rev.4).
  - **`services/` and `constants/` and `schemes/` are never created by the generator** (empty
    dirs are not committable) — they are made by hand when real files appear. `schemes/` is
    the entity home for zod schema files (precedent `entities/Job/model/schemes/schema.ts`);
    feature storage/seed/session logic stays in `services/`.
  - The tree is IDENTICAL in every generator layer (`entities`, `features`, `pages`, `widgets`)
    — OPEN-1 (owner, 2026-10-04) still holds; ARCH-1 changes the shape, not the uniformity rule.
  - `shared/**` is OUT of scope: not in `generatorLayers`, still flat `shared/ui/*/model/types.ts`
    (plan §5 / risk R6 unchanged). Two conventions coexist BY DESIGN.

- **REQ-G9** `model/types/types.ts` content: without slice — `<Name>Props` only; with slice —
  plus `<Name>State` (≥1 field; `no-empty-object-type`) and structural
  `<Name>RootState = { <name>: <Name>State }` with the composition-root comment
  (precedent: `AdminAuth/model/types/index.ts` — no global RootState can exist while reducers
  are injected from `src/App.tsx`).
- **REQ-G10** `model/selectors/selectors.ts` (only with `--with-slice`):
  `export const select… = (state: <Name>RootState): … => state.<name>…;`
  (precedent: `AdminAbout/model/selectors/selectors.ts`; self-named file per ARCH-1).
- **REQ-G11** The generator never edits `storeReducers.ts` / `routerConfig.tsx` /
  `HomePage.tsx` / locales; it prints a "Next steps" block with the exact reducer import
  snippet (`…/model/slices/<camel>Slice`) when `--with-slice` was used.
- **REQ-G12** Windows: npm scripts are plain `node <file>` — no pipes, no `xargs`, no `npx`
  inside spawned processes; subprocesses in tests use `process.execPath`.
- **REQ-G13** Emitted output must be Prettier-clean (`printWidth: 100`, single quotes) — either
  run emitted strings through `prettier.format()` (programmatic API) or assert
  `prettier --check` on the generated directory in the smoke (REQ-Q6).

### 3.3 Templates (REQ-T)

- **REQ-T1 `types.mjs`** — see REQ-G9/G10. Banner comment `// ==== <Name> — … ====`.
- **REQ-T2 `component.mjs`** — `memo` named function; props imported as
  `import type { <Name>Props } from '../../model/types/types'` (the component sits in
  `ui/<Name>/`, two levels below the slice root; precedent: `About/ui/About/About.tsx`);
  `ReactNode` is imported ONLY by `model/types.ts` for the `children` slot (plan §4.5.7) —
  the component must NOT import it (unused-import lint violation; bare `React.ReactNode` is
  likewise forbidden) — _amended after the Stage-1 gates, which proved the old wording
  red under `no-unused-vars`_;
  `className={classNames(styles.<camel>, {}, [className])}` with
  `import { classNames } from '@/shared/lib/utils/classNames'` — **the only allowed path**
  (forbidden: `clsx`, `classnames`, `shared/lib/classNames/…`);
  `data-testid` default = kebab name; **no console, no `any`, no unused imports, no hardcoded text.**
- **REQ-T3 `component-test.mjs`** — explicit
  `import { describe, expect, it } from 'vitest'` (precedent: `About.test.tsx`; `globals: true`
  exists but the codebase convention is explicit imports) + `@testing-library/react`;
  cases: default `data-testid` present, custom `className` merged (selector fixed against actual
  markup before landing), children render.
- **REQ-T4 `story.mjs`** — CSF3 for SB 10:
  `import type { Meta, StoryObj } from '@storybook/react-vite'`,
  `satisfies Meta<typeof <Name>>`, `tags: ['autodocs']`,
  `title: '<LayerPascal>/<Name>'`. No `ComponentStory`/`Template.bind`.
- **REQ-T5 `style.mjs`** — `.<camel> {\n  /* styles go here */\n}` (comment mandatory:
  `block-no-empty`; empty file → `no-empty-source`); tokens via `var(--…)`, no raw hex, no `@use`.
- **REQ-T6 `redux-slice.mjs`** (only `--with-slice`) — `createSlice` with named action exports;
  lazy-hydration wrapper `export const <name>Reducer: typeof <name>Slice.reducer = (state, action) =>
<name>Slice.reducer(state ?? initialState, action)` + lesson comment (`resume-rtk-lazy-hydration`);
  file name `model/slices/<name>Slice.ts` (scope of the `no-param-reassign` override); the
  slice and its test import the state from `'../types/types'`, the test imports selectors from
  `'../selectors/selectors'`.
- **REQ-T7 `selectors.mjs`** — see REQ-G10; reads `<Name>RootState` from `'../types/types'`.
- **REQ-T8** `index.mjs` — banner + **named re-exports only** (no `export *`):
  base: `export { <Name> } from './ui/<Name>/<Name>';` +
  `export type { <Name>Props } from './model/types/types';`
  with slice: also `<Name>State`, `<Name>RootState`,
  `export { <name>Reducer, setInitialized } from './model/slices/<name>Slice';`,
  `export { select<Name>Initialized } from './model/selectors/selectors';`.
- **REQ-T9** Every template must pass all four gates (type-check, eslint, stylelint, vitest
  coverage) as an isolated sample BEFORE the generator ships (stage 0.5).

### 3.4 Refactoring tools (REQ-R)

- **REQ-R1** `update-imports.mjs` — dry-run by default (prints specifiers whose first segment is
  an FSD layer but is not `@/`-prefixed); `--fix` rewrites to `@/<specifier>`; layer detection
  from SSOT; helper named `startsWithFsdLayer` (fixes the source's `isAbsolute` misnomer);
  expected result on current `src`: **0 findings**.
- **REQ-R2** `check-shared-ui-public-api.mjs` — explicit guard: missing `src/shared/ui` → clear
  error + exit 1 (no silent no-op). Pass 1: directories without `index.ts` (dry-run lists;
  `--fix` creates barrels with **named** re-exports, never `export *`). Pass 2: deep imports
  `@/shared/ui/<C>/<X>` → `@/shared/ui/<C>` (dry-run exit 1 on violations; `--fix` rewrites).
  Every `file.save()` / `project.save()` is awaited (no floating promises).
  **Amended 2026-10-04 (evidence, Stage 2):** pass 2 skips a deep import when the first segment
  after the component is a sanctioned internal segment (`lib`, `constants`, `types`, `model` —
  mirrors `public-api-only.allowInternal` in `eslint.config.js`). Forcing the real tree's 18
  `model`/`lib` deep imports through barrels breaks type-check (symbols such as
  `getFallbackColor`, `validateDividerProps`, `ToastAction` are deliberately not
  barrel-exported) and would contradict the ESLint gate inside `npm run validate` (OPEN-6);
  the literal predicate would also make smoke S7's clean-tree exit 0 impossible.
- **REQ-R3** Runtime: **Variant A** — ESM `.mjs` + `ts-morph` (latest per `resume-version-policy`),
  zero config changes (decision OPEN-4; fallback Variant B `.ts` + `tsx` + config edits listed in
  the plan §2.4).
- **REQ-R4** `--fix` must be idempotent (second run → 0 changes).
- **REQ-R5** Dry-run on a clean tree exits 0 for both tools (usable as a CI gate; adding
  `check:public-api` to `npm run validate` is OPEN-6).

### 3.5 Tests and quality gates (REQ-Q)

- **REQ-Q1** Test location: `scripts/__tests__/**` (co-located `__tests__` style of the repo).
  They run in the vitest `unit` project only after `include` gains
  `scripts/**/*.{test,spec}.{ts,tsx,mjs}` (OPEN-5, human-approved config change).
  Fallback if refused: a dedicated vitest project `scripts` with `environment: 'node'` —
  do NOT rely on tests that never execute.
- **REQ-Q2** Type-check coverage: `scripts/**/*.ts` must be in the **root** `tsconfig.json → include`
  — the root project is the only one `npm run type-check` runs (`tsc --noEmit`; `references` are
  ignored by plain `tsc`). **Amended 2026-10-04 (evidence):** `tsconfig.node.json` belongs to no
  gate and is red today with pre-existing errors (TS5097 ×4, TS7016 ×1), so `scripts/**` there
  would gate nothing; root-include was implemented instead and the gotcha recorded in AGENTS.md
  (`resume-tsconfig-node-dead`). Tests outside the root include are invisible to the gate.
- **REQ-Q3** Generator tests spawn the CLI via `execFile(process.execPath, [entry, …args])` in a
  temp root (`--root` / `SLICE_ROOT` env) — never through a shell, never `spawn('node')`.
- **REQ-Q4** Required tests (TDD — written before implementation):
  1. naming helpers: Pascal/camel/kebab cases incl. digits (`Contact2`, `OAuthClient2`);
  2. CLI validation: bad layer / lowercase name / `with-dash` → exit 1;
  3. tree equals REQ-G8 (base and `--with-slice`);
  4. rerun without `--force` → exit 1 and target checksum unchanged (CRITICAL regression);
  5. `--dry-run` → zero filesystem writes;
  6. template content assertions: allowed `classNames` path present; forbidden substrings absent
     (`clsx`, `classnames`, `useTranslation`, `shared/lib/classNames`, empty `interface X {}`,
     `ComponentStory`, `Template.bind`);
  7. SSOT invariant (REQ-S5);
  8. `update-imports`: fixture with/without `@/`; `--fix` idempotency;
  9. `check-shared-ui-public-api`: missing-dir guard → exit 1; barrel emission format;
     deep-import fix; clean-tree exit 0.
- **REQ-Q5** Smoke matrix (each stage's integration point):

  | #   | Check                                                                                         |
  | --- | --------------------------------------------------------------------------------------------- |
  | S1  | all 7 templates through type-check + eslint + stylelint in a tmp dir (stage 0.5)              |
  | S2  | `generate:slice -- features SmokeSlice` → `npm run validate` green, no manual edits           |
  | S3  | same with `--with-slice` → `npm run validate` green (coverage + `*Slice.ts` override)         |
  | S4  | new story builds: `npm run build-storybook` or `npm run test:storybook`                       |
  | S5  | rerun same command → exit 1, `git status` unchanged                                           |
  | S6  | `prettier --check` on the generated directory (REQ-G13)                                       |
  | S7  | refactoring tools: dry-run exit 0 on clean tree; `--fix` on artificially broken tree + revert |
  | S8  | cleanup of smoke slice → `npm run validate` green again                                       |

- **REQ-Q6** Coverage thresholds stay untouched (branches 85 / functions 87 / lines 92 /
  statements 90). `**/scripts/**` remains coverage-excluded; S2/S3 are the empirical R8 gate.
- **REQ-Q7** Code style of the scripts themselves: English identifiers/comments (Language Domain
  Contract), `no-console`-safe entry handling in `.ts` files, no POSIX-only shell constructs.

## 4. Acceptance criteria

1. All deliverables D1–D6 present; all REQ-G/R/S/Q demonstrably satisfied by tests + smoke S1–S8.
2. `npm run validate` green on every stage boundary; generated slice requires zero manual edits.
3. `scripts/fsd-layers.json` is the single layer list (grep across scripts + plugin shows none).
4. Rerun-safety regression test in place; `--force` never deletes foreign files.
5. All OPEN decisions (§5) recorded with an answer and date before the stage they block.
6. AGENTS.md section + engram/vault dual-write done (stage 4).

## 5. Open decisions (block the listed stage)

| ID     | Question                                            | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                    | Blocks    | Status      |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| OPEN-1 | Keep `entities` in `generatorLayers`?               | **Yes — decided (owner, 2026-10-04): uniform generation in any slice layer**; the "existing entities have no `ui/`" observation is history, not a rule. Superseded requirement: uniform tree, no per-layer variants (REQ-G8)                                                                                                                                                                                                                      | Stage 1   | **decided** |
| OPEN-2 | Add `pages` to `generatorLayers`?                   | **Yes — decided (owner, 2026-10-04): included from day one**; route registration stays a manual gate (REQ-G11). `shared`/`app` remain out of scope (different slice structure)                                                                                                                                                                                                                                                                    | Stage 1   | **decided** |
| OPEN-3 | Wire or delete `eslint-plugin-fsd-imports.test.js`? | **Repoint to `.cjs` + add `.opencode/eslint/**` to vitest include** — decided (owner, 2026-10-04)                                                                                                                                                                                                                                                                                                                                                 | Stage 0   | **decided** |
| OPEN-4 | Refactoring tools: `.mjs` (A) or `.ts`+`tsx` (B)?   | **A — decided (owner, 2026-10-04): ESM `.mjs` + `ts-morph` (latest), zero config changes**; Variant B (`.ts` + `tsx` + config edits) stays documented in plan §2.4 as the fallback                                                                                                                                                                                                                                                                | Stage 2   | **decided** |
| OPEN-5 | Extend vitest `include` with `scripts/**`?          | **Yes** (fallback: dedicated node project) — decided (owner, 2026-10-04)                                                                                                                                                                                                                                                                                                                                                                          | Stage 0/1 | **decided** |
| OPEN-6 | Add `check:public-api` to `npm run validate`?       | **Yes — decided (owner, 2026-10-04): appended as the final step of `npm run validate`** after Stage 2 (clean-tree exit 0 proven by smoke S7)                                                                                                                                                                                                                                                                                                      | Stage 2   | **decided** |
| OPEN-7 | Implement `print-env.mjs`?                          | **No — decided 2026-10-04 (Stage 3): no real need exists**; `__API__` is defined (`config/vite/buildViteConfig.ts:61`) but unused anywhere in `src` (only the `vite-env.d.ts` declaration), so there is no env to print. Revisit only when a concrete task needs env inspection (Stage 3 / plan §7)                                                                                                                                               | Stage 3   | **decided** |
| OPEN-8 | Align the remaining `model/` divergences to ARCH-1? | Raised 2026-10-07, NOT yet decided: `constants/index.ts` (ContactContent, Developer) vs self-named `constants/constants.ts` (Job, Project); zod schema in `services/schema.ts` (#179 entities) vs `schemes/schema.ts` (Job, Project); `selectors/{selectors.ts,index.ts}` double file (admin features) vs single `selectors/selectors.ts` (ARCH-1); flat `model/constants.ts` in `widgets/Nav`. ARCH-1 migration of 2026-10-07 covered TYPES only | Stage 5   | **open**    |
