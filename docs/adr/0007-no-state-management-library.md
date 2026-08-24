# ADR 0007: No State Management Library

**Status:** ✅ Accepted  
**Date:** 2026-07-18

## Context

The resume portfolio needs state management for:

- Theme (light/dark)
- Language/locale
- Contact form state
- UI state (modals, toasts)

Redux Toolkit is listed in `package.json` from an earlier experiment. However, the actual state requirements are minimal — mostly UI toggles and simple form state.

## Decision

Use **React Context + local state only.** No Redux, Zustand, Jotai, or any external state management library.

**Architecture:**

1. `ThemeContext` — `light` / `dark` boolean, persisted in `localStorage`
2. Component-local `useState` / `useReducer` for form state, UI toggles
3. Props drilling limited to 1-2 levels before extraction into context

## Consequences

### Positive

- Zero external dependencies for state management
- Simple mental model — no actions, reducers, selectors, or middleware
- Faster bundle (no Redux Toolkit + React-Redux)
- Easier to debug — state is where it's used
- Bundle size: ~2KB for context vs ~12KB for Redux Toolkit

### Negative

- Context re-renders all consumers on any change (mitigated by splitting contexts)
- No DevTools for state inspection
- Would need migration if state complexity grows significantly
- `useReducer` in context can become unwieldy with many actions

## Alternatives Considered

| Alternative                             | Reason against                                                         |
| --------------------------------------- | ---------------------------------------------------------------------- |
| Redux Toolkit (already in package.json) | Overkill for 2-3 boolean/string states; adds 12KB+ bundle; boilerplate |
| Zustand                                 | Elegant but unnecessary; context is free and sufficient                |
| Jotai / Recoil                          | Atom-based mental model adds complexity where `useState` works         |
| XState                                  | Finite state machines are powerful but inappropriate for UI toggles    |
