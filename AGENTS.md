# AGENTS.md

## Agent skills

### Issue tracker

Issues and specs for this repo live as GitHub issues, used via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles with default label strings: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `docs/context.md` (domain context) plus `docs/adr/`. See `docs/agents/domain.md`.

## Git workflow

The agent MUST keep branch state and in-flight work visible to the human at all times. Silent, long-lived "orphan" branches are forbidden.

- **STRICT integration branch (`dev`):** every feature/bugfix branch MUST be cut from `dev` and opened as a PR into `dev`. `main` is release-only — it receives commits solely via a `dev` → `main` merge, and ONLY when `dev` is production-ready (explicit human approval). Never branch from or open PRs into `main` for development work.
- Create branches from a GitHub issue via `gh`, **based on `dev`**; name them `type/issue-slug` (e.g. `feat/42-label-improvements`).
- Open a DRAFT pull request as soon as work starts on a branch, and keep it updated as work progresses. A branch without an associated PR is an error.
- Announce the current branch and the task in progress at the start of each unit of work.
- Never leave an orphan branch: every branch must end in either a merged PR or an explicit human decision to discard.
- Do NOT merge without explicit human approval. The human merges, or the agent merges only after a clear "merge" instruction.
- Treat `gh pr status` / `gh pr list` as the single source of truth for in-flight work.
- **Branch protection:** both branches carry the same 6-check Ruleset — `main` (id `21331400`) and `dev` (id `24128717`): Strict Validation, Security Audit, Secret Scan/gitleaks, CodeQL, Bundle Size Check, Conventional Commits; plus restrict-deletions, block-force-pushes, and require-PR (approvals 0, merge/squash/rebase). Rulesets are configured in GitHub → Settings → Rules → Rulesets — human-only action; the agent cannot configure Rulesets. Status checks are enforced by the Ruleset on both `main` and `dev`, so no manual local pre-merge gate is required beyond the standard `npm run validate`.

## Diagnostics

Verify work with the project's CLI tooling before claiming it done. LSP is intentionally NOT enabled: OpenCode 1.18.21 (the latest stable) does not support the `lsp` config key — it is stripped on config write, and no newer stable exists. Use the CLI commands below as the authoritative pre-completion gate (per OpenCode guidance, CLI diagnostics are more reliable than LSP for agent workflows):

- `npm run type-check` — TypeScript typecheck (`tsc --noEmit`).
- `npm run lint` — ESLint on `.ts/.tsx` with zero warnings allowed.
- `npm run lint:styles` — Stylelint on all `.scss`.
- `npm run validate` — `type-check` + `lint` + `lint:styles` (full gate).
- `npm run format:check` — Prettier formatting check.

Run `npm run validate` as the standard pre-completion check.

## Project conventions (strict — all agents MUST follow)

These are mandatory project rules, mirrored from the Obsidian vault (`resume-app/memory.md`); the engram entity names are in parentheses.

- **Always latest versions** (`resume-version-policy`): Dependencies and tooling must never stay on an older version. When a newer version exists (including majors), adapt the code to it. No pinning to old versions, no skipping upgrades.
- **User approval gate** (`resume-control-approve-model`): Present a clear, understandable plan of the upcoming work (what/why/how) and wait for the user's analysis + explicit approval BEFORE executing any work. Merges and branch deletions also require approval. For GitHub-UI-only actions the agent cannot perform (branch protection/Rulesets, installing GitHub Apps, clicking Merge), provide a precise step-by-step sequence instead of attempting it.
- **Memory dual-write** (`resume-memory-dualwrite`): Any decision, discovery, pattern, or convention learned must be saved to long-term memory AND recorded in the Obsidian vault (`resume-app/index.md` + `resume-app/memory.md`). Agent-relevant items must also be added here (AGENTS.md).

### Gotchas (agent-relevant)

