# OpenCode AI Agent Instructions

Project: Resume Portfolio v3.0.0
Last updated: 2026-07-18

---

## Agents

- **orchestrator** — Coordinates multi-agent tasks and dispatches work to sub-agents.
- **guard** — MCP premoderation, prompt injection detection, PII masking, audit logging. See guard agent for security enforcement.
- **review** — Code review, quality analysis, bug detection.
- **integration-test** — Integration and e2e tests (Playwright, MSW).
- **performance-test** — Performance analysis and budget enforcement.
- **style** — SCSS/CSS Modules validation.
- **prompt-refinement** — Refines prompts for clarity and precision before dispatching to sub-agents.
- **git-commit** — Creates commits with pre-commit validation and conventional commit format.

---

## MCP Servers

- **filesystem** — File operations
- **memory** — Long-term knowledge graph persistence
- **context7** — Library documentation and version queries
- **eslint** — Code linting and rule enforcement
- **playwright** — Browser automation
- **serena** — Code symbol navigation (WSL, LSP-based)
- **sequential-thinking** — Multi-step task planning

---

## Rules

### FSD Architecture

The project follows Feature-Sliced Design (FSD) v2.1 with strict layer hierarchy: `app` > `pages` > `widgets` > `features` > `entities` > `shared`. A layer may import from itself and all layers below it, never from layers above. Direct cross-imports between features or widgets are forbidden. All slice public APIs must use named exports through `index.ts`. See the `fsd-slice-creation` skill for the full decision framework and the `fsd-design` skill for architecture guidance.

### Code Style

TypeScript strict mode is required: no `any` types, no implicit any, no unused variables (except `_` prefix). React hooks must have complete dependency arrays; no direct state mutations. CSS Modules only, no `!important`, no global styles. Use semantic HTML elements. Named exports are preferred over default exports in public APIs.

### Strict Validation

All code must pass ESLint with `--max-warnings 0`. The following are enforced as errors: `no-explicit-any`, `no-unused-vars`, `no-non-null-assertion`, `no-implicit-coercion`, `no-console`, `no-eval`, `react-hooks/exhaustive-deps`, `import/no-cycle`, and `fsd-imports/*` rules. TypeScript strict mode is enabled with all strict flags. Pre-commit hooks block commits on any lint error or type error.

### Security

No secrets, credentials, tokens, or keys in code — use environment variables or GitHub Secrets. All user input must be validated and sanitized. No `console.log` in production code, no `eval()`, no `javascript:` URLs. The guard agent enforces prompt injection detection, PII masking, MCP premoderation, path traversal blocking, and rate limiting. All MCP calls pass through guard premoderation. Guard enforces session limits (50 file reads, 10 file writes, 20 MCP calls per session). Blocked paths include `.git/`, `node_modules/`, `.env*`, and lock files.

### Performance

Component render budgets: simple < 8ms, medium < 16ms, complex < 50ms. Bundle chunk limit is 100kb per chunk; total bundle under 500kb. No memory leaks, no missing cleanup in `useEffect`. Use `React.memo`, `useCallback`, `useMemo` appropriately. Route-level code splitting is required. The `performance-test` agent monitors render times and bundle sizes.

### Git Workflow

GitHub Flow with squash merge to `main`. Branch prefix convention: `feature/`, `bugfix/`, `hotfix/`, `docs/`, `release/`. All commits must use conventional commit format (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`). Never use `--no-verify`. Pull requests require review before merge (2 reviewers for `main`, 1 for feature branches). Branch lifetime should not exceed 7 days. Use the `git-commit` agent for all commits.

### Testing

Unit tests: 70% of test suite, fast and isolated. Integration tests: 20%. E2E tests: 10% covering critical user journeys. All tests must have assertions — no fake or empty test bodies. Coverage targets: 90%+ lines, 85%+ branches, 95%+ functions. Flaky tests are not tolerated (retry on failure, detect non-determinism). See the `test-generation` skill for test patterns and the `integration-test` agent for Playwright workflows.

### GitHub

Branch protection on `main` requires signed commits, 2 approving reviews, linear history, and passing status checks (TypeScript, ESLint, Tests, Security, Bundle Size, FSD Validation). `develop` requires 1 review and passing checks. Dependabot is configured for daily npm security updates. GitHub Actions use least-privilege permissions; only verified actions from `actions/` namespace are allowed. Secrets are managed through GitHub Secrets, never hardcoded.
