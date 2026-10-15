# SPEC — генератор FSD-слайсов и скрипты репозитория

| Field   | Value                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| Status  | draft                                                                                                           |
| Date    | 2026-10-07 (поправка ARCH-1 — архитектура владельца, см. REQ-G8 в §3.2; поправка spec-phase — REQ-G14/G15 §3.2) |
| Plan    | `resume-app/wiki/plan/implementation-plan.md` (Obsidian vault; ревизия 2 — замечания ревью учтены)              |
| Source  | `Konstantine899/advansed-frontend-app` @ `master`, `scripts/` (19 файлов, 17 исполняемых, все прочитаны)        |
| Target  | resume-app @ `dev` — Vite 8 / React 19 / TS 6.0 / RTK 2.13 / Storybook 10, ESM (`"type": "module"`)             |
| Tracker | `scripts/spec/TODO.md` (поэтапный разбор задач)                                                                 |

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
  │       └── types.ts      # <Name>Props (self-named file, ARCH-1: no index barrel)
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
  │   │   └── types.ts      # + <Name>State, <Name>RootState (structural)
  │   ├── slices/
  │   │   ├── <name>Slice.ts       # file MUST match *Slice.ts (no-param-reassign override)
  │   │   └── <name>Slice.test.ts
  │   └── selectors/
  │       └── selectors.ts         # self-named file, no index barrel (ARCH-1)
  ```

  **ARCH-1 (владелец, 2026-10-07) — каноническая архитектура слайса**, выведенная из ручной
  перестройки `src/` владельцем и обязательная для генератора:
  - **`ui/` — директории по компонентам**: `ui/<Name>/<Name>.{tsx,test.tsx,stories.tsx,module.scss}`
    (прецедент: `features/About/ui/About/`, `pages/Admin/ui/<Page>/`). Плоский
    `ui/<Name>.tsx` больше не эмитится.
  - **`model/` содержит ТОЛЬКО поддиректории; каждый файл назван по себе** (`types/types.ts`,
    `selectors/selectors.ts`, `slices/<name>Slice.ts`, `constants/constants.ts`,
    `schemes/schema.ts`) — внутри `model/` нет баррелей `index.ts`, поэтому импортёры пишут
    полный путь (`./model/types/types`, прецедент `entities/Job/index.ts`). Спекификаторы
    импортёров поэтому МЕНЯЮТСЯ при миграции слайса (в отличие от index-barrel-дизайна плана
    рев.4).
  - **`services/`, `constants/` и `schemes/` генератор НИКОГДА не создаёт** (пустые директории
    не коммитятся) — их делают вручную, когда появляются реальные файлы. `schemes/` — домен
    entity для zod-схем (прецедент `entities/Job/model/schemes/schema.ts`); логика
    storage/seed/session фич остаётся в `services/`.
  - Дерево ИДЕНТИЧНО в каждом слое генерации (`entities`, `features`, `pages`, `widgets`) —
    OPEN-1 (владелец, 2026-10-04) остаётся в силе; ARCH-1 меняет форму, а не правило
    униформности.
  - `shared/**` ВНЕ области: нет в `generatorLayers`, до сих пор плоский
    `shared/ui/*/model/types.ts` (план §5 / риск R6 без изменений). Две конвенции сосуществуют
    ПО ДИЗАЙНУ.

- **REQ-G9** Содержимое `model/types/types.ts`: без слайса — только `<Name>Props`; со слайсом —
  плюс `<Name>State` (≥1 поле; `no-empty-object-type`) и структурный
  `<Name>RootState = { <name>: <Name>State }` с комментарием композиционного корня
  (прецедент: `AdminAuth/model/types/index.ts` — глобального RootState не может существовать,
  пока редьюсеры инжектятся из `src/App.tsx`).
- **REQ-G10** `model/selectors/selectors.ts` (только с `--with-slice`):
  `export const select… = (state: <Name>RootState): … => state.<name>…;`
  (прецедент: `AdminAbout/model/selectors/selectors.ts`; файл назван по себе, ARCH-1).
- **REQ-G11** Генератор никогда не правит `storeReducers.ts` / `routerConfig.tsx` /
  `HomePage.tsx` / локали; эти шаги (точный сниппет импорта редьюсера
  `…/model/slices/<camel>Slice`, если использовался `--with-slice`) эмитятся как рабочие
  единицы в шаблоне `spec/TODO.md` фазы A (REQ-G14); в консоль выводится только указатель на
  следующую фазу.
- **REQ-G12** Windows: npm-скрипты — обычный `node <file>` — без труб, без `xargs`, без `npx`
  внутри порождаемых процессов; подпроцессы в тестах используют `process.execPath`.
- **REQ-G13** Эмит должен быть чист по Prettier (`printWidth: 100`, одинарные кавычки) — либо
  прогонять эмит-строки через `prettier.format()` (программный API), либо проверять
  `prettier --check` на сгенерированной директории в смоуке (REQ-Q6).
- **REQ-G14** Фаза A (ПО УМОЛЧАНИЮ, без `--scaffold`) — каркас спеков, БЕЗ кода:

  ```
  src/<layer>/<Name>/
  └── spec/
      ├── SPEC.md    # frontmatter status: draft — Цель / Контекст / Критерии приёмки /
      │              # Планируемые файлы / Что не входит / Риски / Открытые вопросы
      └── TODO.md    # frontmatter + Рабочие единицы (сгорание: выполненные удаляются)
  ```

  - Контент по умолчанию: критерии приёмки начинаются как пустой чеклист с подсказкой
    наблюдаемости (критерий = наблюдаемый исход, а не оценка); секция **«Планируемые файлы»**
    перечисляет точные пути, которые эмитит фаза B (база REQ-G8 + extras с `--with-slice`,
    плюс свободный список для доп. компонентов, заскаффолденных на следующем этапе); рабочие
    единицы ВСЕГДА включают шаги композиционного корня из REQ-G11 (импорт storeReducers —
    только с `--with-slice`, router/HomePage, i18n en+ru) и поток фаз: заполнить SPEC →
    владелец ставит `status: approved` → запустить `--scaffold` → реализовать по критериям.
  - Frontmatter, который потребляет тулинг: `status: draft | approved | done`, `epic:` (имя
    плана в vault), `issue:`, `created:`, `verified:`.
  - Общая семантика REQ-G4–G7 применяется, файлами во владении являются `spec/SPEC.md` +
    `spec/TODO.md`: `--force` фазы A заменяет пару спеков и НИКОГДА не удаляет чужие (кодовые)
    файлы.
  - `.gitignore` обязан отслеживать спек-файлы в КАЖДОМ слое генерации:
    `!src/**/spec/**/*.md` (старый `!src/features/*/spec/**/*.md` покрывал только features).
    Тест утверждает, что `git check-ignore` сообщает NOT ignored и для путей `entities/`,
    `pages/`, `widgets/`.

- **REQ-G15** Гейт и семантика `--scaffold` (фаза B):
  - нет `spec/SPEC.md` → exit 1 с командой фазы A в качестве подсказки для восстановления;
  - во frontmatter `status:` ≠ `approved` → exit 1 с указанием текущего статуса (draft / done /
    отсутствует);
  - `status: approved` → эмит дерева кода REQ-G8 через конвейер staging (REQ-G4–G7);
    спек-файлы в фазе B НЕ принадлежат генератору (после фазы A ими владеет человек — подмена
    в стиле `--force` сохраняет их как чужие файлы);
  - целевая директория должна уже существовать (фаза A выполнена раньше) — фаза B никогда не
    создаёт сам слайс;
  - при успехе в консоль выводится только указатель на `spec/TODO.md` (консольный блок
    «Next steps» бывшего REQ-G11 переехал в шаблон TODO этой поправкой).
- **REQ-G16** Доп. компоненты `--scaffold` из секции «Планируемые файлы» SPEC (Этап 2):
  - перечисленные пути диффятся против стандартного плана кода (REQ-G8); любой путь под
    `ui/<Pascal>/`, которого НЕТ в стандартном плане, регистрирует компонент `<Pascal>` —
    эмитится полная четвёрка (tsx + test + story + style) как СКЕЛЕТ: тело компонента несёт
    маркер `// TODO(spec): implement per ../../spec/SPEC.md`, а тест — три заглушки
    `it.todo(...)`, зеркалящие стандартные кейсы (сгорает вместе с рабочей единицей TODO);
  - если перечислена лишь часть файлов четвёрки (например, только `<X>.test.tsx`) —
    директория компонента эмитится целиком;
  - перечисленные пути, не подходящие под паттерн компонента (`lib/…`, `model/…`,
    директории не в PascalCase), НЕ эмитятся — они печатаются как `manual: <path>` для
    ручного создания;
  - удаление записи из «Планируемых файлов» НЕ удаляет автоматически ранее заскаффолденный
    extra (он выживает как чужой файл и о нём сообщается) — чистка вручную;
  - принятый побочный эффект (план R2): скелеты `it.todo` и нереализованные компоненты
    ПОНИЖАЮТ покрытие — слайс с extras может легитимно держать `npm run validate` красным,
    пока не будет реализован («не мержь пустое» — в этом суть). Стандартные слайсы остаются
    зелёными.
