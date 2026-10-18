---
status: done
epic: contact-social-crud
issue: 293
created: '2026-10-18'
verified: '2026-10-18'
spec: SPEC.md
---

# SPEC — features/AdminContact (эпик contact-social-crud, план rev.7 §10.2)

> **ЗАКРЫТ** (2026-10-18): выполнен и смержен в `dev` squash `2088c7e`
> (PR #294, CI 8/8), issue #293 закрыт вручную. Реализация совпала с
> контрактом ниже без отклонений; variant=ghost закреплён class-пином в
> vitest и проверен по computed color в preview smoke.

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md,
> раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Микро-эпик поверх `contact-rows-crud` (#285/#286): закрывает D8
> (read-only соцссылки) — третья таблица получает полный CRUD.

## Контекст и цель

Директива владельца (2026-10-18, третья): таблица соцссылок /admin/contact —
полный CRUD по образцу texts/formTexts: (1) все ссылки `variant='ghost'`;
(2) строки — кнопки редактировать/удалить; (3) ссылки — в store + RTK Query
(«в будущем все ссылки будут храниться в БД»); (4) над таблицей «Добавить
строку» + «Сбросить таблицу». Режим исполнения: **СТРОГО AUTO**.

## Требования

### R-1 — Модель: соцссылки входят в документ ContactContent

- Контракт `ContactContent` += `socialLinks: Record<string, ContactSocialLink>`
  (`{ name: string; href: string }`), slug-ключ (тот же `rowKey`, что
  texts/formTexts). Тип объявлен в `entities/ContactContent` (имя
  `ContactSocialLink` не конфликтует с `SocialLink` из `entities/Developer`).
- Схема: `socialLinks` **обязательное** поле; `readContactContent`
  апгрейдит старый конверт — если поля в `content` реально нет, подставляет
  seed-ссылки ПЕРЕД валидацией (отсутствие ≠ пусто): старый конверт
  читается без потери текстов + seed-ссылками, присутствующий `{}`
  остаётся пустым.
- Seed: `createContactSeed().socialLinks` выводится из `SOCIAL_LINKS`
  (slug = `name.toLowerCase()` → github/linkedin/telegram).
- Наблюдаемый исход: старый конверт читается без потери текстов и с
  seed-ссылками; roundtrip нового конверта сохраняет редакции строк;
  документ без `socialLinks` — отказ схемы (апгрейд — только read-path).

### R-2 — RTK Query: документный PUT покрывает соцссылки

- Новых endpoint'ов НЕТ (ревизия D7 плана): `socialLinks` — поле
  документа, `getContactContent`/`updateContactContent` (`shared/api`)
  работают с ним как с остальным содержимым; swap-point на реальном
  сервере — общий (`storage.ts` → `fetchBaseQuery`).
- Наблюдаемый исход: существующие тесты `apiSlice` зелёные без правок;
  persist-пайплайн соцссылок идентичен texts/formTexts
  (persist-THEN-dispatch).

### R-3 — Slice и helper: третья таблица

- `ContactTableRow` += `'socials'`; payload value → union
  `LocalizedText | ContactSocialLink` (upsert кастует по ветке;
  remove/reset — структурно); `withTableRows`/`omitKey` widening с
  веткой `socials`.
- Наблюдаемый исход: slice-тесты (upsert/remove/reset socials) зелёные;
  существующие тесты texts/formTexts — БЕЗ правок ассертов.

### R-4 — Форма строки: новый `ContactSocialForm`

- `ui/ContactSocialForm/` (add/edit в модалке, паритет ContactRowForm):
  key (readOnly в edit, slug ≤64) + name (1..48) + href (URL, строго
  `https://`, ≤2048) — все три kit `Input` (короткие значения;
  standing-конвенция: Textarea только для длинного текста).
- Ошибки: slug → существующие `adminContactRowKeyInvalid`/`KeyExists`;
  name/href → 4 НОВЫХ i18n-ключа en+ru (`adminContactSocialNameRequired`/
  `NameMax`/`UrlRequired`/`UrlInvalid`) — существующие
  `adminContactRowValueRequired`/`Max` привязаны к «локалям».
- Пайплайн: snapshot → mutate → persist → dispatch → toast → exit;
  persist-fail — тост + модалка открыта (gold standard).
- Наблюдаемый исход: TDD RED (новые тесты на нереализованную форму) →
  GREEN; pristine-Save disabled; дубликат slug — отказ.

### R-5 — Блок соцссылок в ContactEditorForm = CRUD-паритет

- `renderSocialsGroup`: collapsed default (уже), шапка с «Add row»
  (`contact-add-socials`) + «Reset table» (`contact-reset-socials`),
  строки с Pencil/Trash2 в `.cellActions` (nowrap), confirm-модалки
  delete/reset (Cancel-focus, persist-fail держит модалку;
  `adminContactDeleteRowName` с {{key}}, `adminContactResetRowsConfirm`).
- URL-ячейка: kit `Link variant="ghost"` (правка владельца в рабочем
  дереве закрепляется тестом на variant-класс/проп).
- Тест «read-only socials» (D8) удаляется/переписывается.
- Наблюдаемый исход: vitrina-таблица соцссылок без инпутов (R-4 прошлого
  эпика остаётся), редактирование открывает ContactSocialForm.

### R-6 — Читатели константы не трогаются

- Витрина `Contact` и `Nav/SocialLinks` читают `SOCIAL_LINKS` как раньше
  (split-brain принят: миграция читателей — отдельный эпик, когда ссылки
  уйдут в БД). `SOCIAL_LINKS` — источник seed.
- Наблюдаемый исход: тесты витрины/Nav зелёные БЕЗ правок; локали
  меняются только на 4 новых ключа (parity-тест обновлён).

## Приёмка

- [x] TDD: schema/storage/slice тесты RED→GREEN; `ContactSocialForm`
      RED→GREEN; тест variant=ghost написан ДО фикса-подтверждения.
- [x] Старый конверт (без socialLinks) читается: тексты сохраняются,
      ссылки — seed; `{}` остаётся пустым.
- [x] Полный `npm run validate` зелёный; `check:axe` 0 регрессий;
      `check:bundle`; `check:spec`; preview smoke light+dark без сырых
      ключей.
