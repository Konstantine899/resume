# TODO — FSD slice generator and repo scripts

Companion to [`SPEC.md`](./SPEC.md). Stages mirror `wiki/plan/implementation-plan.md` §5.
Rules: every stage ends with `npm run validate` green; tests are written before implementation
(TDD); decisions in the `OPEN decisions` table of SPEC.md must be answered before the stage they
block.

## Stage 0 — SSOT and foundations (P0)

- [x] **0.1** OPEN-3 + OPEN-5 **decided (owner, 2026-10-04)**: repoint plugin test to `.cjs` + include `.opencode/eslint/**`; extend vitest include with `scripts/**` (fallback:
      dedicated node project)
- [x] **0.2** Create `scripts/fsd-layers.json` exactly per REQ-S2 — done (`11a57b1`, PR #156)
- [x] **0.3** Create `scripts/fsd-layers.mjs` wrapper (`getFsdLayers`, `isFsdLayer`,
      `layerFromPath`, `layerFromSpecifier`) — REQ-S1 — done (`11a57b1`)
- [x] **0.4** Point `.opencode/eslint/eslint-plugin-fsd-imports.cjs` at the JSON via
      `require('../../scripts/fsd-layers.json')` — **separate commit, immediate `npm run lint`**
      (REQ-S3; wrong depth crashes every lint run) — done (`1f047da`, lint green immediately)
- [x] **0.5** Resolve tracked dead test: repoint to `.cjs` + wire `.opencode/eslint/**` into
      vitest include — REQ-S4 / OPEN-3 — done (`11a57b1`); fixture audit found the test
      referenced a non-existent `@/widgets/Sidebar` (repo has `Nav`) — fixtures fixed, 14 tests
      execute and pass (0 before)
- [x] **0.6** Invariant test `scripts/__tests__/fsd-layers.test.ts` (subset check minus
      `{src, locales, buildLocales}`) — REQ-S5, REQ-S6 — done (`1f047da`); coverage-exclude
      `**/.opencode/eslint/**` added (tooling, mirrors `scripts/` rule) — thresholds untouched
- [x] **0.7** Type-check wiring — REQ-Q2 **as amended 2026-10-04**: root `tsconfig.json → include += scripts/**/*.ts` (the ONLY project `npm run type-check` runs);
      `tsconfig.node.json` belongs to no gate and is pre-existing red (TS5097/TS7016) — see
      AGENTS.md `resume-tsconfig-node-dead`
- [x] **0.8** Point-of-truth note in AGENTS.md: "no local layer arrays" — done (`resume-fsd-ssot`,
      `1f047da`; broader Stage-4 notes remain)
- [x] **Gate:** `npm run validate` green (158 files / 2746 tests; stmts 91.67 ≥ 90, branch 87.98
      ≥ 85, funcs 88.31 ≥ 87, lines 92.79 ≥ 92); invariant green; `npm run lint` unchanged

> **Stage 0 executed 2026-10-04** — branch `feat/fsd-layers-ssot`, PR #156 (draft), commits
> `11a57b1` (SSOT + wiring) and `1f047da` (plugin → JSON + invariant + docs).

## Stage 0.5 — Template verification before any wiring (REQ-T9)

- [x] **0.5.1** OPEN-1 **decided (owner, 2026-10-04)**: `entities` STAYS in `generatorLayers`;
      uniform output in any slice layer, no per-layer variants (REQ-G8)
- [x] **0.5.2** Hand-write all 7 templates as samples: `types`, `component`,
      `component-test`, `story`, `style`, `redux-slice` (`*Slice.ts` + `selectors.ts` + slice
      test), `index` — 9 files total. **Placement deviation:** a literal tmp dir outside the
      repo would be invisible to the repo-scoped gates, so the sample slice lives at
      `src/features/TemplateProbe/` (exercises the real FSD path detection) and is DELETED
      after verification (2026-10-04)
- [x] **0.5.3** Run type-check + eslint + stylelint (+ prettier --check) on the samples — S1
      green: all four gates passed on the FIRST run, zero edits (plus `vitest run` on the
      probe: 2 files / 6 tests; plus a negative FSD probe — `import { Nav } from
'@/widgets/Nav'` inside features → eslint exit 1, `fsd-imports` fired — proving the
      gate really lints the samples)
- [x] **0.5.4** Fix templates until all four gates pass with zero manual edits — not needed:
      zero edits were required; verified content folded back into plan §4.5 (rev.4)
- [x] **Gate:** S1 green; deviations from plan §4.5 recorded back into the plan — §4.5.1
      (drop unused `type ReactNode` import), §4.5.2 (English comments per artifact-language
      contract), §4.5.5 (2nd case → `toHaveClass('custom')` + verified slice-test snippet),
      NEW §4.5.7 (`types.mjs` had no section), §2.3.4 (`State` as `type` alias per
      AdminAuth). Plan header bumped to rev.4

## Stage 1 — Generator `scripts/createSlices/` (P0, TDD)

- [x] **1.1** Tests first (in `scripts/__tests__/`): naming helpers, CLI validation, tree shape
      (base + `--with-slice`), rerun byte-identical, `--dry-run` zero writes, template content
      assertions — REQ-Q3, REQ-Q4.1–4.6 — 24 tests, all green (`e894d33`)
- [x] **1.2** `resolve-root.mjs` (`import.meta.url`, `--root`/`SLICE_ROOT`) + SSOT integration
      (`getGeneratorLayers()` accessor added to `scripts/fsd-layers.mjs`)
- [x] **1.3** `index.mjs` entry: validation, flags, `try/catch` → `process.exitCode = 1` — REQ-G1/G2
- [x] **1.4** Templates (from Stage 0.5 samples / plan §4.5 rev.4): REQ-T1–T9 — 8 modules under
      `scripts/createSlices/templates/` (`d03f2a1`)
- [x] **1.5** `create-model.mjs`, `create-ui.mjs`, `create-public-api.mjs`
- [x] **1.6** `create-template.mjs`: preflight → staging dir → atomic rename + rollback;
      `--force` swap that never deletes foreign files — REQ-G4–G6 (EPERM-on-locked-dir hint +
      rollback: `a3e2593`)
- [x] **1.7** npm script `generate:slice` → `node scripts/createSlices/index.mjs`
- [x] **1.8** OPEN-2 **decided (owner, 2026-10-04)**: `pages` IN `generatorLayers` from day
      one; route registration stays a manual gate (Next steps)
- [x] **Gate:** smoke S2, S3 (`--with-slice`), S4 (story build), S5 (rerun), S6 (prettier),
      S8 (cleanup) — see REQ-Q5; `git status` clean after S5/S8 — ALL PASSED 2026-10-04 on
      PR #157 (stacked on `feat/fsd-layers-ssot`): S2 validate 2771 zero
      edits; S3 with-slice validate 2776; S4 build-storybook ok; S5 rerun
      exit 1 + byte-identical status; S6 prettier ok; S8 cleanup validate
      2770 (= baseline 2746 + 24). S1 = the Stage 0.5 gates (green there);
      S7 (refactoring dry-runs) is due with Stage 2. Out-of-matrix
      self-checks: i18n-first/reuse-first pass. **Owner-approved deviations (VS Code stays open):** D1 =
      real-src `--with-slice` via `rm -rf` + regen (Windows `EPERM`: editor file watchers
      hold dir handles — live-probed, exit 1 + hint, target byte-intact); D2 = `--force`
      swap proven in clean tmp root incl. REQ-G6 foreign-file preservation. Generator suite
      31/31 (`scripts/`, incl. 8 SSOT invariants) after the 2026-10-04 dual review
      (`3b1382a`: REQ-T3 children case added to the component-test template, PowerShell
      lock test removed — shell breach of plan R6 + flaky under parallel runs, English
      comments restored). CI checks for #157 start only after
      retarget to `dev` (workflows trigger on main/dev only). AGENTS gotcha:
      `resume-genslice-eperm`; plan rev.5

## Stage 2 — Refactoring tools (P1)

- [x] **2.1** Answer OPEN-4, OPEN-6
- [x] **2.2** `update-imports.mjs`: fixture tests + `--fix` idempotency (REQ-R1, REQ-Q4.7–4.8)
- [x] **2.3** `check-shared-ui-public-api.mjs`: guards, awaited saves, named barrels,
      dry-run exit 1 (REQ-R2, REQ-R4, REQ-Q4.9); pass-2 carve-out for sanctioned internal
      segments (`lib`/`constants`/`types`/`model`, mirrors `allowInternal` — REQ-R2 amended)
- [x] **2.4** npm scripts `refactor:imports`, `check:public-api`
- [x] **2.5** Optional (OPEN-6): wire `check:public-api` into `npm run validate`
- [x] **Gate:** smoke S7 both tools; clean-tree dry-runs exit 0
      (`update-imports` 0 findings / 532 files; `check:public-api` 28/28 barrels,
      0 deep imports; SmokeProbe break → exit 1 → `--fix` exit 0 (barrel + rewrites)
      → revert → exit 0; `npm run validate` green with `check:public-api` appended)

## Stage 3 — Utilities (P2/P3, mostly decisions)

- [x] **3.1** Record "not ported" decisions: `clear-cache`, `getApiUrl`/`build:dev` (xargs),
      Loki report — REQ §2.2 non-goals — recorded in AGENTS.md (`resume-scripts-nonported`) +
      vault `memory.md` (2026-10-04)
- [x] **3.2** Answer OPEN-7 (`print-env.mjs`) — **decided: No** (no real need; `__API__` defined
      but unused in `src`) — SPEC §5 + plan §7 (2026-10-04)
- [x] **Gate:** no dead npm scripts — removed `validate:continue` (dead: no `continue` binary in
      `node_modules/.bin`, not on PATH, zero references; `npm run` now maps every entry to an
      existing file/binary); no `postinstall` / `test:ui:*`

## Stage 4 — Documentation and memory

- [ ] **4.1** AGENTS.md section: `generate:slice`, `check:public-api`, SSOT rule, "not ported"
      decisions, `createSlices` directory convention
- [ ] **4.2** Update `wiki/scripts/00–06` status/dates per the anti-rot rule; link this spec
- [ ] **4.3** Dual-write: engram + vault `resume-app/index.md` / `memory.md`
- [ ] **4.4** Update plan status: `draft` → per-stage `done`
- [ ] **Gate:** checklist of the plan fully checked

## Stage 5 — Owner architecture alignment (ARCH-1, 2026-10-07)

> Triggered by the owner's hand-applied `src/` restructuring (per-component `ui/<Name>/`
> dirs, `pages/*/ui/<Page>/`, entities Job/Project `model/{types,constants,schemes}/`) and
> his directive: the generator must match that architecture, errors fixed, committed.

