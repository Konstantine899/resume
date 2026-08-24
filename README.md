# Resume

> Personal resume / portfolio site — React + TypeScript + Vite, built with Feature-Sliced Design.

## Tech stack

- React 18 + TypeScript (strict)
- Vite
- SCSS (with Stylelint)
- Feature-Sliced Design (FSD) architecture
- Vitest + Testing Library (unit/component tests)
- Husky + lint-staged + Prettier + ESLint + Stylelint
- EmailJS (contact form) — see `docs/adr/0003-emailjs-integration.md`
- i18n — see `docs/specs/i18n-spec.md`
- No state-management library — see `docs/adr/0007-no-state-management-library.md`

## Prerequisites

- Node.js (see `.nvmrc` if present)
- npm

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script                  | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run dev`           | Start Vite dev server                                               |
| `npm run build`         | Production build                                                    |
| `npm run preview`       | Preview the production build                                        |
| `npm run type-check`    | TypeScript typecheck (`tsc --noEmit`)                               |
| `npm run lint`          | ESLint (zero warnings allowed)                                      |
| `npm run lint:styles`   | Stylelint on `*.scss`                                               |
| `npm run lint:all`      | `lint` + `lint:styles`                                              |
| `npm run test`          | Vitest (watch)                                                      |
| `npm run test:coverage` | Vitest with coverage                                                |
| `npm run format`        | Prettier write                                                      |
| `npm run validate`      | `type-check` + `lint:all` + `vitest run --coverage` — the full gate |
| `npm run prepare`       | Install Husky hooks                                                 |

## Project structure (FSD)

```
src/
  app/         # app init, providers, routing
  pages/       # routed pages
  widgets/     # composite blocks
  features/    # user interactions
  entities/    # business entities
  shared/      # UI kit, lib, config, api
```

See `docs/context.md` and `docs/adr/` for the full domain model and decisions.

## Documentation

All architecture decisions, specs, and process docs live in [`docs/`](./docs):

- `docs/context.md` — domain context
- `docs/adr/` — Architecture Decision Records
- `docs/specs/` — feature specs (proposal / design / spec / tasks)
- `docs/agents/` — agent/triage workflow

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and PRs follow the branch/PR policy described there.

## License

[MIT](./LICENSE)