- **REQ-G17** `npm run check:spec` (`scripts/check-spec.mjs`): сканирует
  `<root>/src/**/spec/SPEC.md`; спек ПРОХОДИТ, когда статус во frontmatter — `approved` или
  `done` (`done` — это уже после одобрения; цель гейта — «ни один draft не доживает до
  реализации»; это уточняет `status != approved` из плана §1.3), любой другой статус
  (отсутствует / `draft` / неизвестен) — нарушение: перечисляется с путём, exit 1; ноль
  спеков → exit 0. `--root=<dir>` для фикстур, та же конвенция, что у CLI генератора.
- **REQ-G18** `npm run spec:status` (`scripts/spec-status.mjs`): печатает по одной строке
  `slice | status | verified` на каждый `src/**/spec/SPEC.md` — тот дашборд, который ЧИТАЕТ
  план в vault (vault никогда не правит спеки); всегда exit 0; поддерживается `--root=<dir>`.
  Оба скрипта и гейт каркаса делят ОДИН сканер/парсер frontmatter
  (`scripts/spec-tools.mjs`).

### 3.3 Шаблоны (REQ-T)

- **REQ-T1 `types.mjs`** — см. REQ-G9/G10. Баннер-комментарий `// ==== <Name> — … ====`.
- **REQ-T2 `component.mjs`** — именованная функция в `memo`; пропсы импортируются как
  `import type { <Name>Props } from '../../model/types/types'` (компонент сидит в
  `ui/<Name>/`, на два уровня ниже корня слайса; прецедент: `About/ui/About/About.tsx`);
  `ReactNode` импортируется ТОЛЬКО из `model/types.ts` для слота `children` (план §4.5.7) —
  компонент НЕ должен его импортировать (нарушение линта на неиспользуемый импорт; голый
  `React.ReactNode` тоже запрещён) — _поправлено после гейтов Этапа 1, когда выяснилось, что
  старая формулировка красная под `no-unused-vars`_;
  `className={classNames(styles.<camel>, {}, [className])}` с
  `import { classNames } from '@/shared/lib/utils/classNames'` — **единственный разрешённый
  путь** (запрещено: `clsx`, `classnames`, `shared/lib/classNames/…`);
  `data-testid` по умолчанию = kebab-имя; **без console, без `any`, без неиспользуемых
  импортов, без захардкоженного текста.**
