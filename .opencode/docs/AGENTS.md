# OpenCode AI Agent Instructions

Project: Resume Portfolio v3.0.0
Last updated: 2026-07-18

---

## Expected Repository Structure

```
resume/
├── src/
│   ├── app/               App setup: providers, routing, entry point
│   ├── pages/             Page compositions (HomePage, AboutPage, etc.)
│   ├── widgets/           Compositional units (Sidebar)
│   ├── features/          User interactions (Hero, About, Skills, Contact, etc.)
│   ├── entities/          Business entities (Developer, Project, Job, Skill)
│   ├── shared/
│   │   ├── ui/            UI kit (Button, Card, Input, Modal, Toast, etc.)
│   │   ├── lib/           Utilities (contexts, helpers, i18n config)
│   │   └── types/         Shared TypeScript types
│   └── tests/             Test utilities and setups
├── docs/
│   └── specs/             Functional and technical specifications
├── .opencode/             OpenCode agent configuration
├── public/                Static assets
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

Key conventions:
- Feature-Sliced Design v2.1 — see `fsd-design` skill for the full decision framework
- New UI components go into `shared/ui/<ComponentName>/` with CSS Modules, stories, and tests
- New features/entities use FSD slice structure: `model/`, `ui/`, `hooks/`, `index.ts`
- EmailJS client lives in the Contact feature (`src/features/Contact/hooks/useContactForm.ts`), not in shared
- All configs at root level (vite, vitest, typescript, eslint, stylelint)

## Project Characteristics

- **State management**: React context + local state for now. Redux Toolkit is planned for introduction — follow the migration plan when it's added.
- **Theme**: Light/dark mode via `ThemeContext` (`shared/lib/contexts/ThemeContext`), persisted in localStorage, CSS custom properties for color tokens.
- **Styling**: SCSS Modules in `shared/styles/` with `variables/`, `mixins/`, `animations/`, `globals/`. All components use CSS Modules only.
- **Contact form**: EmailJS via `@emailjs/browser` — requires `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` env vars.
- **Deployment**: GitHub Pages. Two CI workflows: Strict Validation (TS + ESLint + bundle) and opencode (comment-triggered).

---

## Agents

- **orchestrator** — Coordinates multi-agent tasks and dispatches work to sub-agents.
- **guard** — MCP premoderation, prompt injection detection, PII masking, audit logging. See guard agent for security enforcement.
- **review** — Code review, quality analysis, bug detection.
- **integration-test** — Integration and e2e tests (Playwright, MSW).
- **git-commit** — Creates commits with pre-commit validation and conventional commit format.

---

## MCP Servers

- **filesystem** — File operations (project-local in `opencode.json`; global server is fallback)
- **serena** — Code symbol navigation (WSL, LSP-based)
- **codebase-memory-mcp** — Code knowledge graph (global config)
- Global config adds: **memory** (knowledge graph), **context7** (library docs), **eslint** (linting), **playwright** (browser automation), **sequential-thinking**, **engram** (persistent memory).

---

## Rules

### Response Format

Never output structured work-state summary blocks with headings like Objective, Important Details, Work State, Completed, Active, Blocked, Next Move, Relevant Files in any response or in reasoning. Answer directly and briefly in the user's language. No status headers, no session-summary templates, no progress reports unless explicitly requested.

### FSD Architecture

The project follows Feature-Sliced Design (FSD) v2.1 with strict layer hierarchy: `app` > `pages` > `widgets` > `features` > `entities` > `shared`. A layer may import from itself and all layers below it, never from layers above. Direct cross-imports between features or widgets are forbidden. All slice public APIs must use named exports through `index.ts`. See the `fsd-design` skill for the full decision framework and architecture guidance.

### Code Style

TypeScript strict mode is required: no `any` types, no implicit any, no unused variables (except `_` prefix). React hooks must have complete dependency arrays; no direct state mutations. CSS Modules only, no `!important`, no global styles. Use semantic HTML elements. Named exports are preferred over default exports in public APIs.

### Strict Validation

All code must pass ESLint with `--max-warnings 0`. The following are enforced as errors: `no-explicit-any`, `no-unused-vars`, `no-non-null-assertion`, `no-implicit-coercion`, `no-console`, `no-eval`, `react-hooks/exhaustive-deps`, `import/no-cycle`, and `fsd-imports/*` rules. TypeScript strict mode is enabled with all strict flags. Pre-commit hooks block commits on any lint error or type error.

### Security

No secrets, credentials, tokens, or keys in code — use environment variables or GitHub Secrets. All user input must be validated and sanitized. No `console.log` in production code, no `eval()`, no `javascript:` URLs. The guard agent enforces prompt injection detection, PII masking, MCP premoderation, path traversal blocking, and rate limiting. All MCP calls pass through guard premoderation. Blocked paths include `.git/`, `node_modules/`, `.env*`, and lock files.

### Performance

Component render budgets: simple < 8ms, medium < 16ms, complex < 50ms. Bundle chunk limit is 100kb per chunk; total bundle under 500kb. No memory leaks, no missing cleanup in `useEffect`. Use `React.memo`, `useCallback`, `useMemo` appropriately. Route-level code splitting is required. The `review` agent monitors render times, bundle sizes, and SASS quality.

### Git Workflow

Solo project on GitHub. GitHub Flow with squash merge to `main`. Branch prefix convention: `feature/`, `bugfix/`, `hotfix/`, `docs/`, `release/`. All commits must use conventional commit format (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`). Never use `--no-verify`. A PR to `main` is self-reviewed before merge; no reviewer requirement. Use the `git-commit` agent for all commits.

### Testing

Unit tests: 70% of test suite, fast and isolated. Integration tests: 20%. E2E tests: 10% covering critical user journeys. All tests must have assertions — no fake or empty test bodies. Coverage targets: 90%+ lines, 85%+ branches, 95%+ functions. Flaky tests are not tolerated (retry on failure, detect non-determinism). Use the `integration-test` agent for Playwright workflows.

Write tests and stories by following existing components in `src/shared/ui/` as the source of truth (e.g. `Button.test.tsx`, `*.stories.tsx`) — do not invent patterns. Forbidden in tests: asserting raw CSS class names (CSS Modules hash them, e.g. `toHaveClass('primary')` fails — use `data-testid` or `toHaveClass(/variant/)` instead), relative imports in mocks (`vi.mock('../../...')` — use the `@/` alias), and brittle text selectors (`getByText('Error')` — prefer `getByRole`/`getByLabelText`).

### GitHub

Single-maintenance GitHub repo (`main` + `dev` + short-lived feature branches). CI status checks (TypeScript, ESLint, Tests, Bundle Size, FSD Validation) must pass on PRs. GitHub Actions use least-privilege permissions; only verified actions from `actions/` namespace are allowed. Secrets are managed through GitHub Secrets, never hardcoded.
