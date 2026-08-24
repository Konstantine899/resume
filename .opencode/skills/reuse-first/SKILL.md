---
name: reuse-first
description: "Trigger: new component, new hook, new UI element, duplicate logic, raw HTML element. Check shared/ui and shared/lib for existing implementations and reuse them before writing new code."
license: Apache-2.0
metadata:
  author: "konstantine"
  version: "1.0"
---

# Reuse-First

## Activation Contract

Load before creating any new UI component, hook, utility, or when about to write raw HTML elements or re-implement existing behavior.

## Hard Rules

1. Before creating a component or writing a raw element (`input`, `button`, `textarea`, etc.), check `src/shared/ui/` for an existing kit component. Use it.
2. Before writing a hook or utility for behavior (positioning, focus trap, scroll lock, ESC handling, click outside, i18n), check `src/shared/lib/hooks/` and `src/shared/lib/utils/`. Use the existing one.
3. Do not copy behavior into a new slice when a shared module already provides it. Extend the shared module with options instead.
4. Do not add a production dependency for behavior a test-only path needs; production imports must not exist solely for tests.

## Decision Gates

| Situation | Action |
|-----------|--------|
| Kit component exists | Use it; extend with props before forking |
| Shared hook/util exists | Consume it; add options to the shared module |
| Neither exists | Create in shared layer, export through `index.ts` |
| Found near-duplicate logic | Consolidate into one shared module, update all callers |

## Execution Steps

1. Grep `src/shared/ui/` for a matching component; grep `src/shared/lib/` for matching hooks/utils.
2. If found, consume it. Extend via props/options, not by copy.
3. If not found, create the module in the shared layer and export it through the slice `index.ts` (no deep imports by consumers).
4. Delete or refactor any near-duplicate found while integrating.

## Output Contract

Report: which existing modules were reused, which were extended, and any duplicates consolidated. If nothing existed, state the new shared module and its `index.ts` export.

## References

- `src/shared/ui/` — kit source of truth (Button, Input family, Tooltip, Popover, Modal, Toast, Card, Divider, Link, Skeleton, Spinner, Icon)
- `src/shared/lib/hooks/` — shared hooks (useClickOutside, useKeyboardAction, theme, language, toast)
- `src/shared/lib/utils/` — shared utilities (calculatePosition, focusTrap, i18n config)
- `docs/adr/0001-fsd-architecture.md` — layer rules and index export discipline