- **REQ-T3 `component-test.mjs`** — явный
  `import { describe, expect, it } from 'vitest'` (прецедент: `About.test.tsx`; `globals: true`
  существует, но конвенция кодовой базы — явные импорты) + `@testing-library/react`;
  кейсы: наличие `data-testid` по умолчанию, слияние кастомного `className` (селектор
  фиксируется против фактической разметки до слияния), рендер детей.
- **REQ-T4 `story.mjs`** — CSF3 для SB 10:
  `import type { Meta, StoryObj } from '@storybook/react-vite'`,
  `satisfies Meta<typeof <Name>>`, `tags: ['autodocs']`,
  `title: '<LayerPascal>/<Name>'`. Без `ComponentStory`/`Template.bind`.
- **REQ-T5 `style.mjs`** — `.<camel> {\n  /* styles go here */\n}` (комментарий обязателен:
  `block-no-empty`; пустой файл → `no-empty-source`); токены через `var(--…)`, без сырого hex,
  без `@use`.
- **REQ-T6 `redux-slice.mjs`** (только `--with-slice`) — `createSlice` с именованными
  экспортами экшенов; обёртка lazy-hydration
  `export const <name>Reducer: typeof <name>Slice.reducer = (state, action) =>
<name>Slice.reducer(state ?? initialState, action)` + комментарий урока
  (`resume-rtk-lazy-hydration`); имя файла `model/slices/<name>Slice.ts` (область
  переопределения `no-param-reassign`); слайс и его тест импортируют состояние из
  `'../types/types'`, тест импортирует селекторы из `'../selectors/selectors'`.