- [x] **5.2–5.4** done 2026-10-07: tests first (11 red → 17/17 green), generator + templates + `printNextSteps` on ARCH-1
- [x] **5.5–5.7 + Gate** done 2026-10-07: 19 slices migrated `model/types/types.ts` (git mv +
      tsc-TS2307 loop, 58 importers, `shared/**` untouched); `npm run validate` 3138/3138 +
      `build` + `check:bundle` 692.1/720 KiB; dual-write (`resume-arch1-alignment` in AGENTS.md + vault `memory.md`) + report (OPEN-8, #142/#138 = feature work, PRs #167/#168
      superseded); PR #181 all 8 checks green

## Stage 6 — Spec-phase workflow (plan_spec_workflow, 2026-10-07, auto mode)

> Owner-approved plan `wiki/plan/plan_spec_workflow.md`. Phase A (default) = spec scaffold →
> owner sets `status: approved` → phase B `--scaffold` = code → implement per criteria.
> **Deviation rev.2 (recorded):** `--scaffold` + approved-gate land in Этап 1 — otherwise the
> merged PR removes every code path until Этап 2 and the tool is broken in between. Этап 2
> keeps `check:spec` / `spec:status` / extra components from «Plan files».

- [x] **6.1** SPEC.md amended FIRST: REQ-G1 (+`--scaffold`, two phases), REQ-G8 (scaffold-only),
      REQ-G11 (→ TODO Work units), REQ-G14/G15 (new), REQ-Q4.10–4.11, REQ-Q5 S2, OPEN-9,
      D7, §2.2 non-goal removed
