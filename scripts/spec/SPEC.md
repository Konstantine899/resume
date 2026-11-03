# SPEC — генератор FSD-слайсов и скрипты репозитория

| Field   | Value                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| Status  | draft                                                                                                           |
| Date    | 2026-10-04                                                                                                      |
| Change  | 2026-10-04: nested `model/{types,slices,selectors,constants}` subdirectories — owner directive (REQ-G8 amended) |
| Plan    | `resume-app/wiki/plan/implementation-plan.md` (Obsidian vault; revision 2 — review findings applied)            |
| Source  | `Konstantine899/advansed-frontend-app` @ `master`, `scripts/` (19 files, 17 executable, all read)               |
| Target  | resume-app @ `dev` — Vite 8 / React 19 / TS 6.0 / RTK 2.13 / Storybook 10, ESM (`"type": "module"`)             |
| Tracker | `scripts/spec/TODO.md` (staged task breakdown)                                                                  |

---

## 1. Цель

Адаптировать скрипты автоматизации `advansed-frontend-app` под resume-app: fail-fast
**генератор FSD-слайсов**, два **инструмента проверки границ** и **единый источник правды для
слоёв FSD** — всё это проходит `npm run validate` на сгенерированном выводе без единой ручной
правки.

## 2. Область

### 2.1 В области (результаты)

| ID  | Результат                                                                                                      | Путь                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| D1  | SSOT для слоёв FSD + тонкая ESM-обёртка                                                                        | `scripts/fsd-layers.json`, `scripts/fsd-layers.mjs`                           |
| D2  | Генератор слайсов (переписанные шаблоны, семантика fail-fast)                                                  | `scripts/createSlices/**` + npm `generate:slice`                              |
| D3  | Проверка консистентности алиасов (по умолчанию dry-run)                                                        | `scripts/refactoring/update-imports.mjs` + npm `refactor:imports`             |
| D4  | Проверка public API `shared/ui` (dry-run / `--fix`)                                                            | `scripts/refactoring/check-shared-ui-public-api.mjs` + npm `check:public-api` |
| D5  | Тесты для D1–D4                                                                                                | `scripts/__tests__/**`                                                        |
| D6  | Записи решений и документация                                                                                  | раздел AGENTS.md, статусы `wiki/scripts/*`, engram + vault                    |
| D7  | Рабочий процесс spec-фазы: каркас `spec/` в фазе A (по умолчанию) + `--scaffold` в фазе B (с гейтом одобрения) | `scripts/createSlices/**` + npm `generate:slice`                              |
| D8  | Spec-гейты `check:spec` / `spec:status` + доп. скелеты из секции «Планируемые файлы» (Этап 2)                  | `scripts/{check-spec,spec-status,spec-tools}.mjs` + npm-скрипты               |

### 2.2 Вне области (что не входит, зафиксированные решения)

- `clear-cache.js`, `getApiUrl.js` + `build:dev` (xargs), Loki `generate-visual-json-report.js` —
  не портированы (нет `postinstall`, мёртвый `__API__`, нет `.loki/`; POSIX-конвейеры запрещены).
- Исходные файлы `README.md` (учебный материал другого проекта).
- Авто-правка композиционного корня (`src/storeReducers.ts`, `src/pages/routerConfig.tsx`,
  `src/pages/Home/ui/HomePage/HomePage.tsx`, `en.json`/`ru.json`) — вместо этого эти шаги
  эмитятся как рабочие единицы в `spec/TODO.md` фазы A (REQ-G14).
- Пользовательский текст в сгенерированном коде → в v1 i18n-ключи никогда не эмитятся.

## 3. Требования

### 3.1 SSOT — слои (REQ-S)

- **REQ-S1** `scripts/fsd-layers.json` — ЕДИНСТВЕННОЕ место, которое объявляет слои FSD. Ни один
  скрипт не может объявлять локальный массив слоёв (контролируется ревью и правилом в AGENTS.md).