- **REQ-T7 `selectors.mjs`** — см. REQ-G10; читает `<Name>RootState` из `'../types/types'`.
- **REQ-T8** `index.mjs` — баннер + **только именованные re-export** (без `export *`):
  база: `export { <Name> } from './ui/<Name>/<Name>';` +
  `export type { <Name>Props } from './model/types/types';`
  со слайсом: также `<Name>State`, `<Name>RootState`,
  `export { <name>Reducer, setInitialized } from './model/slices/<name>Slice';`,
  `export { select<Name>Initialized } from './model/selectors/selectors';`.
- **REQ-T9** Каждый шаблон обязан пройти все четыре гейта (type-check, eslint, stylelint,
  покрытие vitest) как изолированный образец ДО того, как генератор выйдет (этап 0.5).

### 3.4 Инструменты рефакторинга (REQ-R)

- **REQ-R1** `update-imports.mjs` — dry-run по умолчанию (печатает спекификаторы, первый
  сегмент которых является слоем FSD, но без префикса `@/`); `--fix` переписывает в
  `@/<specifier>`; определение слоя из SSOT; хелпер называется `startsWithFsdLayer` (чинит
  неудачное имя `isAbsolute` в исходнике); ожидаемый результат на текущем `src`: **0 находок**.
- **REQ-R2** `check-shared-ui-public-api.mjs` — явный гард: нет `src/shared/ui` → понятная
  ошибка + exit 1 (без молчаливого no-op). Проход 1: директории без `index.ts` (dry-run
  перечисляет; `--fix` создаёт баррели с **именованными** re-export, никогда `export *`).
  Проход 2: глубокие импорты `@/shared/ui/<C>/<X>` → `@/shared/ui/<C>` (dry-run exit 1 при
  нарушениях; `--fix` переписывает). Каждый `file.save()` / `project.save()` с await (без
  floating promises).
  **Поправка 2026-10-04 (доказательство, Этап 2):** проход 2 пропускает глубокий импорт, если
  первый сегмент после компонента — санкционированный внутренний сегмент (`lib`, `constants`,
  `types`, `model` — зеркалит `public-api-only.allowInternal` в `eslint.config.js`). Провести
  18 глубоких импортов `model`/`lib` реального дерева через баррели ломает type-check
  (символы вроде `getFallbackColor`, `validateDividerProps`, `ToastAction` намеренно не
  экспортируются через баррель) и противоречило бы гейту ESLint внутри `npm run validate`
  (OPEN-6); литеральный предикат также сделал бы невозможным чистый exit 0 смоука S7.
- **REQ-R3** Рантайм: **Вариант A** — ESM `.mjs` + `ts-morph` (последняя версия по
  `resume-version-policy`), ноль изменений конфига (решение OPEN-4; фолбэк — Вариант B `.ts` +
  `tsx` + правки конфига, перечисленные в плане §2.4).
- **REQ-R4** `--fix` обязан быть идемпотентным (второй запуск → 0 изменений).
- **REQ-R5** Dry-run на чистом дереве завершает exit 0 для обоих инструментов (можно
  использовать как CI-гейт; добавление `check:public-api` в `npm run validate` — это OPEN-6).

### 3.5 Тесты и гейты качества (REQ-Q)

- **REQ-Q1** Расположение тестов: `scripts/__tests__/**` (ко-лосированный стиль `__tests__` в
  репо). Они выполняются в проекте vitest `unit` только после того, как в `include` добавят
  `scripts/**/*.{test,spec}.{ts,tsx,mjs}` (OPEN-5, изменение конфига с одобрения человека).
  Фолбэк на случай отказа: выделенный проект vitest `scripts` с `environment: 'node'` —
  НЕ полагаться на тесты, которые никогда не выполняются.
- **REQ-Q2** Покрытие type-check: `scripts/**/*.ts` должен быть в **корневом**
  `tsconfig.json → include` — корневой проект — единственный, который запускает
  `npm run type-check` (`tsc --noEmit`; `references` простой `tsc` игнорирует).
  **Поправка 2026-10-04 (доказательство):** `tsconfig.node.json` не принадлежит ни одному
  гейту и сегодня красный с предсуществующими ошибками (TS5097 ×4, TS7016 ×1), поэтому
  `scripts/**` там ничего не гейтило; вместо этого реализован root-include, а готча
  записана в AGENTS.md (`resume-tsconfig-node-dead`). Тесты вне корневого include невидимы
  для гейта.
