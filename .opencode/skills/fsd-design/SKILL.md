---
name: fsd-design
description: "Trigger: architecture decision, code placement, import, refactor, FSD review. Apply Feature-Sliced Design v2.1 placement rules."
license: Apache-2.0
metadata:
  author: "konstantine"
  version: "2.1"
---

# FSD v2.1 Design Skill

## Activation Contract

Load when: deciding where code lives (page/feature/entity/shared), reviewing FSD compliance, planning a refactor, or choosing import direction.

## Hard Rules

- Layer order top→bottom: `app → pages → widgets → features → entities → shared`. A layer imports from itself and all layers below, NEVER above.
- Cross-imports: `features ↔ features` and `widgets ↔ widgets` are forbidden directly — extract to `shared/` or compose from a parent layer. `entities ↔ entities` only via `@x` (last resort).
- Type-only imports from higher layers are allowed; runtime imports are not.
- Every slice MUST have `index.ts` public API with named exports only. No default exports.
- Always use `@/` alias for cross-slice imports; never relative paths between layers.
- Import direction is enforced by `eslint-plugin-fsd-imports` (layer-dependency, public-api-only, no-circular). Run `npx eslint src/`.
- `shared/` contains no business logic.

## Decision Gates

| Where is the code used? | Placement |
|---|---|
| One page only, or duplication is manageable | Keep in that `pages/` slice |
| Reusable infra, no business logic (UI, utils, API client, types) | `shared/` |
| Complete user interaction used in 2+ places | `features/` |
| Business domain model used in 2+ places | `entities/` |
| App-wide config (providers, router, theme) | `app/` |
| Uncertain / speculative reuse | Keep in `pages/` |

Extract only when: (1) used in multiple places NOW, (2) usages don't always change together, (3) boundary has focused responsibility. Not all layers are required — most projects start with `shared/`, `pages/`, `app/`.

## Execution Steps

1. Determine where the code is used (see decision table). When in doubt, keep it in `pages/`.
2. If it becomes a slice: create `model/`, `lib/`, `ui/`, `index.ts`; export only what other slices need.
3. Create an entity ONLY when: business concept has data shape + constants + logic, referenced by 2+ features/pages, or has relationships to other entities. Remove when: concept gone, one feature references it, or it's a thin type alias.
4. Never create entities for: auth data, CRUD, one-off data, speculative reuse.
5. For cross-imports, resolve in priority order: merge slices → push domain to `entities/` → compose from upper layer (IoC) → public API access through `index.ts` only.

## Anti-Patterns (AVOID)

Premature entities; CRUD in entities (use `shared/api/`); `user` entity for auth (use `shared/lib/auth/`); abusing `@x`; extracting single-use code; god slices (>200 lines); top-level `assets/` segment; empty layer folders.

## Output Contract

Return: placement decision with layer, any slices created/modified, index.ts public API changes, and confirmation that `npx eslint src/` passes.

## References

- `references/layer-structure.md` — folder layout per layer, slice groups
- `references/cross-import-patterns.md` — strategies A–D with examples
- `references/asset-handling.md` — images, icons, fonts, PDFs
- `references/excessive-entities.md` — when to skip entities, CRUD placement, auth
- `references/migration-guide.md` — v2.0 → v2.1, non-FSD → FSD
- `references/framework-integration.md` — framework-specific setup
- `references/practical-examples.md` — auth, API, state management
- `references/slice-creation.md` — slice scaffolding details