- **REQ-S2** Точный вид файла:

  ```json
  {
    "layers": ["app", "shared", "entities", "features", "widgets", "pages"],
    "generatorLayers": ["entities", "features", "pages", "widgets"],
    "allowedImports": {
      "app": ["shared"],
      "pages": ["app", "pages", "widgets", "features", "entities", "shared"],
      "widgets": ["app", "pages", "features", "entities", "shared"],
      "features": ["entities", "shared"],
      "entities": ["shared"],
      "shared": ["shared"]
    }
  }
  ```

  `generatorLayers` = четыре слайс-слоя — **решение OPEN-1 (владелец, 2026-10-04): генератор
  должен работать одинаково в ЛЮБОМ слайс-слое**, поэтому каждый слой генерации эмитит
  идентичное дерево (REQ-G8) без вариантов по слоям. То, что у четырёх существующих entities
  нет `ui/`, рассматривается как история, а не как правило слоя. **Решение OPEN-2 (владелец,
  2026-10-04): `pages` включён с первого дня** — регистрация маршрутов остаётся ручным гейтом
  (Next steps, REQ-G11); `shared` и `app` остаются вне области (другая структура слайса).

- **REQ-S3** `.opencode/eslint/eslint-plugin-fsd-imports.cjs` читает JSON через
  `require('../../scripts/fsd-layers.json')` — глубина `../../` от `.opencode/eslint/`.
  **`../../../` выходит за корень репозитория и не должна использоваться** (упадёт каждый
  `npm run lint`).
- **REQ-S4** Гигиена плагина: отслеживаемый тест `.opencode/eslint/eslint-plugin-fsd-imports.test.js`
  импортирует `./eslint-plugin-fsd-imports.js`, который **в gitignore (`*.js`) и отсутствует в
  свежем клоне**, и ни один glob vitest не выполняет этот тест (`.opencode/eslint/**` нет в
  `include`). Решение (OPEN-3): перенаправить тест на реализацию `.cjs` и добавить
  `.opencode/eslint/**` в `include` vitest unit (изменение конфига с одобрения человека), либо
  удалить тест. Рабочий плагин остаётся тем `.cjs`, который загружает `eslint.config.js`.
- **REQ-S5** Тест инвариантов (`scripts/__tests__/fsd-layers.test.ts`):
  - `keys(allowedImports) == layers` (равенство множеств);
  - `generatorLayers ⊆ layers`;
  - `layers ⊆ keys(BuildPath in vite.config.ts)` **минус**
    `{src, locales, buildLocales}` (проверка подмножества — наивное равенство множеств падает
    на лишних ключах);
  - регулярки слоёв внутри плагина строятся ИЗ JSON (без второго захардкоженного списка).
- **REQ-S6** После внедрения REQ-S3 плагинная сторона инварианта становится тавтологией;
  осмысленные утверждения — сторона vite/конфига + построение регулярок. Задокументировать это
  в тесте.

### 3.2 Генератор — `scripts/createSlices/` (REQ-G)

- **REQ-G1** CLI: `npm run generate:slice -- <Layer> <SliceName> [--with-slice] [--force] [--dry-run] [--scaffold]`.
  Две фазы (рабочий процесс spec-фазы, план, одобренный владельцем
  `wiki/plan/plan_spec_workflow.md`, 2026-10-07): ПО УМОЛЧАНИЮ = фаза A — только каркас
  `spec/SPEC.md` + `spec/TODO.md` (сначала планирование, без кода); `--scaffold` = фаза B —
  эмит дерева кода REQ-G8, допустимо только если SPEC слайса несёт `status: approved`
  (REQ-G14, REQ-G15). Точка входа `scripts/createSlices/index.mjs`; все модули `.mjs` ESM
  (точка входа `.ts` упала бы на `no-console` в `npm run lint` — проверено).
- **REQ-G2** Валидация: `layer ∈ generatorLayers`; `SliceName` соответствует
  `/^[A-Z][a-zA-Z0-9]*$/`; `await run()` внутри `try/catch` → `process.exitCode = 1`
  (никогда не молчаливый exit 0).
