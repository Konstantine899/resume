---
status: approved
epic: contact-rows-crud
issue: 285
created: '2026-10-18'
spec: SPEC.md
---

# SPEC — features/AdminContact (эпик contact-rows-crud, Трек D плана rev.5)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md,
> раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_contact_migration.md`, rev.5,
> §10 «Трек D — построчная CRUD-матрица» (директива владельца 2026-10-18:
> стиль/функционал идентичны AdminJobs/AdminSkills).
> Companion: [TODO.md](./TODO.md). Язык: русский (правило владельца).
> **Режим исполнения: СТРОГО AUTO** (директива владельца, 2026-10-18) —
> без пофазовых подтверждений; оценка времени показывается перед стартом
> (TODO «Оценка»).

## Цель

Матрицы `texts` (10 ключей) и `formTexts` (4 ключа) становятся полноценной
построчной CRUD-витриной в сворачиваемых Card-компонентах — по образцу
AdminJobs (кнопки строк) и AdminSkills (collapse): значения в ячейках —
только строки, редактирование/удаление — построчно через модалки, добавление
и сброс — кнопками над таблицей, всё персистится в store (localStorage +
RTK Query swap-point без изменений).

## Не в области (решения зафиксированы)

- **Соцссылки** — Card со сворачиванием, read-only таблица БЕЗ
  действий/Bез Add/Reset (решение B; `SOCIAL_LINKS` общий с витриной и Nav
  констант, gotcha resume-shared-key-splitbrain). **Вето владельца**
  (план §10.2 D8): если требуется CRUD и соцссылок — отдельный эпик.
- Email секции — отдельное inline-поле со своей кнопкой Save (не таблица).
- Новые kit-компоненты не создаются; витрина `features/Contact` меняется
  ровно одной строкой (D1b); Nav, `AdminContactPage`-структура, контракты
  C1–C7 (localStorage, envelope v:1, trio баррела) не меняются.
- RTK Query: новых endpoint'ов нет (D7).

## Требования

### R-1 — Контракт: открытая модель строк

- `ContactContent.texts` / `.formTexts`: `Record<string, LocalizedText>`
  (zod-запись: ключ slug `^[a-zA-Z][a-zA-Z0-9_-]*$`, trim, 1..64;
  значение `{en, ru}` min 1; max 600 — texts, 120 — formTexts; уникальность
  ключа — на уровне формы, не схемы).
- Union-типы `TextKey`/`FormTextKey` и seed (`createContactSeed`) сохраняются;
  порядок строк = порядок ключей объекта.
- Envelope `{v:1, content}` не меняется; сохранённые документы валидны.
- Витрина: `Contact.tsx` — `content?.texts[key]?.[language] ?? t(key)`
  (per-key nullish fallback; удалённый ключ → i18n-дефолт).
- Наблюдаемый исход: schema-тесты на add/невалидный ключ/пустое значение;
  тест витрины на fallback отсутствующего ключа; `useContactForm` зелёный
  без правок.

### R-2 — Store: построчные операции

- Slice-экшены: `upsertContactTableRow({table: 'texts'|'formTexts', key,
value: LocalizedText})`, `removeContactTableRow({table, key})`,
  `resetContactTable({table})` (восстановление seed-таблицы);
  `resetToDefaults` удаляется как мёртвый.
- Персист — золотой стандарт: snapshot → мутация → `persistContactContent(next)`
  → dispatch; dispatch только при `persist === true` (persist-fail → ошибка,
  состояние не меняется).
- Lazy hydration слайса сохраняется (`state ?? readContactContent() ?? seed`).
- Наблюдаемый исход: тесты слайса (upsert/удаление/сброс/порядок) +
  persist-порядок (spy: persist ДО dispatch).

### R-3 — Карточки со сворачиванием (эталон Skills)

- Три Card: `adminFieldTexts`, `adminFieldFormTexts`, `adminContactSocials` —
  **все свёрнуты по умолчанию**; метка-заголовок снаружи карточки при
  свёрнутом состоянии.
- Strip = IconButton `variant="outline" size="md" fullWidth` + Plus,
  `aria-expanded="true"` **без** `aria-controls`; раскрытая карточка:
  `.blockHeader` (Minus `size="sm"`, `aria-expanded="false"` +
  `aria-controls={contentId}`, Heading h3, Badge с количеством строк)
  - контент с `id={contentId}` (unmount при сворачивании).
- `Card variant="default" size="default" hoverable={false}` +
  `.block { height: auto }`; `.strip.strip` (удвоение класса).
- Наблюдаемый исход: ARA-раундтрип-тест (aria-expanded/controls,
  unmount/remount, стабильный id) — по образцу SkillsEditorList.

### R-4 — Таблица: строки-строки + кнопки в ячейке (эталон JobCard)

- Ячейки EN/RU — только строки (`value.en`/`value.ru`; пусто → `—`).
  Никаких Input/Textarea в строках (грep-ассерт: `table input/textarea = 0`).
- Колонки: `[Поле | EN | RU | Действия]`; заголовки —
  `adminContactTableField`/`EN`/`RU`; «Действия» — правый выравниванием
  `table th:last-child`.
- Каждая строка: Pencil `variant="outline" size="sm"` + Trash2
  `variant="danger" size="sm"`, оба в обёртке Tooltip `showDelay={0}`,
  контейнер `.cellActions` = flex **nowrap** `$spacing-2` justify-end.
  Столбик кнопок НЕДОПУСТИМ.
- Над таблицей (в шапке карточки, `.blockHeader .actions`): «Добавить
  строку» (Plus outline sm) и «Сбросить таблицу» (RotateCcw outline sm).
- Соцссылки-Card: таблица `[Name | URL]` без колонки действий и без
  Add/Reset.
- Наблюдаемый исход: rows = N+1; в ячейках нет ни одного input/textarea;
  обе кнопки строки горизонтально в одном контейнере (flex-direction row).

### R-5 — Модальная форма строки (`ContactRowForm`)

- add-режим: Input Key (slug), Input EN, Input RU; edit-режим: ключ видим,
  но НЕ редактируется, только EN/RU. Save pristine-disabled; Cancel/ESC →
  закрытие; `key={table-key}` remount.
- Модалку владеет `ContactEditorForm` (заголовок модалки = имя диалога,
  A12; subtitle = имя таблицы); Save/Cancel — `contactSave`/`contactCancel`.
- Валидация: пустой/невалидный ключ → `adminContactRowKeyInvalid`;
  дубль в пределах таблицы → `adminContactRowKeyExists`; пустое значение →
  `adminContactRowValueRequired`; превышение лимита таблицы →
  `adminContactRowValueMax`.
- Наблюдаемый исход: pristine Save disabled; дубль блокирует с ошибком;
  успешный Save → persist+dispatch+toast+закрытие+новое значение в ячейке.

### R-6 — Подтверждения (золотой стандарт)

- Удаление строки: kit Modal, title `adminContactDeleteRow`, subtitle
  `adminContactDeleteRowName` ({{key}}), `initialFocusRef` → «Отмена»,
  `children={null}`; persist-fail → модалка ОСТАЁТСЯ открытой + error-тост.
- Сброс таблицы: kit Modal, title `adminContactResetRows`, subtitle
  `adminContactResetRowsConfirm` ({{table}}), тот же Cancel-focus и
  persist-fail-паритет.
- Email: inline Input + кнопка Save (`contactSave`), disabled пока pristine
  или невалиден; persist → `updateContactContent` (merged snapshot) → тост.

### R-7 — RTK Query (D7)

- Новых endpoint'ов НЕТ: документный `updateContactContent` PUT покрывает
  построчные операции, `ContactDocumentDto.content: Record<string, unknown>`
  не зависит от контракта. Комментарий-пояснение в apiSlice не требуется;
  решение фиксируется здесь и в плане §10.2 D7.

### R-8 — i18n

- ~15 новых flat-ключей en+ru: `adminContactAddRow`, `adminContactEditRow`,
  `adminContactDeleteRow`, `adminContactDeleteRowName`, `adminContactRowKey`,
  `adminContactRowEn`, `adminContactRowRu`, `adminContactResetRows`,
  `adminContactResetRowsConfirm`, `adminContactExpandGroup`,
  `adminContactCollapseGroup`, `adminContactRowKeyInvalid`,
  `adminContactRowKeyExists`, `adminContactRowValueRequired`,
  `adminContactRowValueMax`.
- Переиспользуются: `contactSave`, `contactCancel`, `contactSaved`,
  `contactSaveError`, `adminFieldTexts`, `adminFieldFormTexts`,
  `adminContactSocials` и др. `locales-parity.test` НЕ правится.

### R-9 — Гейты

`npm run validate`; точечные vitest (форма, AdminContactPage, HomePage,
витрина Contact, useContactForm); `check:axe` (`/admin/contact` в PATHS;
0 регрессий; collapse-ARA и aria-dialog-name новых модалок); `check:bundle`
(RHF на lazy-чанке — resume-lazy-rhf-chunk); `check:spec`; preview smoke
light+dark (свёрнутые карточки → раскрытие → модалки → без сырых ключей).
PR `--base dev` → CI → auto-merge → ручное закрытие issue #285 →
бёрн-даун docs-PR → dual-write.

## Известные ограничения (осознанные)

- Соцссылки read-only (D8) — потенциальное вето владельца; обоснование:
  shared-key-splitbrain (Nav + витрина + 12 Nav-тестов + storybook).
- Порядок новых строк — только конец объекта (перетаскивания нет, как и
  в других админ-витринах без DnD).
- Email без per-field модалки (одиночное поле) и без reset-кнопки —
  документный Reset удалён вместе с подвальной формой.
