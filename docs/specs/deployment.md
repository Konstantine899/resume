# Deployment — GitHub Pages

## Build

- **Vite** with custom config at `config/vite/buildViteConfig.ts`
- Dev server: `npm run dev` (port 3001)
- Production build: `npm run build` → outputs to `dist/`
- Bundle analysis: `npm run build:analyze`

## CI/CD (GitHub Actions)

### Workflow 1: Strict Validation

Triggers: push/PR to `main` or `develop`

| Job                     | Command                                    | Continues on fail |
| ----------------------- | ------------------------------------------ | ----------------- |
| TypeScript strict check | `npm run type-check:strict`                | No                |
| ESLint strict           | `npm run lint:strict`                      | No                |
| Full validate           | `npm run validate:strict`                  | No                |
| npm audit               | `npm audit --audit-level=moderate`         | No                |
| Bundle size check       | Compressed Size Action (< 100KB per chunk) | No                |

### Workflow 2: opencode

Triggers: issue/PR comments containing `/oc` or `/opencode`
Model: `opencode/qwen3-coder` (cloud)

## Branch Strategy

- **main** — production, protected (signed commits, 2 reviews)
- **develop** — staging, protected (1 review)
- **feature/**, **bugfix/**, **hotfix/**, **docs/**, **release/** — naming prefixes
- Squash merge to main, rebase for develop