- `.gitignore` contains `*.js` (TS-only project) — root JS config files (e.g. `commitlint.config.js`) are ignored by git; use `.commitlintrc.json` instead. (`resume-gitignore-js`)
  - `npm install`/`npm ci` FAILS with `ERESOLVE` from a storybook peer conflict (`@storybook/test@8.6.15` requires `storybook@^8.6.15`, but `storybook@10.3.6` is installed) — this broke ALL CI jobs that install deps. RESOLVED by Step 1: migrate `@storybook/test` imports to `storybook/test` and drop the dep. Never pipe `npm install` through `| tail` (masks failures). (`resume-npm-peer-conflict`, `resume-npm-install-masking`)
  - Bumping `eslint-plugin-react-hooks` within the v7 major (e.g. 7.0.1→7.1.1) silently enables React 19 hooks rules (`react-hooks/use-memo`, `react-hooks/set-state-in-effect`) that flag pre-existing code. Fix the code (inline arrow for `useCallback`, derive state during render instead of `setState` in effect, move async `setState` into event/observer callbacks); do NOT suppress the rules with `eslint-disable`. (`resume-react-hooks-v7-rules`)
  - **`<Code>` executes function children as plain functions** (`sdd` resume-142): `src/shared/ui/Code/lib/utils/extractTextFromNode.ts` calls `componentFn(props)` to build the clipboard text, and `useCopyCode` invokes it INSIDE a `useMemo`. So any hook in a `Code` child (`SkillsCode`) is called from inside another hook's callback → React throws "Do not call Hooks inside useMemo", the half-registered hook corrupts the hook list, and the ENTIRE app unmounts to a blank page. The guard is dev-only: `vite preview` and Storybook look perfect, only `npm run dev` breaks. Fix: pass localized values in as props from the parent, keep the child hook-free. A runtime seam test CANNOT catch this — it mocks the i18n module, and a mocked `useLanguage` is a plain call, not a hook (verified: stays green with the hook reintroduced), so the guard is source-level (`use[A-Z]\w*\(` on disk, comments stripped) and must include a NON-VACUOUS case proving the matcher fires. Also: `validateLinkProps` and `hasSafeUrlScheme` must agree on safe schemes — `mailto:`/`tel:` are safe but were missing from the prefix list, warning on every Contact render. (`resume-code-executes-children`)
  - Never `taskkill //IM node.exe` — it kills the owner's dev servers. Kill only the PID you started.
  - Pre-existing CI red (NOT caused by deps work). Three root causes found; ALL FIXED as of 2026-08-25: (1) `.opencode/eslint/eslint-plugin-fsd-imports.js` was CommonJS (`require`) in a `"type":"module"` repo — ESLint crashed on load. FIXED by renaming to `.cjs` (PR #10). (2) `Bundle Size Check` exceeded `performance-budget.json`. FIXED by raising caps to the vite 8 baseline (PR #11). (3) `Security Audit` failed on a transitive `uuid <11.1.1` vuln via `@storybook/test-runner` → `jest-junit`/`nyc`. FIXED by `overrides: { uuid: ^11.1.1 }` (PR #12) — uuid 11.1.1 keeps a CJS build, so CJS consumers are unaffected. main CI is now fully GREEN. (`resume-ci-red`)
  - The agent merges only on an explicit "merge" instruction AND when `gh` is authenticated (now installed + authed as Konstantine899, protocol ssh). The branch-protection Ruleset applies to every merge; required status checks still gate it. (`resume-merge-exec`)
  - Step 3 (majors) of the deps upgrade is DONE for the vite 8 ecosystem + `@types/node` 26 (PR #12): `vite` 8.2.2, `@vitejs/plugin-react` 6.1.0 (+ `oxc-transform-react` peer), `vite-plugin-static-copy` 4.1.1, `vite-plugin-svgr` 5.2.0, `@types/node` 26.3.0. `typescript` 7 is DEFERRED — `typescript-eslint` 8.x does NOT support TS 7.0 (typescript-eslint/typescript-eslint#10940, support planned for 7.1+); reverted to 6.0.3 to keep lint/CI green. (`resume-deps-step3`)
  - `vite` 8 + `@vitejs/plugin-react` 6 require `.npmrc` with `legacy-peer-deps=true`: an OPTIONAL `@rolldown/plugin-babel` → `@babel/core@8` peer chain conflicts with `@babel/core@7` in the tree (we don't use react-compiler/babel). This does NOT mask the earlier `@storybook/test` peer conflict (that was a real required-peer break, fixed by removing the dep). (`resume-npm-legacy-peer-deps`)
  - Reviewer/fallback model `mimo-v2.5-free` was decommissioned by the provider; replaced by `opencode/mimo-v2.6-flash-free` in `opencode.jsonc`, `profiles/zen-*.json`, and `scripts/switch-profile.ps1`. Restart opencode after editing configs. (`resume-mimo-model`)
  - The PROJECT config `.opencode/opencode.json` ALSO held 65 stale `mimo-v2.5-free` entries across ~30 agent defs (review-_/jd-_/plan-qwen) and overrode the fixed globals via deep-merge (project wins) — FIXED in `b319e4c`. When this warning appears, grep BOTH scopes: `~/.config/opencode` AND `.opencode/opencode.json`. (`resume-mimo-model-project`)
  - `ui-ux-suite` MCP added to global `opencode.jsonc` (`npx -y ui-ux-suite --mcp` → `uiux_audit_run`). Static audit: real signals = typography scale, spacing grid, focus-visible counts, colors; FALSE POSITIVES for this repo — contrast computed vs `#ffffff` (does NOT resolve our multi-theme `data-theme`), scans build artifacts in `public/` (vite outDir), Tailwind-oriented hover heuristics, misses modern `@media (width >= N)` syntax. Use deep/axe mode for real per-theme contrast. (`resume-uiux-suite-mcp`)
  - Baseline: `npx -y ui-ux-suite ./src --write-baseline .uiux-baseline.json` → overall 6.4, 263 keys; re-run `npx -y ui-ux-suite ./src --baseline .uiux-baseline.json --fail-on-regression` for CI-style regression gate. Run on `./src`, NOT the MCP quick mode (MCP scans `public/` and reports inflated contrast findings). (`resume-uiux-suite-baseline`)
  - `Bundle Size Check` was RED on PR #107 as PRE-EXISTING dev debt, not a PR regression: merge-base dev `8df71fd` already over budget (CSS 133.1 KiB > 117.19 assets, JS 177.6 > 175.78 main) hours before the first UIKIT-0 commit. Core CSS is minified + PurgeCSS + 281 design tokens — not junk. Caps raised to measured baseline in `b17a589`: `assets.maxSize` 120000→140000, `chunks.main.maxSize` 180000→186000. Bundle optimization tracked in issue #108 (Phase 5). Check `gh run list --branch dev` before blaming a PR for a red budget check. (`resume-bundle-budget`)
  - axe deep: inject axe-core from CDN via Playwright (`page.evaluate` script tag, e.g. `https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js`) — avoids adding `@axe-core/playwright` to deps. Theme switch is `button[data-testid="theme-switch"]:visible` (the first instance is hidden in the mobile menu). Known violations (both themes): CodeBlock `.language`/`.lineNumber` contrast, ProjectCard `role="button"` nested-interactive, scrollable regions, `<aside role="navigation">`. (`resume-axe-cdn`)
  - Global `@keyframes` dedup (sdd-134-css C4): in `.module.scss` reference a global keyframes name with the COLON-LESS form `global(name)` — e.g. `animation: global(theme-spin) 0.5s ...`. postcss REJECTS `:global(...)` inside declaration values ("Double colon"/"Missed semicolon"); vite's `postcss-modules-local-by-default` unwraps `global(name)` to an unhashed plain word. Keyframes live ONCE in `src/shared/styles/animations/_keyframes.scss` (forwarded by `globals/index.scss`); consumers must not re-declare them. Separate pre-existing bug: `ModalRoot.module.scss` output is entirely MISSING from built CSS (reproduces on pure baseline HEAD — purge-pipeline issue, NOT this change; reported for triage). (`resume-css-global-keyframes`)
  - Zero-ref token deletion (sdd-134-css C5): removing a dead custom property can CASCADE — its declaration may be the only `var()` consumer of another token (orphaned `--color-skeleton-shimmer`, `--shadow-sidebar`, `--color-border-focus` this way) and empties its `// Section` header (delete comment + one adjacent blank line). Run the invariant test (`src/shared/styles/__tests__/theme-tokens.test.ts`) to a fixpoint; it ignores comment lines (prose ≠ consumer) and guards `--text-primary` (kept: `.storybook/preview.tsx:19`). Budget: `assets.maxSize` tightened to 122880 (`check-bundle.mjs` walks only `.js`/`.css`). PRE-EXISTING `test:storybook` failures: `AvatarHero/AvatarAbout > With Image` (`data-state` stuck at `loading`, onLoad race) — reproduced on clean baseline via stash; not a regression. Gotcha: `npm run X | tail; echo $?` reports tail's exit — redirect gates to a file instead. (`resume-c5-cascade-deadness`)
    - **Redux slices vs `no-param-reassign`** (`resume-rtk-immutable-rule`): the global rule is `props: true`, but RTK `createSlice` reducers are PRESCRIBED to mutate the immer draft — `eslint.config.js` carries a scoped override (`files: ['src/**/*Slice*.ts', 'src/**/*.test.{ts,tsx}']`, `ignorePropertyModificationsFor: ['state', 'draft']`). New `*Slice*.ts` files are covered automatically; do NOT "fix" reducers by returning new state and do NOT sprinkle `eslint-disable` — extend the override's file pattern instead. WU-2 bundle fact: RTK splits across chunks (`immer` → main, `react-redux` → vendor via `resolveManualChunk`) — vendor cap 295000 survived, only total was raised 485000→510000 (`ddef3f8`, human-approved).
  - **Same-slice imports: relative YES, alias NO** (`resume-fsd-relative-import`): `fsd-imports/public-api-only` rejects an alias deep-import even when source and target are the SAME layer (`@/pages/Admin/AdminHydrateFallback` from `routerConfig.tsx` fails with "Use @pages/Admin instead"), while a relative `./Admin/AdminHydrateFallback` passes (no public-api index needed within one slice). Also `react-router@8` (RR 8.4): direct deep-loads of a `lazy` route warn "No HydrateFallback element provided" and render null — the fix is route-level `hydrateFallbackElement` on the RouteObject (RouterProvider has NO such prop in RR8). (`resume-fsd-relative-import`, `resume-rr8-hydrate-fallback`)
  - **Env-init must never hide inside component import chains** (`resume-i18n-setup-init`): the global i18next instance used to be initialized only as a side effect of `import '@/shared/lib/i18n/config/i18n'` inside `src/shared/ui/Image/ui/Image.tsx` (also `I18nProvider`) — deleting the Hero component removed the AppRouter test's only path to Image, so `t()` started echoing raw keys and `AppRouter.test > /admin placeholder` failed deterministically (while all other tests stayed green — only that one asserts translated text). Fix: `src/tests/setup.ts` now imports the config explicitly, first. When deleting a component, grep for side-effect imports it carried (bare `import '@/…';` with no bindings) and relocate env-init to setup/providers.
  - **FSD import matrix is NOT `app → pages → features → shared`** (WU-1 admin router): `.opencode/eslint/eslint-plugin-fsd-imports.cjs` `ALLOWED_IMPORTS` says `app → [shared]` ONLY; `pages → [app, pages, widgets, features, entities, shared]`; `widgets → [app, pages, ...]`. So anything composing pages (route table!) lives in `src/pages`, NOT `app/providers`; `StoreProvider` in `app` can only use shared+RTK — inject reducers from root `src/App.tsx` (outside slices, rule-exempt) or move the provider to `pages`. Also `react-refresh/only-export-components` flags a file having a LOCAL (unexported) component + any non-component export — `allowConstantExport` does NOT save it (arrays aren't "constants" to the plugin) → split into `routerConfig.tsx` (constants) / component files. Verified with fresh-build bundle delta: RR 8.4.0 adds vendor 195.28→287.12 kB, total 375→465.2 KiB — budget caps raised with human approval (vendor 200000→295000, total 420000→485000, `0c5eab3`, PR #146). (`resume-fsd-matrix-app-shared`)

## Project Configuration Reference

**Full configuration plan**: `resume-app/index.md` (Obsidian vault) — detailed 16-section plan covering all config files, current state, issues, targets, and phased refactoring roadmap.

**Key config files** (agent must know):

- `package.json` — scripts, deps, lint-staged, overrides
- `tsconfig.json` + `tsconfig.node.json` — strict TS, path aliases, project references
- `vite.config.ts` → `config/vite/buildViteConfig.ts` — modular Vite factory with plugins, aliases, chunks
- `vitest.config.ts` — dual project (unit jsdom + storybook playwright)
- `playwright.config.ts` — e2e against Storybook
- `eslint.config.js` — flat config, strict rules, FSD architecture enforcement
- `.stylelintrc.json` — SCSS with recess-order, strict selectors
- `.commitlintrc.json` — conventional commits
- `.releaserc.json` — semantic-release on main
- `performance-budget.json` — bundle size enforcement
- `.npmrc` — `legacy-peer-deps=true` (vite 8 requirement)
- `.storybook/` — main.ts, preview.tsx, test-runner, fsd-checks
- `.github/workflows/strict-validation.yml` — CI gate (6 checks)
- `.github/workflows/pr-validation.yml` — PR validation gate

**Validation gate**: `npm run validate` = type-check + lint + lint:styles + vitest unit + coverage

**Refactoring phases** (from plan):

1. Foundation (prettier, env, package.json metadata)
2. Lint/TS modernization (react-hooks update, FSD plugin ESM, checker ESLint)
3. Build system consolidation (Vite factory, chunks, purgecss)
4. Testing/CI separation (Playwright app vs storybook, PR workflow)
5. Optimization (bundle reduction, budget re-evaluation)

**Gotchas for agents**:

- FSD plugin is `.js` (ESM) — migrated from `.cjs`
- `eslint-plugin-react-hooks` at 7.1.1 — React 19 rules active, violations fixed
- Vite checker has ESLint enabled (`lintCommand: 'eslint "**/*.{ts,tsx}"'`)
- Playwright: 2 configs — `playwright.app.config.ts` (port 3001) + `playwright.config.ts` (port 6006)
- `legacy-peer-deps=true` required for vite 8, does NOT mask old storybook conflict

---

## 🎯 Current Status (2026-09-02)

**Production Ready** — All phases 1-8 complete:

| Phase                    | Status |
| ------------------------ | ------ |
| 1. Foundation            | ✅     |
| 2. Lint/TS Modernization | ✅     |
| 3. Build System          | ✅     |
| 4. Testing/CI            | ✅     |
| 5. Optimization          | ✅     |

**Validation gates passing:**

- `npm run validate` — ✅
- `npm run lint` — ✅ (0 errors)
- `npm run type-check` — ✅
- `npm run check:bundle` — ✅ (349 KiB < 391 KiB)
- `npm run build` — ✅ (dynamic chunks, PurgeCSS)

**Fallback model chain (7 levels):**

1. `opencode/nemotron-3-ultra-free` (Zen Free, 1M)
2. `opencode/nemotron-3.5-lightning-free` (Zen Free, 1M)
3. `opencode/mimo-v2.6-flash-free` (Zen Free, 256K)
4. `opencode/ling-3.0-flash-fin-free` (Zen Free, 32K)
5. `opencode/muse-spark-1.2-contributor-free` (Zen Free)
6. `ollama/qwen2.5-coder:7b-instruct-q4_K_M` (Local)
7. `ollama/deepseek-r1:7b` (Local)

**Orchestrator:** Call via `@sdd-orchestrator` in OpenCode TUI