- [x] **6.2** CLI tests first (red → green): 12 red on the old generator, 24/24 green after
      implementation — phase-A tree = exactly `spec/{SPEC.md,TODO.md}`; `--scaffold`
      missing-SPEC → exit 1; `status: draft` → exit 1 + zero bytes; `status: approved` → code
      tree + spec preserved byte-identical; TODO storeReducers WU iff `--with-slice`;
      `git check-ignore` NOT-ignored for all four layers
- [x] **6.3** `templates/spec.mjs` (SPEC.md + TODO.md defaults, frontmatter, Plan files;
      backtick-as-§ rendering trick) + `create-spec.mjs` phase-A step
- [x] **6.4** `index.mjs` `--scaffold` flag + usage; `create-template.mjs`: mode-aware
      `planFiles(names, scaffold)`, `assertScaffoldAllowed` gate BEFORE dry-run/preflight,
      owned = spec pair (phase A) / code union (phase B), `printPointer` replaces
      `printNextSteps` (steps moved into the TODO template)
- [x] **6.5** `.gitignore`: `!src/**/spec/**/*.md` (was features-only) + comment
- [x] **Gate:** generator suite green (55/55 `scripts/`) + `npm run validate` EXIT:0 twice
      (baseline 3145 tests; smoke run 3155 with both slices) + S2/S3 real-src smoke
      (`SpecPhaseSmokeA` base + `SpecPhaseSmokeS` with-slice: phase A → approve → scaffold →
      validate → cleanup → `git status` back to baseline) + negative probes (missing SPEC /
      draft → exit 1) — PASSED 2026-10-07

