# Release Process

This project uses simple, tag-based releases.

## Versioning

- Follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.
- `MAJOR` — breaking changes.
- `MINOR` — new features, backwards-compatible.
- `PATCH` — fixes only.

## Steps

1. Ensure `main` is green: `npm run validate` passes and the draft PR is reviewed.
2. Update the version:
   - Apps/libraries: `npm version <major|minor|patch>` (creates a commit + tag).
3. Push the tag: `git push && git push --tags`.
4. Create a **GitHub Release** from the tag with a short changelog (what changed, why).
5. The release notes link to the merged PR(s) and any relevant ADR.

## Changelog

Keep user-facing changes summarized in the GitHub Release description. A generated `CHANGELOG.md` is optional; for now the Release notes are the source of truth.

## Hotfixes

Hotfixes branch from the released tag (`fix/<version>-<slug>`), then merge back to `main` and retag as a `PATCH`.
