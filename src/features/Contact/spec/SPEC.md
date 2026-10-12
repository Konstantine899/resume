---
status: done
epic: contact-refactor
created: '2026-10-11'
verified: '2026-10-12'
---

# SPEC — features/Contact (гигиена публичной vitrina-секции)

> Единственная истина для этого блока (spec-driven workflow: AGENTS.md, раздел Spec-driven features). Статусы: `draft` → `approved` → `done`.
> Исходный план: vault `wiki/plan/plan_contact_refactor.md`, rev.1 (draft, 2026-10-11). Companion: [TODO.md](./TODO.md).
> Язык: русский (правило владельца). Все user-facing строки в коде — i18n-ключи en+ru.
> Статус `approved` — вердикт владельца 2026-10-12: OPEN-1=A, OPEN-2=A (рекомендации приняты без изменений).

## Цель

Убрать мёртвый код и layout-отклонения в `features/Contact`, не меняя
поведение публичной секции Contact и формы `useContactForm`. Зафиксировать
соответствия gold-стандартам публичных секций (WorkHistory/Skills/About),
чтобы будущие проходы не «рефакторили» рабочий код.

**Честный итог разбора (2026-10-11): фича уже соответствует ARCH-1, Design C,
kit-паттернам, i18n-паритету и single-source zod-схеме. Это эпик-гигиена,
не рефакторинг.**

## Контекст (факты, проверено 2026-10-11)

