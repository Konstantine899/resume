---
status: done
epic: modal-content-scroll
issue: 234
created: '2026-10-14'
verified: '2026-10-14'
spec: 1
---

# SPEC — kit Modal: вертикальный скролл контента (modal-content-scroll)

Триггер: форма `JobForm` в модалке `/admin/jobs` выше панели и обрезается
(`ModalRoot.module.scss` → `.modal { max-height: 90vh; overflow: hidden }`),
полосы скролла нет. План владельца: `wiki/plan/plan_modal_content_scroll.md`.

## Контекст (факты, проверены 2026-10-14)

- `ModalContent.module.scss`: `.content` **уже** объявляет `overflow-y: auto` и `flex: 1`.
- `ModalRoot.module.scss`: у панели `.modal` **нет** `display: flex; flex-direction: column`
  → `flex: 1` инертен, высота контента не ограничивается, `overflow: hidden` панели
  обрезает низ формы.
- Потребитель: `AdminJobsPage.tsx` → compound `<Modal isOpen title>` →
  `ModalHeader + Divider + ModalContent(JobForm)` (без футера).

## Решение (вариант A, утверждается владельцем)

Оживить существующий контракт двумя декларациями, без нового API:

1. `.modal` (ModalRoot.module.scss): `+ display: flex; flex-direction: column`.
2. `.content` (ModalContent.module.scss): `+ min-height: 0` (иначе flex-элемент
   не сжимается ниже контента и `overflow-y: auto` не сработает).

## Критерии готовности (наблюдаемые исходы)

- [x] Открытая модалка `JobForm` («Добавить должность») с формой выше `90vh`:
  низ формы достижим вертикальной прокруткой **внутри панели**, обреза нет.
  (Проба: панель 720px, контент 1531px, «Сохранить» полностью в панели.)
- [x] Шапка модалки (заголовок + крестик) остаётся на месте — скроллится
  только `.content`.
- [x] Короткая модалка (confirm-delete записи, ModalAlert) — полосы скролла нет,
  высота как до фикса.
- [x] Мобильный лейаут (`≤640px`, панель снизу): тот же инвариант (скролл внутри
  панели, панель 711px ≤ 740px viewport).
- [x] Режим `scroll="body"` не сломан: контент без собственной полосы, скролл на body.
- [x] `npm run validate` зелёный; `check:axe` — 0 новых регрессий
  (в т.ч. `scrollable-region-focusable`: скролл-область JobForm содержит фокусируемые
  поля; text-only длинный контент — НЕ в скоупе, флаг появился бы → обсуждать отдельно).
- [x] `check:bundle` в бюджете (scss-only, дельта ≈ 0; 748.6 < 768 KiB).
- [x] Визуальная проба в превью (см. план WU-1) подтверждает исходы 1–3
  (+ story `LongContent` play-тест в реальном браузере).

## Вне скоупа

- Новый API/пропы модалки, JS-скролл, sticky-футеры.
- `ModalDrawer` (своя панель), текстовые модалки без фокусируемых элементов >90vh.
- Правки `JobForm`/`FieldEditForm` (лейаут формы не трогаем).

## Связи

- Эпик не конфликтует с PR #233 (select-picker dismiss, `useModalRoot.ts` — hooks):
  разные файлы; ветка режется от `dev` после его мержа или параллельно.
