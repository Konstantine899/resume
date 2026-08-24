# Contributing

Thanks for wanting to contribute. This repo enforces a lightweight but strict workflow so that every change is reviewable and traceable.

## Branching

- Base all work on `main` (or the relevant feature branch when `main` is behind).
- Name branches `type/issue-slug`, e.g. `feat/42-label-improvements`, `fix/17-contact-form`, `chore/p0-governance-fixes`.
- Every branch must end in either a merged PR or an explicit decision to discard — no long-lived orphan branches.

## Pull requests

- Open a **draft PR as soon as work starts** and keep it updated. A branch without an associated PR is an error.
- Announce the current branch and the task in progress at the start of each unit of work.
- Do **not** merge without explicit human approval.

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`, `build:`.
- Never add `Co-Authored-By` / AI attribution. The human leads; tooling executes.
- Keep commits as reviewable work units; keep tests and docs with code.

## Validation gate

Before any work is "done", this must pass locally:

```bash
npm run validate
```

It runs type-check, lint (zero warnings), and the Vitest suite with a real coverage gate. Husky also runs lint-staged on every commit.

## Tests

- New behavior gets tests. The project runs in strict TDD where applicable (see `docs/adr/0005-strict-tdd-mode.md`).
- Run `npm run test` (watch) or `npm run test:coverage`.

## Issues

Issues and specs live as GitHub issues, managed via `gh` and the triage roles in `docs/agents/triage-labels.md`.

## Code style

- Prettier + ESLint + Stylelint are enforced via Husky pre-commit. Do not bypass them.
- UI strings go through the i18n system — no hardcoded user-facing copy.
