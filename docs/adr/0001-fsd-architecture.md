# ADR 0001: Feature-Sliced Design v2.1

**Status:** ✅ Accepted  
**Date:** 2026-07-18

## Context

The project (resume portfolio v3) needed a frontend architecture that:

- Scales from a single-page site to a multi-page application
- Keeps components organized as the project grows
- Enforces predictable dependency direction
- Is familiar to other developers joining the project
- Doesn't over-engineer for the current small scope

The previous architecture was ad-hoc — components were scattered across folders without a clear hierarchy, imports crossed layers unpredictably, and there was no separation between UI, business logic, and data.

## Decision

Adopt [Feature-Sliced Design (FSD)](https://feature-sliced.design/) v2.1 with strict layer hierarchy:

```
app → pages → widgets → features → entities → shared
```

Each layer may import from itself and all layers below, never from layers above. Direct cross-imports between features or widgets are forbidden. Public APIs must use named exports through `index.ts`.

The project starts with `shared/`, `pages/`, and `app/`. `entities/` and `features/` were added when extraction provided clear value (developer data, skills, projects as entities; hero, about, contact as features).

## Consequences

### Positive

- Clear dependency direction — no circular imports
- Predictable code placement — every file has one obvious home
- Easy to add new features without restructuring
- Team convention alignment with industry FSD practice

### Negative

- Initial migration cost to restructure existing components
- More directories than flat architecture
- Learning curve for developers unfamiliar with FSD

### Neutral

- FSD's `widgets/` layer is used sparingly (only `Sidebar`)
- The `processes/` layer is omitted — not needed at this scale

## Alternatives Considered

| Alternative            | Reason against                                                     |
| ---------------------- | ------------------------------------------------------------------ |
| Atomic Design          | Too rigid for this scale; molecules/organisms boundaries are vague |
| Flat structure         | Works for small apps but doesn't scale; no import guardrails       |
| Self-contained modules | No standard dependency direction; risks circular imports           |
| No architecture        | Current state before v3 — led to ad-hoc organization               |