- **REQ-Q3** Тесты генератора порождают CLI через `execFile(process.execPath, [entry, …args])`
  во временной корне (`--root` / env `SLICE_ROOT`) — никогда через шелл, никогда
  `spawn('node')`.
- **REQ-Q4** Обязательные тесты (TDD — пишутся до реализации):
  1. хелперы именования: случаи Pascal/camel/kebab, включая цифры (`Contact2`, `OAuthClient2`);
  2. валидация CLI: плохой слой / имя в нижнем регистре / `with-dash` → exit 1;
  3. дерево равно REQ-G8 (база и `--with-slice`);
  4. повторный запуск без `--force` → exit 1 и контрольная сумма цели неизменна (CRITICAL-регрессия);
  5. `--dry-run` → ноль записей в файловую систему;
  6. утверждения содержимого шаблонов: разрешённый путь `classNames` присутствует; запрещённые
     подстроки отсутствуют (`clsx`, `classnames`, `useTranslation`, `shared/lib/classNames`,
     пустой `interface X {}`, `ComponentStory`, `Template.bind`);
  7. инвариант SSOT (REQ-S5);
  8. `update-imports`: фикстура с `@/` и без; идемпотентность `--fix`;
  9. `check-shared-ui-public-api`: гард на отсутствующую директорию → exit 1; формат эмита
     барреля; правка глубокого импорта; чистое дерево → exit 0;
  10. фаза A по умолчанию → дерево ровно `spec/SPEC.md` + `spec/TODO.md` (REQ-G14), больше
      ничего в директории слайса; в TODO есть рабочая единица storeReducers тогда и только
      тогда, когда `--with-slice`;
  11. `--scaffold` → exit 1 без `spec/SPEC.md`; exit 1 при `status: draft`; дерево кода REQ-G8
      при `status: approved`, а spec/ сохраняется байт-в-байт (REQ-G15);
  12. extras (REQ-G16): одобренный SPEC, чьи «Планируемые файлы» перечисляют
      `ui/Extra/Extra.tsx` → каркас эмитит четвёрку `ui/Extra/` с маркером TODO(spec) и
      тестом `it.todo`; перечисленный не-ui путь печатается как `manual:`; стандартные пути
      никогда не дублируются;
  13. `check:spec` (REQ-G17): draft → exit 1 + путь перечислен; approved/done → exit 0;
      ноль спеков → exit 0;
  14. `spec:status` (REQ-G18): по одной строке на спек, exit 0.
- **REQ-Q5** Смоу матрица (интеграционная точка каждого этапа):

  | #   | Проверка                                                                                                 |
  | --- | -------------------------------------------------------------------------------------------------------- |
  | S1  | все 7 шаблонов через type-check + eslint + stylelint во временной директории (этап 0.5)                  |
  | S2  | фаза A → фикстура SPEC `status: approved` → `--scaffold` → `npm run validate` зелёный, без ручных правок |
  | S3  | то же с `--with-slice` → `npm run validate` зелёный (покрытие + переопределение `*Slice.ts`)             |
  | S4  | новая сториса собирается: `npm run build-storybook` или `npm run test:storybook`                         |
  | S5  | повтор того же команды → exit 1, `git status` без изменений                                              |
  | S6  | `prettier --check` на сгенерированной директории (REQ-G13)                                               |
  | S7  | инструменты рефакторинга: dry-run exit 0 на чистом дереве; `--fix` на искусственно сломанном + revert    |
  | S8  | уборка смоу-слайса → `npm run validate` снова зелёный                                                    |

- **REQ-Q6** Пороги покрытия остаются нетронутыми (branches 85 / functions 87 / lines 92 /
  statements 90). `**/scripts/**` остаётся исключённым из покрытия; S2/S3 — эмпирический гейт
  R8.
- **REQ-Q7** Стиль кода самих скриптов: английские идентификаторы/комментарии (Language
  Domain Contract), безопасная для `no-console` обработка точек входа в `.ts`-файлах, без
  шелл-конструкт, работающих только в POSIX.

## 4. Критерии приёмки

1. Все результаты D1–D6 присутствуют; все REQ-G/R/S/Q демонстративно удовлетворены тестами и
   смоуком S1–S8.
