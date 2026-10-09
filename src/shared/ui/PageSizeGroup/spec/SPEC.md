---
status: done
epic:
issue:
created: '2026-10-09'
verified: '2026-10-09'
---

# SPEC — shared/ui/PageSizeGroup

> Единственная истина для этого компонента (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> `approved` = вердикт владельца 2026-10-09 (путь «DataTable со встроенной пагинацией+размером», vault `wiki/plan/plan_kit_datatable.md` rev.5, решение A5-bis). Фаза A создана вручную — у генератора нет слоя `shared` (`scripts/fsd-layers.json` → `generatorLayers`).

## Цель

Kit-контрол «сколько элементов на странице»: видимая подпись + группа кнопок-размеров. Извлекает паттерн, утверждённый владельцем в MyWork (2026-10-09: видимая подпись, `aria-labelledby`, `aria-pressed`), в переиспользуемый компонент — первый потребитель `DataTable`, второй (по желанию) — миграция `MyWork`.

## Контекст

- Слой: `shared` (FSD); зависимости: kit `Button`, `useLanguage` (i18n).
- i18n: **без новых ключей** — подпись `perPageLabel` уже существует в `en.json`/`ru.json` («Items per page» / «Элементов на странице»).
- Соглашение об импорте: `import { PageSizeGroup } from '@/shared/ui/PageSizeGroup'` — корневого барреля `src/shared/ui/index.ts` не существует (проверяет `check:public-api`).
- Состояние снаружи (принцип A2 плана DataTable): контрол `stateless` — `value`/`onChange` контролируются контейнером; ни внутреннего `useState`, ни эффектов.

## API

```ts
export interface PageSizeGroupProps {
  /** Sizes to render, e.g. `[5, 10, 20]`. Order is preserved. */
  sizes: readonly number[];
  /** Currently active size. A value outside `sizes` simply presses nothing. */
  value: number;
  /** Called with the clicked size. */
  onChange: (size: number) => void;
  /** Extra class for the group wrapper. */
  className?: string;
}
```

## Критерии приёмки

- [x] Видимая подпись `t('perPageLabel')` (span **внутри** группы) — не aria-only: `within(group).getByText('perPageLabel')` находит её (тест защищает от возврата к голому `aria-label`).
- [x] Обёртка — `role="group"`; accessible name = видимая подпись через `aria-labelledby={useId()}` (одна i18n-строка на видимый текст и имя).
- [x] Кнопка на каждый элемент `sizes` в порядке массива; текст кнопки = размер.
- [x] Ровно у активного размера (`sizes` содержит `value`) — `aria-pressed="true"`; `value` вне `sizes` → ни одна кнопка не нажата, без крашей.
- [x] Клик → `onChange(size)` с размером этой кнопки.
- [x] Кнопки — kit `Button` (`variant="ghost"`, `size="sm"`); активный визуально выделен собственным модификатором (`.sizeButton[aria-pressed='true']`: primary-текст + accent-subtle фон — перенос стиля из MyWork).
- [x] Стиль подписи: muted-цвет, `--text-sm`, `white-space: nowrap`; контраст AA в обеих темах (storybook-test: Default/Russian/ActiveMiddle зелёные).
- [x] Пустой `sizes` → компонент рендерит `null` (защита контракта).
- [x] Сторисы: базовая (5/10/20, активна 5), активный размер посередине, RU-локаль; 390px гонится скриптом axe автоматически (VIEWPORTS).
- [x] `scripts/axe-stories-check.mjs`: 0 нарушений, кроме advisory-правила `region` — общий класс для div-корней kit (см. примечание в SPEC DataTable: 26+ сканов Card/Badge/Paragraph/Heading красные сегодня, скрипт не CI-wired).
- [x] `npm run validate` зелёный (3221/3221); `check:public-api` зелёный (32/32, `index.ts` на месте).

## Планируемые файлы

<!-- Фаза B для `shared` выполняется вручную. -->

- `index.ts`
- `ui/PageSizeGroup/PageSizeGroup.tsx`
- `ui/PageSizeGroup/PageSizeGroup.module.scss`
- `ui/PageSizeGroup/PageSizeGroup.test.tsx`
- `ui/PageSizeGroup/PageSizeGroup.stories.tsx`
- `model/types.ts` (flat — convention `shared/**`)
- `spec/SPEC.md`, `spec/TODO.md` (созданы вручную до кода)

## Что не входит

- Состояние (внутренний page/size) — контейнер (`DataTable`/фича); см. Context.
- Скролл, clamp, вычисление `totalPages` — контейнер.
- Выпадающий список / `<select>` — владелец утвердил кнопки; селект = отдельное решение.
- Миграция `MyWork` на этот kit — отдельный шаг (план rev.5, WU-5), не этот PR.
- Локализация новых строк — ключей нет (см. Context).

## Риски

- Параллельная жизнь инлайн-группы MyWork до её миграции — две независимые реализации одного паттерна (допустимо на время, риск расхождения стилей низкий: выделение активного перенесено дословно).
