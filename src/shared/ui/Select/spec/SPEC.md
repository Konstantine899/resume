---
status: approved
epic:
issue:
created: '2026-10-10'
verified:
---

# SPEC — shared/ui/Select

> Единственная истина для этого компонента (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Фаза A создана вручную из `scripts/createSlices/templates/spec.mjs` (нет `shared` в `generatorLayers`); фаза B выполняется вручную. Исходный план: vault `wiki/plan/plan_kit_select.md`, рев.1.
> **approved (2026-10-10, вердикт владельца):** OPEN-1 = A (нативный `<select>` + `base-select` progressive enhancement); OPEN-2 = A (пилот — все 4 админ-формы / 6 select).

## Цель

Один kit-компонент `Select` вместо шести копипастных нативных `<select>` в четырёх админ-формах: единый вид (варианты/размеры/label/error), единая точка для progressive-enhancement улучшений (`appearance: base-select`) и отсутствие локальных SCSS-дублей `styles.select` в каждой фиче.

## Контекст

- **Проверено в проекте (факты):** kit-компонента Select нет (`src/shared/ui/` — 37 компонентов, в каталоге `wiki/ui-kit/components-list.md` упоминаний нет); ровно 6 нативных `<select>` — все в админ-формах: `AdminJobs/ui/JobForm.tsx` (employmentType, level), `AdminMyWork/ui/ProjectForm/ProjectForm.tsx` (category, status), `AdminSkills/ui/SkillCategoryForm/SkillCategoryForm.tsx` (category), `AdminSkills/ui/TechnologyForm/TechnologyForm.tsx` (iconSvg, `value: ''` как placeholder). Паттерн везде одинаковый: `<label htmlFor>` + `styles.select` (локальный SCSS фичи) + RHF `setValue(..., { shouldDirty: true })`. `<select multiple` в `src` нет.
- **Слой:** `shared` (FSD, `allowedImports.shared = ['shared']` — `scripts/fsd-layers.json`), компонент `ui/Select`; Redux — нет; kit-зависимости — нет (нативный элемент; вспомогательное — `classNames`, `mapSizeToClass` из `shared/lib/utils`).
- **Layout (ARCH-1):** как в EmptyState — `index.ts` (только именованные экспорты), `model/types.ts`, `ui/Select/Select.{tsx,module.scss,test.tsx,stories.tsx}`.
- **Тренд 2026 (websearch: MDN, caniuse, WebKit blog, сеп-2026):** `appearance: base-select` + `::picker(select)` — Chrome/Edge 134+, Safari 27 (17.09.2026), Firefox экспериментальный, **не Baseline** → только progressive enhancement через `@supports (appearance: base-select)`; неподдержанные браузеры получают обычный функциональный `<select>` (закрытый контроль стилизуется и без base-select через `appearance: none` + свою стрелку). SSR-предостережение MDN неприменимо — проект Vite SPA.
- **Вердикт OPEN-1 плана = A (натив)** предполагается, но формально утверждается владельцем вместе со статусом `approved`.

## Планируемый API (черновик, утверждается вместе с `approved`)

```ts
// model/types.ts
export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectOwnProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string; // строка потребителя (t()); связка через htmlFor/id
  placeholder?: string; // рендерится как <option value=""> первым
  error?: string; // строка потребителя; включает error-модификатор (контракт Input)
  helperText?: string;
  variant?: 'default' | 'outline' | 'filled'; // без 'floating' — специфика input
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // union Input + mapSizeToClass
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string; // когда нет видимой label
};
```

## Критерии приёмки

- [ ] Рендерит нативный `<select>` с ровно одной `<option>` на каждый элемент `options` (`value`, текст = `label`, учитывается `disabled` опции).
- [ ] Строго управляемый: выбранное в DOM соответствует `value`; `onChange` получает строку выбранного `value` (значение поступает в форму потребителя, `shouldDirty` выставляет потребитель — kit про RHF ничего не знает).
- [ ] `placeholder` рендерится первым `<option value="">`; выбор любой другой опции снимает selected с placeholder.
- [ ] `label` связан с контролом (`htmlFor`/`id`); без `label` контроль доступен по `aria-label`.
- [ ] `error`, `disabled`, `required`, `size`, `variant`, `fullWidth` отображаются на CSS-модификаторы; классы собираются через `classNames`, размерные — через `mapSizeToClass`.
- [ ] В `Select.module.scss` есть блок `@supports (appearance: base-select)`; вне поддержки контроль остаётся рабочим и стилизованным (closed-state) — тест/сториса на fallback не требуются, требуется отсутствие ломающей зависимости от base-select.
- [ ] Компонент не добавляет собственного текста — при фикстурах отрендеренный текст (кроме option-контента потребителя) равен входным строкам (тест на отсутствие захардкоженных строк; в `en.json`/`ru.json` ничего не добавлено — parity-тест не менялся).
- [ ] Сторисы: en и ru (`changeLanguage('en')` первым), обе темы, 390px (инлайн-оверрайд `parameters.viewport.viewports.narrow390`), состояния: placeholder, error, disabled, sizes, variants.
- [ ] `npx axe-stories --filter=Select` → 0 нарушений; axe `/admin` → 0 новых нарушений.
- [ ] Пилот (после OPEN-2): все 6 select в 4 админ-формах переведены на kit Select; локальные `.select` правила удалены как мёртвые; поведение форм не изменилось (значения, дефолты `?? 'x'`, `shouldDirty`); axe `/` → 0 регрессий.
- [ ] `npm run validate` зелёный; `check:bundle` в пределах лимита (worktree-дельта относительно merge-base, лимит 737280 B).
- [ ] Запись добавлена в `wiki/ui-kit/components-list.md`.

## Планируемые файлы

<!-- Фаза B для `shared` выполняется вручную. -->

- `index.ts`
- `model/types.ts`
- `ui/Select/Select.tsx`
- `ui/Select/Select.test.tsx`
- `ui/Select/Select.stories.tsx`
- `ui/Select/Select.module.scss`
- пилот (после OPEN-2): `src/features/AdminJobs/ui/JobForm.tsx`, `src/features/AdminMyWork/ui/ProjectForm/ProjectForm.tsx`, `src/features/AdminSkills/ui/SkillCategoryForm/SkillCategoryForm.tsx`, `src/features/AdminSkills/ui/TechnologyForm/TechnologyForm.tsx` (+ их `.module.scss` — удаление `.select`)

## Что не входит

- `<select multiple>`, async-поиск/combobox, rich-options (иконки/свипачи в опциях) — grep не нашёл ни одного такого usage в проекте; при появлении реальной нужды — отдельный план.
- Зависимость react-hook-form внутри kit (RHF — на стороне фич-форм).
- Собственные i18n-ключи kit (`label`/`placeholder`/`error` — строки потребителя, план A2).
- `floating`-вариант, анимации открытия, кастомный listbox на div (это вариант B из OPEN-1 — вне этого спека).

## Риски

- `base-select` не Baseline: открытый пикер в неподдержанных браузерах остаётся ОС-стилизованным — принятый fallback (golden rule WebKit: держать текстовый fallback и `@supports`), не дефект.
- Пилотные тесты форм могут ассертить по классу `styles.select` — проверяется при пилоте и чинится там же (заранее не утверждается).
- Ползучество API в сторону «ещё один пропс под конкретную форму» — A6 держит kit без бизнес-логики; новые потребности → правка этого спека до кода.

## Открытые вопросы

- OPEN-1: **закрыт (2026-10-10)** — вариант A, натив + `base-select` progressive enhancement.
- OPEN-2: **закрыт (2026-10-10)** — все 4 админ-формы / 6 select.
