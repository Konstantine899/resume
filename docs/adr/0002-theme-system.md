# ADR 0002: Theme System

**Status:** ✅ Accepted  
**Date:** 2026-07-18

## Context

The resume portfolio needs light and dark mode. Requirements:

- Theme must persist across sessions
- No Flash of Unstyled Content (FOUC) on page load
- Zero runtime layout shift on theme switch
- Easy to add new theme tokens without touching components
- No dependency on external CSS-in-JS libraries

## Decision

Use **CSS custom properties** (CSS variables) for color tokens, with React `ThemeContext` for theme state management.

**Architecture:**

1. `shared/styles/variables/colors.css` — defines `--color-*` custom properties with light theme defaults
2. `shared/styles/variables/themes.css` — `[data-theme="dark"]` overrides for dark mode values
3. `shared/lib/contexts/ThemeContext` — React context that reads from `localStorage` and toggles `data-theme` on `<html>`
4. SCSS modules reference CSS custom properties directly: `color: var(--color-text-primary)`

**Theme application on load:**

- Script in `<head>` checks `localStorage` before React hydrates
- Sets `data-theme` on `<html>` immediately — zero FOUC

## Consequences

### Positive

- Zero runtime — CSS custom properties are native, no JS overhead for theme switching
- No FOUC — theme is applied before React mounts
- Easy to add new tokens without changing components
- Works with any styling solution (SCSS modules, Tailwind, etc.)
- All components use the same token set by default

### Negative

- No type safety on CSS variable names (can be mitigated with a TypeScript constants file)
- IE11 not supported (CSS custom properties unsupported)
- Dark mode requires duplicating every color variable in `[data-theme="dark"]`

## Alternatives Considered

| Alternative                     | Reason against                                               |
| ------------------------------- | ------------------------------------------------------------ |
| styled-components ThemeProvider | CSS-in-JS overhead at runtime; no benefit over CSS variables |
| Tailwind dark: variant          | Not using Tailwind; CSS variables are framework-agnostic     |
| Redux for theme state           | Overkill for a boolean `isDark` value; context is sufficient |
| CSS modules with class toggle   | More coupling between theme switch and component styles      |
