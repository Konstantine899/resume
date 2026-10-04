# TODO — FSD slice generator and repo scripts

Companion to [`SPEC.md`](./SPEC.md). Stages mirror `wiki/plan/implementation-plan.md` §5.
Rules: every stage ends with `npm run validate` green; tests are written before implementation
(TDD); decisions in the `OPEN decisions` table of SPEC.md must be answered before the stage they
block.

## Stage 0 — SSOT and foundations (P0)

- [x] **0.1** OPEN-3 + OPEN-5 **decided (owner, 2026-10-04)**: repoint plugin test to `.cjs` + include `.opencode/eslint/**`; extend vitest include with `scripts/**` (fallback:
      dedicated node project)
- [ ] **0.2** Create `scripts/fsd-layers.json` exactly per REQ-S2
- [ ] **0.3** Create `scripts/fsd-layers.mjs` wrapper (`getFsdLayers`, `isFsdLayer`,
      `layerFromPath`, `layerFromSpecifier`) — REQ-S1
- [ ] **0.4** Point `.opencode/eslint/eslint-plugin-fsd-imports.cjs` at the JSON via
      `require('../../scripts/fsd-layers.json')` — **separate commit, immediate `npm run lint`**
      (REQ-S3; wrong depth crashes every lint run)
- [ ] **0.5** Resolve tracked dead test: repoint to `.cjs` + wire `.opencode/eslint/**` into
      vitest include, or delete — REQ-S4 / OPEN-3
- [ ] **0.6** Invariant test `scripts/__tests__/fsd-layers.test.ts` (subset check minus
      `{src, locales, buildLocales}`) — REQ-S5, REQ-S6
- [ ] **0.7** Add `scripts/**/*.ts` to `tsconfig.node.json → include` — REQ-Q2
- [ ] **0.8** Point-of-truth note in AGENTS.md: "no local layer arrays" (partial — finish in Stage 4)
- [ ] **Gate:** `npm run validate` green; invariant green; `npm run lint` unchanged

## Stage 0.5 — Template verification before any wiring (REQ-T9)

- [x] **0.5.1** OPEN-1 **decided (owner, 2026-10-04)**: `entities` STAYS in `generatorLayers`;
      uniform output in any slice layer, no per-layer variants (REQ-G8)
- [ ] **0.5.2** Hand-write all 7 templates as samples in a tmp dir: `types`, `component`,
      `component-test`, `story`, `style`, `redux-slice` (`*Slice.ts` + `selectors.ts`), `index`
- [ ] **0.5.3** Run type-check + eslint + stylelint (+ prettier --check) on the samples — S1
- [ ] **0.5.4** Fix templates until all four gates pass with zero manual edits
- [ ] **Gate:** S1 green; deviations from plan §4.5 recorded back into the plan

## Stage 1 — Generator `scripts/createSlices/` (P0, TDD)

- [ ] **1.1** Tests first (in `scripts/__tests__/`): naming helpers, CLI validation, tree shape
      (base + `--with-slice`), rerun byte-identical, `--dry-run` zero writes, template content
      assertions — REQ-Q3, REQ-Q4.1–4.6
- [ ] **1.2** `resolve-root.mjs` (`import.meta.url`, `--root`/`SLICE_ROOT`) + SSOT integration
- [ ] **1.3** `index.mjs` entry: validation, flags, `try/catch` → `process.exitCode = 1` — REQ-G1/G2
- [ ] **1.4** Templates (from Stage 0.5 samples): REQ-T1–T9
- [ ] **1.5** `create-model.mjs`, `create-ui.mjs`, `create-public-api.mjs`
- [ ] **1.6** `create-template.mjs`: preflight → staging dir → atomic rename + rollback;
      `--force` swap that never deletes foreign files — REQ-G4–G6
- [ ] **1.7** npm script `generate:slice` → `node scripts/createSlices/index.mjs`
- [x] **1.8** OPEN-2 **decided (owner, 2026-10-04)**: `pages` IN `generatorLayers` from day
      one; route registration stays a manual gate (Next steps)
- [ ] **Gate:** smoke S2, S3 (`--with-slice`), S4 (story build), S5 (rerun), S6 (prettier),
      S8 (cleanup) — see REQ-Q5; `git status` clean after S5/S8

## Stage 2 — Refactoring tools (P1)

- [ ] **2.1** Answer OPEN-4, OPEN-6
- [ ] **2.2** `update-imports.mjs`: fixture tests + `--fix` idempotency (REQ-R1, REQ-Q4.7–4.8)
- [ ] **2.3** `check-shared-ui-public-api.mjs`: guards, awaited saves, named barrels,
      dry-run exit 1 (REQ-R2, REQ-R4, REQ-Q4.9)
- [ ] **2.4** npm scripts `refactor:imports`, `check:public-api`
- [ ] **2.5** Optional (OPEN-6): wire `check:public-api` into `npm run validate`
- [ ] **Gate:** smoke S7 both tools; clean-tree dry-runs exit 0

## Stage 3 — Utilities (P2/P3, mostly decisions)

- [ ] **3.1** Record "not ported" decisions: `clear-cache`, `getApiUrl`/`build:dev` (xargs),
      Loki report — REQ §2.2 non-goals
- [ ] **3.2** Answer OPEN-7 (`print-env.mjs`) — implement only on real need
- [ ] **Gate:** no dead npm scripts (`npm run` shows no entry pointing at a missing file)

## Stage 4 — Documentation and memory

- [ ] **4.1** AGENTS.md section: `generate:slice`, `check:public-api`, SSOT rule, "not ported"
      decisions, `createSlices` directory convention
- [ ] **4.2** Update `wiki/scripts/00–06` status/dates per the anti-rot rule; link this spec
- [ ] **4.3** Dual-write: engram + vault `resume-app/index.md` / `memory.md`
- [ ] **4.4** Update plan status: `draft` → per-stage `done`
- [ ] **Gate:** checklist of the plan fully checked

## Cross-stage risks to keep visible (plan §6)

- R14: bad `require` path in the ESLint plugin → entire lint red (Stage 0.4 guard)
- R15: dead plugin test / untracked `.js` duplicate (Stage 0.5)
- R16: ~~open~~ **decided 2026-10-04 (owner)** — uniform generation in any layer; "existing
  entities have no `ui/`" is history, not a rule; revisit only via an explicit `--no-ui`-style
  decision if data-only slices appear
- R17: Prettier rewrites emitted files on commit if REQ-G13 unmet (S6)
- R18: scripts tests invisible to `tsc` unless Stage 0.7 lands (REQ-Q2)
