# FSD Architecture — Resume Portfolio

## Layer Mapping

| Layer       | Project contents                                                               |
| ----------- | ------------------------------------------------------------------------------ |
| `app/`      | Providers (Theme, I18n, Toast), root layout, App entry point                   |
| `pages/`    | `HomePage` — single page composing all features                                |
| `widgets/`  | `Sidebar` with navigation, mobile menu, header, toggles                        |
| `features/` | Hero, About, Skills, MyWork, WorkHistory, Contact, ThemeSwitch, LanguageSwitch |
| `entities/` | Developer, Project, Job, Skill — business models with types and constants      |
| `shared/`   | UI kit (24 components), lib/utils, contexts, styles, types                     |

## Routing

No router library. Single-page app: App > Providers > HomePage > Sidebar + Sections.

## Import Rules

- Layers import only from themselves and layers below
- Features/widgets cross-imports forbidden — extract to shared or compose from page
- `@/` alias resolves to `src/` — no relative cross-layer imports
- Each slice exports via `index.ts` (named exports only)

## When to Create

- **Entity**: business concept with types + constants + logic, used in 2+ features
- **Feature**: complete user interaction, confirmed multi-use
- **Shared UI**: move to `shared/ui/` only when used in 2+ slices

See `.opencode/skills/fsd-design/SKILL.md` for the full decision framework.