- Слой: `features/Contact` (8 файлов tracked, 841 LOC, 14 тестов: 3 голых
  витрины + 3 content-ветки + 8 хука) — публичная секция главной
  (секция контактов + форма EmailJS). Админ-часть живёт отдельно в
  `features/AdminContact` (Contact CRUD stage-1, PR #169) и в скоуп не входит.
- Потребитель: `pages/Home/ui/HomePage` —
  `useSelector(selectContactContent)` → `<Contact content={contactContent}>`
  (`HomePage.tsx:46,80`).
- Соответствия: ARCH-1 layout (`ui/Contact/Contact.{tsx,module.scss,test.tsx}`,
  `model/types/types.ts`), Design C (`content?`-prop `types.ts:23`, fallback
  `Contact.tsx:28-30`, 3 голых теста не тронуты), единая zod-схема
  (`ContactFormDataSchema` из entities, `useContactForm.ts:6,84` — дрейф
  невозможен), 15 i18n-ключей en+ru симметричны и все потреблены, SCSS на
  токенах без deep-селекторов, kit-компоненты (Form/Input/InputEmail/
  Textarea/Button/Link/…), валидация — единый тост (R-4, решение владельца).
- Тосты формы читает стор-ветка через опцию `texts` (R-11,
  `useContactForm.ts:24,61-62`) — админ-правки доходят до Create-тостов.
- Миграция формы на RHF запрещена: `emailjs.sendForm` требует сырой DOM-формы
  (`useContactForm.ts:54,92-93`), Contact рендерится эйгерно в main-чанке —
  RHF в main сломает бюджет (`resume-lazy-rhf-chunk`).
- Витрина не list-like (1 mailto + 3 статичные ссылки, `Contact.tsx:104-124`)
  — DataTable/Pagination/EmptyState неприменимы.
- axe: `/` в PATHS (`scripts/purge-axe-check.mjs:37`).

## Скоуп

Меняются: `src/features/Contact/**` — `ui/Contact.content.test.tsx` (переезд
в `ui/Contact/`), `model/types/types.ts` (мёртвые типы/пропсы),
`ui/Contact/Contact.tsx` (мёртвый ref, дубль aria), `index.ts` (баррел,
OPEN-1).

НЕ меняются: логика `useContactForm` (единый тост, R-11, EmailJS-инъекция,
reset-after-success); Design C (`content?`-prop, fallback-ветка) и 3 голых
теста `Contact.test.tsx` — задокументированное решение Contact CRUD (§11);
model-слой `entities/ContactContent` (types/schema/seed) — заморожен;
`features/AdminContact`; заголовок `contact` (i18n-owned, split-brain guard);
`SOCIAL_LINKS` (константа entities/Developer, decision B); возвращаемый
контракт хука `setStatus`/`resetForm`.

## Требования

### R-1 — ARCH-1: тест в свою директорию
- [x] `ui/Contact.content.test.tsx` перемещён в
      `ui/Contact/Contact.content.test.tsx` (git mv); импорт внутри поправлен
      (`./Contact/Contact` → `./Contact`).
- [x] На верхнем уровне `ui/` нет `.tsx`/`.scss` файлов.
- [x] `npm run validate` зелёный (тесты content-ветки в том числе).

### R-2 — Мёртвый код удалён
- [x] Интерфейс `SocialLink` удалён из `model/types/types.ts` (дубль
      `entities/Developer/model/types/types.ts:23`, 0 использований).
- [x] `formRef` (`Contact.tsx:23,51`) удалён — `.current` нигде не читался.
- [x] Дублирующий `aria-required="true"` удалён с Textarea (`Contact.tsx:87`)
      — kit Textarea уже рендерит нативный `required` (`Textarea.tsx:266`).
- [x] `npm run validate` зелёный; grep `SocialLink|formRef` внутри
      `src/features/Contact` пуст.

### R-3 — Мёртвые пропсы
- [x] `id`/`className` удалены из `ContactProps`
      (`model/types/types.ts:16-17`) — компонент деструктурирует только
      `content` (`Contact.tsx:22`), потребителей пропсов нет.

### R-4 — Баррел
- [x] из `index.ts` удалены экспорты без production-
      потребителей: `useContactForm`, `CONTACT_EMAIL` (re-export из entities —
      AdminContact читает entities напрямую), `ContactFormData`, `FormStatus`;
      оставлен `Contact` (единственный импортируемый: `HomePage.tsx:18`).
- [x] `check:public-api` зелёный; ни один файл не импортирует удалённое из
      `@/features/Contact`.

### R-5 — Известные ограничения (зафиксировать, не чинить)
- [x] Тост-only валидация формы (единый `contactFormRequired` на все zod-
      ошибки, `useContactForm.ts:81-89`) — решение владельца Contact CRUD
      (R-4 плана); per-field ошибки — family-wide волна вне скоупа.
- [x] Миграция на RHF запрещена (main-чанк + DOM-требование `sendForm`).
- [x] Model-слой `entities/ContactContent` заморожен (дрейфа схем нет:
      форма использует `ContactFormDataSchema` напрямую — проверено grep'ом).

### R-6 — Гейты эпика
- [x] `npm run validate` зелёный (type-check + lint + lint:styles + тесты с
      coverage + public-api) — 3502/3502, public-api 37/37.
- [x] axe-app `/`: 0 регрессий против baseline (4 known).
- [x] Бандл-дельта worktree на merge-base в капе `performance-budget.json`
      (737280) — 733.5 KiB < 744 KiB; дельта ≈ 0 (только удаление кода,
      Contact в main-чанке).
- [x] en/ru parity-тест зелёный (ключи не менялись).
- [x] Все критерии R-1..R-4 закрыты; [TODO.md](./TODO.md) выжжен.

## Критерии приёмки (итог)

Главная страница Contact выглядит и ведёт себя ИДЕНТИЧНО до/после: секция,
форма, mailto, соцсети, тосты — без изменений. Удалены: мёртвый дубль типа
`SocialLink`, неиспользуемый `formRef`, дублирующий `aria-required`,
(OPEN-2=A) мёртвые пропсы, (OPEN-1=A) 4 мёртвых экспорта баррела. Тест
content-ветки живёт в `ui/Contact/` по ARCH-1. `npm run validate` и axe `/`
зелёные.