- **REQ-G3** Правила именования:

  | Артефакт                     | Правило                                                         | Пример (`ContactForm`)               |
  | ---------------------------- | --------------------------------------------------------------- | ------------------------------------ |
  | Директория / компонент       | PascalCase, аргумент как есть                                   | `ContactForm`                        |
  | RTK `name`, ключ стора, файл | первый символ в нижнем регистре                                 | `contactForm`, `contactFormSlice.ts` |
  | SCSS-класс                   | camelCase (паттерн stylelint)                                   | `.contactForm`                       |
  | Заголовок сториса            | `<LayerPascal>/<Name>`                                          | `Features/ContactForm`               |
  | `data-testid`                | kebab: `s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()` | `contact-form`, `contact2-form`      |

- **REQ-G4** Запись «всё или ничего»: собрать полный список путей назначения → проверка
  конфликтов → записать всё дерево в staging-директорию рядом с целью
  (`src/<layer>/.<Name>.tmp-<ts>/`, та же файловая система) → атомарный `rename` на место →
  удалить staging при любой ошибке. Целевая директория никогда не остаётся в смешанном
  состоянии (убивает CRITICAL-issue #1 и HIGH #3/#4 исходника).
- **REQ-G5** Существующая цель без `--force` → ошибка **до любой записи**, exit 1, дерево
  байт-в-байт (регрессионный тест с контрольными суммами). С `--force`: семантика подмены
  (staged-дерево атомарно заменяет цель с откатом при ошибке); **заменяются только файлы,
  которыми владеет генератор, — чужие файлы никогда не удаляются**, о них сообщается в выводе.
- **REQ-G6** Сообщение о восстановлении при остаточной или неполной цели:
  `Target <path> already exists. Remove it manually or rerun with --force.`
- **REQ-G7** `--dry-run`: печатает полное будущее дерево файлов, ноль записей, exit 0.
- **REQ-G8** Дерево кода — эмитится ТОЛЬКО `--scaffold` (фаза B, после `status: approved`,
  REQ-G15) — база (без `--with-slice`):

  ```
  src/<layer>/<Name>/
  ├── index.ts
  ├── model/
  │   └── types/
  │       └── index.ts      # <Name>Props (nested model: types live in model/types/)
  └── ui/
      └── <Name>/
          ├── <Name>.tsx
          ├── <Name>.test.tsx
          ├── <Name>.stories.tsx
          └── <Name>.module.scss
  ```

  Дополнительно с `--with-slice`:

  ```
  ├── model/
  │   ├── types/
  │   │   └── index.ts      # + <Name>State, <Name>RootState (structural)
  │   ├── slices/
  │   │   ├── <name>Slice.ts      # file MUST match *Slice.ts (no-param-reassign override)
  │   │   └── <name>Slice.test.ts
  │   └── selectors/
  │       └── index.ts
  ```

  **Amended 2026-10-04 (owner directive): nested `model/`.** `model/` contains ONLY the
  subdirectories `types/`, `slices/`, `selectors/`, `services/`, `constants/` — flat files
  directly in `model/` are forbidden (supersedes the flat-model `AdminAuth`/`About`
  precedent of the previous revision). The generator always emits `types/`; `slices/` +
  `selectors/` only with `--with-slice`; `services/` and `constants/` are never auto-created
  (empty directories are not committable) — they are created by hand when real files
  appear. Cross-directory template imports use `../types` and `../selectors`; barrel
  specifiers `./model/types` and `./model/selectors` resolve unchanged (directory +
  `index.ts`); the same holds for `./model/constants`.

  The tree is IDENTICAL in every generator layer (`entities`, `features`, `pages`, `widgets`) —
  OPEN-1 decided (owner): no per-layer variants in v1. If a data-only slice is ever needed,
  that is a separate explicit decision (e.g. a `--no-ui` flag), never a silent layer
  special-case.

- **REQ-G9** `model/types/index.ts` content: without slice — `<Name>Props` only; with slice — plus
  `<Name>State` (≥1 field; `no-empty-object-type`) and structural
  `<Name>RootState = { <name>: <Name>State }` with the composition-root comment
  (precedent: `AdminAuth/model/types` — no global RootState can exist while reducers are
  injected from `src/App.tsx`).
- **REQ-G10** `model/selectors/index.ts` (only with `--with-slice`):
  `export const select… = (state: <Name>RootState): … => state.<name>…;`
  (precedent: `AdminAuth/model/selectors`).
- **REQ-G11** The generator never edits `storeReducers.ts` / `routerConfig.tsx` / `HomePage.tsx` /
  locales; it prints a "Next steps" block with the exact reducer import snippet
  (`model/slices/<camel>Slice`) when `--with-slice` was used.
- **REQ-G12** Windows: npm scripts are plain `node <file>` — no pipes, no `xargs`, no `npx`
  inside spawned processes; subprocesses in tests use `process.execPath`.
- **REQ-G13** Emitted output must be Prettier-clean (`printWidth: 100`, single quotes) — either
  run emitted strings through `prettier.format()` (programmatic API) or assert
  `prettier --check` on the generated directory in the smoke (REQ-Q6).

### 3.3 Templates (REQ-T)

- **REQ-T1 `types.mjs`** — see REQ-G9/G10. Banner comment `// ==== <Name> — … ====`.
- **REQ-T2 `component.mjs`** — `memo` named function; props imported as
  `import type { <Name>Props } from '../model/types'` (precedent: `About.tsx`, `Nav.tsx`);
  `ReactNode` is imported ONLY by `model/types/index.ts` for the `children` slot (plan §4.5.7) —
  the component must NOT import it (unused-import lint violation; bare `React.ReactNode` is
  likewise forbidden) — _amended after the Stage-1 gates, which proved the old wording
  red under `no-unused-vars`_;
  `className={classNames(styles.<camel>, {}, [className])}` with
  `import { classNames } from '@/shared/lib/utils/classNames'` — **the only allowed path**
  (forbidden: `clsx`, `classnames`, `shared/lib/classNames/…`);
  `data-testid` default = kebab name; **no console, no `any`, no unused imports, no hardcoded text.**
- **REQ-T3 `component-test.mjs`** — explicit
  `import { describe, expect, it } from 'vitest'` (precedent: `About.test.tsx`; `globals: true`
  exists but the codebase convention is explicit imports) + `@testing-library/react`;
  cases: default `data-testid` present, custom `className` merged (selector fixed against actual
  markup before landing), children render.
- **REQ-T4 `story.mjs`** — CSF3 for SB 10:
  `import type { Meta, StoryObj } from '@storybook/react-vite'`,
  `satisfies Meta<typeof <Name>>`, `tags: ['autodocs']`,
  `title: '<LayerPascal>/<Name>'`. No `ComponentStory`/`Template.bind`.
- **REQ-T5 `style.mjs`** — `.<camel> {\n  /* styles go here */\n}` (comment mandatory:
  `block-no-empty`; empty file → `no-empty-source`); tokens via `var(--…)`, no raw hex, no `@use`.
- **REQ-T6 `redux-slice.mjs`** (only `--with-slice`) — `createSlice` with named action exports;
  lazy-hydration wrapper `export const <name>Reducer: typeof <name>Slice.reducer = (state, action) =>
<name>Slice.reducer(state ?? initialState, action)` + lesson comment (`resume-rtk-lazy-hydration`);
  file name `*Slice.ts` at `model/slices/<name>Slice.ts` (scope of the
  `no-param-reassign` override).
- **REQ-T7 `selectors.mjs`** — see REQ-G10.
- **REQ-T8 `index.mjs`** — banner + **named re-exports only** (no `export *`):
  base: `export { <Name> } from './ui/<Name>';` + `export type { <Name>Props } from './model/types';`
  with slice: also `<Name>State`, `<Name>RootState`, reducer, actions, selectors.
- **REQ-T9** Every template must pass all four gates (type-check, eslint, stylelint, vitest
  coverage) as an isolated sample BEFORE the generator ships (stage 0.5).

### 3.4 Refactoring tools (REQ-R)

- **REQ-R1** `update-imports.mjs` — dry-run by default (prints specifiers whose first segment is
  an FSD layer but is not `@/`-prefixed); `--fix` rewrites to `@/<specifier>`; layer detection
  from SSOT; helper named `startsWithFsdLayer` (fixes the source's `isAbsolute` misnomer);
  expected result on current `src`: **0 findings**.
- **REQ-R2** `check-shared-ui-public-api.mjs` — explicit guard: missing `src/shared/ui` → clear
  error + exit 1 (no silent no-op). Pass 1: directories without `index.ts` (dry-run lists;
  `--fix` creates barrels with **named** re-exports, never `export *`). Pass 2: deep imports
  `@/shared/ui/<C>/<X>` → `@/shared/ui/<C>` (dry-run exit 1 on violations; `--fix` rewrites).
  Every `file.save()` / `project.save()` is awaited (no floating promises).
  **Amended 2026-10-04 (evidence, Stage 2):** pass 2 skips a deep import when the first segment
  after the component is a sanctioned internal segment (`lib`, `constants`, `types`, `model` —
  mirrors `public-api-only.allowInternal` in `eslint.config.js`). Forcing the real tree's 18
  `model`/`lib` deep imports through barrels breaks type-check (symbols such as
  `getFallbackColor`, `validateDividerProps`, `ToastAction` are deliberately not
  barrel-exported) and would contradict the ESLint gate inside `npm run validate` (OPEN-6);
  the literal predicate would also make smoke S7's clean-tree exit 0 impossible.
- **REQ-R3** Runtime: **Variant A** — ESM `.mjs` + `ts-morph` (latest per `resume-version-policy`),
  zero config changes (decision OPEN-4; fallback Variant B `.ts` + `tsx` + config edits listed in
  the plan §2.4).
- **REQ-R4** `--fix` must be idempotent (second run → 0 changes).
- **REQ-R5** Dry-run on a clean tree exits 0 for both tools (usable as a CI gate; adding
  `check:public-api` to `npm run validate` is OPEN-6).

### 3.5 Tests and quality gates (REQ-Q)

- **REQ-Q1** Test location: `scripts/__tests__/**` (co-located `__tests__` style of the repo).
  They run in the vitest `unit` project only after `include` gains
  `scripts/**/*.{test,spec}.{ts,tsx,mjs}` (OPEN-5, human-approved config change).
  Fallback if refused: a dedicated vitest project `scripts` with `environment: 'node'` —
  do NOT rely on tests that never execute.
- **REQ-Q2** Type-check coverage: `scripts/**/*.ts` must be in the **root** `tsconfig.json → include`
  — the root project is the only one `npm run type-check` runs (`tsc --noEmit`; `references` are
  ignored by plain `tsc`). **Amended 2026-10-04 (evidence):** `tsconfig.node.json` belongs to no
  gate and is red today with pre-existing errors (TS5097 ×4, TS7016 ×1), so `scripts/**` there
  would gate nothing; root-include was implemented instead and the gotcha recorded in AGENTS.md
  (`resume-tsconfig-node-dead`). Tests outside the root include are invisible to the gate.
- **REQ-Q3** Generator tests spawn the CLI via `execFile(process.execPath, [entry, …args])` in a
  temp root (`--root` / `SLICE_ROOT` env) — never through a shell, never `spawn('node')`.
- **REQ-Q4** Required tests (TDD — written before implementation):
  1. naming helpers: Pascal/camel/kebab cases incl. digits (`Contact2`, `OAuthClient2`);
  2. CLI validation: bad layer / lowercase name / `with-dash` → exit 1;
  3. tree equals REQ-G8 (base and `--with-slice`);
  4. rerun without `--force` → exit 1 and target checksum unchanged (CRITICAL regression);
  5. `--dry-run` → zero filesystem writes;
  6. template content assertions: allowed `classNames` path present; forbidden substrings absent
     (`clsx`, `classnames`, `useTranslation`, `shared/lib/classNames`, empty `interface X {}`,
     `ComponentStory`, `Template.bind`);
  7. SSOT invariant (REQ-S5);
  8. `update-imports`: fixture with/without `@/`; `--fix` idempotency;
  9. `check-shared-ui-public-api`: missing-dir guard → exit 1; barrel emission format;
     deep-import fix; clean-tree exit 0.
- **REQ-Q5** Smoke matrix (each stage's integration point):

  | #   | Check                                                                                         |
  | --- | --------------------------------------------------------------------------------------------- |
  | S1  | all 7 templates through type-check + eslint + stylelint in a tmp dir (stage 0.5)              |
  | S2  | `generate:slice -- features SmokeSlice` → `npm run validate` green, no manual edits           |
  | S3  | same with `--with-slice` → `npm run validate` green (coverage + `*Slice.ts` override)         |
  | S4  | new story builds: `npm run build-storybook` or `npm run test:storybook`                       |
  | S5  | rerun same command → exit 1, `git status` unchanged                                           |
  | S6  | `prettier --check` on the generated directory (REQ-G13)                                       |
  | S7  | refactoring tools: dry-run exit 0 on clean tree; `--fix` on artificially broken tree + revert |
  | S8  | cleanup of smoke slice → `npm run validate` green again                                       |

- **REQ-Q6** Coverage thresholds stay untouched (branches 85 / functions 87 / lines 92 /
  statements 90). `**/scripts/**` remains coverage-excluded; S2/S3 are the empirical R8 gate.
- **REQ-Q7** Code style of the scripts themselves: English identifiers/comments (Language Domain
  Contract), `no-console`-safe entry handling in `.ts` files, no POSIX-only shell constructs.

## 4. Acceptance criteria

1. All deliverables D1–D6 present; all REQ-G/R/S/Q demonstrably satisfied by tests + smoke S1–S8.
2. `npm run validate` green on every stage boundary; generated slice requires zero manual edits.
3. `scripts/fsd-layers.json` is the single layer list (grep across scripts + plugin shows none).
4. Rerun-safety regression test in place; `--force` never deletes foreign files.
5. All OPEN decisions (§5) recorded with an answer and date before the stage they block.
6. AGENTS.md section + engram/vault dual-write done (stage 4).

## 5. Open decisions (block the listed stage)

| ID     | Question                                            | Recommendation                                                                                                                                                                                                                                                                                      | Blocks    | Status      |
| ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| OPEN-1 | Keep `entities` in `generatorLayers`?               | **Yes — decided (owner, 2026-10-04): uniform generation in any slice layer**; the "existing entities have no `ui/`" observation is history, not a rule. Superseded requirement: uniform tree, no per-layer variants (REQ-G8)                                                                        | Stage 1   | **decided** |
| OPEN-2 | Add `pages` to `generatorLayers`?                   | **Yes — decided (owner, 2026-10-04): included from day one**; route registration stays a manual gate (REQ-G11). `shared`/`app` remain out of scope (different slice structure)                                                                                                                      | Stage 1   | **decided** |
| OPEN-3 | Wire or delete `eslint-plugin-fsd-imports.test.js`? | **Repoint to `.cjs` + add `.opencode/eslint/**` to vitest include** — decided (owner, 2026-10-04)                                                                                                                                                                                                   | Stage 0   | **decided** |
| OPEN-4 | Refactoring tools: `.mjs` (A) or `.ts`+`tsx` (B)?   | **A — decided (owner, 2026-10-04): ESM `.mjs` + `ts-morph` (latest), zero config changes**; Variant B (`.ts` + `tsx` + config edits) stays documented in plan §2.4 as the fallback                                                                                                                  | Stage 2   | **decided** |
| OPEN-5 | Extend vitest `include` with `scripts/**`?          | **Yes** (fallback: dedicated node project) — decided (owner, 2026-10-04)                                                                                                                                                                                                                            | Stage 0/1 | **decided** |
| OPEN-6 | Add `check:public-api` to `npm run validate`?       | **Yes — decided (owner, 2026-10-04): appended as the final step of `npm run validate`** after Stage 2 (clean-tree exit 0 proven by smoke S7)                                                                                                                                                        | Stage 2   | **decided** |
| OPEN-7 | Implement `print-env.mjs`?                          | **No — decided 2026-10-04 (Stage 3): no real need exists**; `__API__` is defined (`config/vite/buildViteConfig.ts:61`) but unused anywhere in `src` (only the `vite-env.d.ts` declaration), so there is no env to print. Revisit only when a concrete task needs env inspection (Stage 3 / plan §7) | Stage 3   | **decided** |