2. `npm run validate` зелёный на каждой границе этапа; сгенерированный слайс требует нуля
   ручных правок.
3. `scripts/fsd-layers.json` — единственный список слоёв (grep по скриптам и плагину не
   находит других).
4. Тест-регрессия на безопасность повторного запуска на месте; `--force` никогда не удаляет
   чужие файлы.
5. Все решения OPEN (§5) записаны с ответом и датой ДО этапа, который они блокируют.
6. Раздел AGENTS.md + dual-write в engram/vault выполнены (этап 4).

## 5. Открытые решения (блокируют указанный этап)

| ID     | Вопрос                                                      | Рекомендация                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Блокирует | Статус      |
| ------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| OPEN-1 | Оставить `entities` в `generatorLayers`?                    | **Да — решение (владелец, 2026-10-04): равномерная генерация в любом слайс-слое**; наблюдение «у существующих entities нет `ui/`» — история, а не правило. Перекрытое требование: одинаковое дерево, без вариантов по слоям (REQ-G8)                                                                                                                                                                                                                                | Этап 1    | **решено**  |
| OPEN-2 | Добавить `pages` в `generatorLayers`?                       | **Да — решение (владелец, 2026-10-04): включён с первого дня**; регистрация маршрутов остаётся ручным гейтом (REQ-G11). `shared`/`app` остаются вне области (другая структура слайса)                                                                                                                                                                                                                                                                               | Этап 1    | **решено**  |
| OPEN-3 | Подключить или удалить `eslint-plugin-fsd-imports.test.js`? | **Перенаправить на `.cjs` + добавить `.opencode/eslint/**` в include vitest** — решение (владелец, 2026-10-04)                                                                                                                                                                                                                                                                                                                                                      | Этап 0    | **решено**  |
| OPEN-4 | Инструменты рефакторинга: `.mjs` (A) или `.ts`+`tsx` (B)?   | **A — решение (владелец, 2026-10-04): ESM `.mjs` + `ts-morph` (последняя), ноль изменений конфига**; Вариант B (`.ts` + `tsx` + правки конфига) остаётся задокументированным в плане §2.4 как фолбэк                                                                                                                                                                                                                                                                | Этап 2    | **решено**  |
| OPEN-5 | Расширить `include` vitest до `scripts/**`?                 | **Да** (фолбэк: выделенный node-проект) — решение (владелец, 2026-10-04)                                                                                                                                                                                                                                                                                                                                                                                            | Этап 0/1  | **решено**  |
| OPEN-6 | Добавить `check:public-api` в `npm run validate`?           | **Да — решение (владелец, 2026-10-04): добавлено как финальный шаг `npm run validate`** после Этапа 2 (чистый exit 0 доказан смоуком S7)                                                                                                                                                                                                                                                                                                                            | Этап 2    | **решено**  |
| OPEN-7 | Реализовать `print-env.mjs`?                                | **Нет — решение 2026-10-04 (Этап 3): реальной потребности нет**; `__API__` определён (`config/vite/buildViteConfig.ts:61`), но нигде не используется в `src` (только декларация `vite-env.d.ts`), так что печатать нечего. Вернуться к вопросу только когда конкретной задаче понадобится инспекция env (Этап 3 / план §7)                                                                                                                                          | Этап 3    | **решено**  |
| OPEN-8 | Выровнять оставшиеся расхождения `model/` по ARCH-1?        | Поднято 2026-10-07, ПОКА НЕ решено: `constants/index.ts` (ContactContent, Developer) против названного по себе `constants/constants.ts` (Job, Project); zod-схема в `services/schema.ts` (#179 entities) против `schemes/schema.ts` (Job, Project); двойной файл `selectors/{selectors.ts,index.ts}` (админ-фичи) против единого `selectors/selectors.ts` (ARCH-1); плоский `model/constants.ts` в `widgets/Nav`. Миграция ARCH-1 от 2026-10-07 покрыла ТОЛЬКО типы | Этап 5    | **открыто** |
| OPEN-9 | Режим по умолчанию у `generate:slice`: код или spec?        | **только spec — решение (владелец, 2026-10-07, plan_spec_workflow §0.6)**: сначала планирование; код только через `--scaffold` после `status: approved` (REQ-G1/G14/G15)                                                                                                                                                                                                                                                                                            | Этап 1    | **решено**  |
