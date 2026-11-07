# resume-frontend — agent notes

React + Vite + TypeScript + Storybook + Vitest + Playwright. FSD structure.

## Commands

- `npm run type-check` — TypeScript.
- `npm run lint` / `npm run lint:fix` — ESLint.
- `npm run lint:styles` / `npm run lint:styles:fix` — Stylelint for SCSS.
- `npm run format` / `npm run format:check` — Prettier.
- `npx vitest run --project=unit` — unit tests.
- `npm run test:storybook` — Storybook tests.
- `npm run test:app` — build + Playwright.
- `npm run build` — production build.
- `npm run validate` — type-check + lint + unit coverage + public API.
- `npm run check:public-api`, `check:spec`, `check:contract` — architecture/contract checks.
- `npm run storybook` — Storybook dev server.

## Rules

- Never read or print `.env` or `.env.*`; use `.env.example`.
- Keep the shared UI public API stable; run `npm run check:public-api` after moving or exporting components.
- Respect FSD import boundaries; `npm run lint` enforces them.
- Do not push or rewrite Git history. Local commits only with user approval.
- The OpenCode project config lives in `opencode.json`; edit it only when asked.
