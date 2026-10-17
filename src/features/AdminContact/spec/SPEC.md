---
status: approved
epic: contact-kit-max
issue: 282
created: '2026-10-17'
spec: SPEC.md
---

# SPEC — features/AdminContact (эпик contact-kit-max, Трек C плана rev.4)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md,
> раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_admin_contact_migration.md`, rev.4,
> §8 «Трек C — максимизация kit-компонентов» (directives владельца
> 2026-10-17: «ui kit компоненты должны максимально использоваться;
> минимальное использование не переиспользуемого кода»).
> Companion: [TODO.md](./TODO.md). Язык: русский (правило владельца).
> Режим исполнения: **auto**.

## Цель

Табличные данные `ContactEditorForm` переходят с ручной сетки/flex-списка на
kit `Table`; мёртвые и дублированные layout-фрагменты удаляются. Поведение
формы, контракты C1–C7 (localStorage, seed, persist → dispatch, публичное
трио, синхронная витрина) и все 12 существующих тестов остаются без изменений.

## Не в области (решения зафиксированы)

- Витрина `features/Contact` — аудит чистый (12 kit-импортов, ручной
  интерактивной разметки нет), не меняется.
- `AdminContactPage` — чистая (ErrorBoundary + Section + форма), не меняется.
- `.localeRow` в AdminAbout/AdminMyWork — их эпики закрыты, перенос на
  kit Table = follow-up (план §9 п.5), отдельным эпиком.
- Новые kit-компоненты (Stack/Cluster) не создаются — не спекулировать.
- `features/Contact` витрина и swap-комментарии сиблингов не трогаются (§8.2 C5).

## Требования

### R-1 — Матрица текстов → kit Table

- Обе группы рендерятся kit `Table` (`@/shared/ui/Table`), а НЕ `DataTable`
  (нет сортировки/пагинации — матрица полей; решение C1):
  - группа `TEXT_KEYS` (10 ключей): caption = `t('adminFieldTexts')`;
  - группа `FORM_TEXT_KEYS` (4 ключа): caption = `t('adminFieldFormTexts')`.
- Колонки обеих таблиц: `[поле | EN | RU]` — первый заголовок
  `t('adminContactTableField')`, остальные `EN`/`RU` (коды локалей —
  литералы, языконейтральны).
- Первая ячейка строки = `t(key)` (видимый row-label).
- `contactDescription` — kit `Textarea` в ячейках (`rows={4}`, maxLength 600),
  остальные — kit `Input` (maxLength 120, `fullWidth`); RHF-пути
  (`texts.<key>.<locale>`, `formTexts.<key>.<locale>`) не меняются.
- Наблюдаемый исход: ровно две `<table>` под group-заголовками; в каждой
  `rows = N + 1` (1 header + 10 / 4); всего `input` = 27, `textarea` = 2
  (счётчики существующего теста переживают миграцию).

### R-2 — Доступность ячеек (решение C2)

- Видимая подпись `` `${t(key)} · LOCALE` `` переносится из `label` в
  `aria-label` **с той же строкой**.
- Наблюдаемый исход: `getByLabelText('responseTimeHint · EN')` находит поле —
  существующие 12 тестов формы проходят БЕЗ правок; label-in-name соблюдается
  (aria-label содержит видимый текст строки `t(key)` из row-ячейки).
- Видимый контекст поля: row-ячейка `t(key)` + column header `EN`/`RU`.

### R-3 — Превью соцссылок → kit Table

- `ul/li` + `Badge` (`.socialList`) заменяются kit `Table`:
  caption = `t('adminContactSocials')`; колонки
  `[t('adminContactSocialName') | t('adminContactSocialUrl')]`;
  значения `SOCIAL_LINKS[i].name` | `.href`; URL рендерится kit `Link` (external).
- Наблюдаемый исход: одна таблица, `rows = SOCIAL_LINKS.length + 1`;
  `data-testid="contact-form-socials"` удалён (в тестах нигде не
  использовался — проверено grep'ом); ссылки достижимы по роли `link`.

### R-4 — Удаление ручного layout-кода

- Из `ContactEditorForm.module.scss` удаляются: `.localeRow`,
  `.socialList`, `.field` (мёртвый wrapper: `flex-col` без gap вокруг одного
  Input — email становится прямым ребёнком `Form`).
- Остаются `.intro`, `.group`, `.actions` — осознанные layout-обёртки
  (<5 строк, kit не экспортирует Stack/Cluster) — закрепляются комментарием
  в SCSS.
- Наблюдаемый исход: grep `.localeRow|.socialList|.field` в паре файлов
  компонента пуст; stylelint чистый.

### R-5 — i18n (решение C3)

- 4 новых flat-ключа ×2 локали (en+ru):

| Ключ | en | ru |
|------|----|----|
| `adminContactTableField` | Field | Поле |
| `adminContactSocials` | Social links | Социальные сети |
| `adminContactSocialName` | Name | Название |
| `adminContactSocialUrl` | URL | Ссылка |

- `locales-parity.test` НЕ правится (hardcoded `adminKeys`-список не
  редактируется — прецедент pagination/skills).
- Наблюдаемый исход: обе локали содержат все 4 ключа; parity-тест зелёный.

### R-6 — Гейты

- `npm run validate` (type-check + lint + lint:styles + vitest + public-api);
- точечные: `npx vitest run src/features/AdminContact src/pages/Admin/ui/AdminContactPage src/pages/Home`;
- `npm run check:axe` (`/admin/contact` в PATHS) — 0 регрессий к baseline;
- `npm run check:bundle` (RHF остаётся на lazy-чанке — resume-lazy-rhf-chunk);
- `npm run check:spec`;
- preview smoke (light+dark): на `/admin/contact` нет сырых i18n-ключей
  (gotcha resume-mywork-field-actions: identity t-mock скрывает raw-ключи в тестах).

## Известные ограничения (осознанные)

- **Мобильный UX (C4)**: kit `Table` даёт горизонтальный scroll region
  (`tabIndex=0`, axe-clean) вместо стекинга `localeRow` на узких экранах.
- Ошибки валидации kit `Input` (`role=alert`) рендерятся внутри `td` ячейки.
- Остаток hand-rolled-кода: `.intro`/`.group`/`.actions` (3 блока <5 строк)
  — осознанно, kit не имеет Stack/Cluster; извлечение в kit = отдельный эпик.