## Stage 7 — Spec gates + Plan-files extras (plan_spec_workflow Этап 2, 2026-10-07)

- [x] **7.1** SPEC first: REQ-G16 (Plan-files extras), REQ-G17 (`check:spec`, pass =
      `approved|done` — clarification of plan §1.3), REQ-G18 (`spec:status` + shared
      `spec-tools.mjs`), REQ-Q4.12–4.14, D8
- [x] **7.2** Tests red first: 4× `spec-tools-cli` (draft/missing → exit 1, approved|done →
      exit 0, empty root → exit 0, status table) + 3× extras (skeleton quad + `manual:` note,
      lone test-entry registers the component, rerun keeps exactly the spec pair foreign)
      — 7 red confirmed against the old implementation
- [x] **7.3** Implemented: `scripts/spec-tools.mjs` (shared walk + frontmatter parser —
      now ALSO used by the scaffold gate, single source of status semantics),
      `check-spec.mjs` / `spec-status.mjs` + npm scripts, `plan-extras.mjs`,
      `component.mjs` skeleton marker, `component-skeleton-test.mjs` (`it.todo` trio, no
      component import → no TS6133), `uiFiles(names, {skeleton})`, create-template wiring
      (gate returns spec content → extras parsed → `createExtras` step → `ownedSet` passed
      through `swapIntoPlace`/`preserveForeignFiles`)
- [x] **7.4** R5 check PASSED: scaffolded `R5Panel` skeleton run under vitest with a
      tmp-root config → exit 0, `1 file / 3 todo` (empty-suites would fail; todo counts)
- [x] **Gate:** `scripts/` 62/62 (55 old + 7 new) + `npm run validate` EXIT:0 —
      3152 tests / 194 files, coverage 92.05 / 86.66 / 88.25 / 93.12 (all above floors),
      CPU 33% window + prettier clean on every touched file — PASSED 2026-10-07.
      Dogfood: `npm run check:spec` / `spec:status` green on the real repo (0 specs).

## Stage 8 — spec-planner agent (plan_spec_workflow Этап 3, 2026-10-07)

- [x] **8.1** `.opencode/agents/spec-planner.md` — contract per plan §2-Этап 3: input =
      fresh phase-A spec/ + feature context; ≤1–2 clarifying questions; fills SPEC.md
      (observable criteria + Plan files incl. extra `ui/<X>/` paths) and TODO.md (burn-down
      WUs incl. composition-root steps); writes ONLY `spec/`; status stays `draft`
      (owner approves); English artifacts; short output summary. Trigger phrases in the
      description («заполни spec для <slice>», "fill spec", "spec-planner").
      No SPEC amendment: `scripts/spec/SPEC.md` scope = "generator and repo scripts" (D1–D8),
      `.opencode/` is out of scope.
- [x] **8.2** `.opencode/opencode.json` pair `spec-planner-deepseek` / `spec-planner-qwen`
      (precedent `review-*`: hidden, subagent, `opencode/mimo-v2.6-flash-free`, tools
      read/edit/write only) — JSON validated (66 agents).
- [ ] **Gate:** functional dry-run on one slice + owner review — **requires opencode
      restart** (config is loaded once, never hot-reloaded — customize-opencode skill):
      restart → invoke spec-planner on one real slice → owner reviews the filled pair.

## Cross-stage risks to keep visible (plan §6)

- R14: bad `require` path in the ESLint plugin → entire lint red (Stage 0.4 guard)
- R15: dead plugin test / untracked `.js` duplicate (Stage 0.5)
- R16: ~~open~~ **decided 2026-10-04 (owner)** — uniform generation in any layer; "existing
  entities have no `ui/`" is history, not a rule; revisit only via an explicit `--no-ui`-style
  decision if data-only slices appear
- R17: Prettier rewrites emitted files on commit if REQ-G13 unmet (S6)
- R18: scripts tests invisible to `tsc` unless Stage 0.7 lands (REQ-Q2)
