---
status: done
epic: contact-row-textarea
issue: 289
created: '2026-10-18'
verified: '2026-10-18'
spec: SPEC.md
---

# SPEC — features/AdminContact (эпик contact-row-textarea, план rev.6 §10.1)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md,
> раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Это микро-эпик-аменда поверх `contact-rows-crud` (#285/#286): правит
> только форму строки; контракт прошлого эпика (открытые записи, slice,
> витрина) не меняется.

## Контекст и цель

Директива владельца (2026-10-18, вторая): «там, где нужно писать много
текста, в модальных окнах, лучше использовать Textarea». Единственная
модальная форма с длинным текстом в Contact-области — `ContactRowForm`
(EN/RU-значения строк: `texts` кап 600, `formTexts` кап 120). Режим
исполнения: **СТРОГО AUTO** (директива владельца 2026-10-18).

## Требования

### R-1 — EN/RU-значения формы строки = Textarea

- `ContactRowForm`: EN и RU — kit `Textarea` c `rows=3`, `autoResize`,
  `maxLength` = кап текущей таблицы (600 для texts / 120 для formTexts),
  `error`-проп с существующим i18n-ключом (контракт ошибок Input и
  Textarea совпадает: `adminContactRowValueRequired` /
  `adminContactRowValueMax`).
- Наблюдаемый исход: в модалке add/edit у EN/RU `tagName === 'TEXTAREA'`,
  пре-fill в edit и редактирование проходят, `maxLength` атрибут равен
  капу таблицы.

### R-2 — Короткие значения остаются на Input

- Поле `key` (slug ≤64, readOnly в edit) — kit `Input` без изменений.
- Email в `ContactEditorForm` — kit `Input` без изменений (инлайн, не
  модалка, короткий скаляр).
- Наблюдаемый исход: у `key` `tagName === 'INPUT'`; существующие тесты
  формы (duplicate/slug/persist-пайплайн/persist-fail) зелёные БЕЗ правок
  ассертов.

### R-3 — Таблицы и i18n не трогаются

- Vitrina-таблицы остаются «строки без инпутов» (R-4 эпика
  `contact-rows-crud` — в модальном редакторе Textarea, в таблице нет).
- Новых i18n-ключей нет; `en.json`/`ru.json` не меняются, parity-тест не
  правится.
- Наблюдаемый исход: diff локалей пуст; page-тесты и витринные тесты
  зелёные без правок.

## Приёмка

- [ ] TDD: RED — форма-тесты ассертит `TEXTAREA` для EN/RU и падают на
      текущем Input-рендере; GREEN — после замены.
- [ ] Тесты формы зелёные (обновлены только ожидания типа элемента),
      `tsc`/`eslint`/`stylelint` — 0.
- [ ] Полный `npm run validate` зелёный; `check:axe` 0 регрессий;
      `check:bundle` (Δ≈0, Textarea уже в shared-чанке); `check:spec`.
