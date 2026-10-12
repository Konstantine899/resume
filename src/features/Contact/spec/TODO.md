---
status: approved
spec: SPEC.md
---

# TODO — features/Contact (гигиена публичной vitrina-секции, rev.1)

Компаньон к [SPEC.md](./SPEC.md) (эпик `contact-refactor`). Исходный план:
vault `wiki/plan/plan_contact_refactor.md`, rev.1. Правила: выполненный пункт
УДАЛЯЕТСЯ (не отмечается); пункт без критерия не ревьюивается. Вердикт
владельца 2026-10-12: OPEN-1=A, OPEN-2=A (рекомендации приняты без изменений).

## WU-2 — Мёртвый код и пропсы (SPEC R-2/R-3)

- [ ] Удалить `SocialLink` из `model/types/types.ts:26-30` (дубль
      entities/Developer, 0 использований).
- [ ] Удалить `formRef` (`Contact.tsx:23`) и его передачу в `<Form>` (`:51`);
      убрать ставший не нужным `useRef`-импорт.
- [ ] Удалить дублирующий `aria-required="true"` с Textarea (`Contact.tsx:87`).
- [ ] Удалить `id`/`className` из `ContactProps` (`types.ts:16-17`).
- [ ] Гейт: `npm run validate`; grep `SocialLink|formRef` внутри
      `src/features/Contact` пуст.

## WU-3 — Баррел (SPEC R-4)

- [ ] Вырезать из `index.ts` экспорты `useContactForm`,
      `CONTACT_EMAIL`, `ContactFormData`, `FormStatus` (оставить `Contact`);
      до/после grep `from '@/features/Contact'` — только `Contact`.
- [ ] Гейт: `check:public-api` зелёный.

## WU-4 — Гейты эпика (SPEC R-6)

- [ ] `npm run validate` в CPU-окне (<45%) зелёный.
- [ ] axe-app `/`: 0 регрессий против baseline.
- [ ] Бандл-дельта worktree на merge-base: в капе 737280 (дельта ≤ 0).
- [ ] SPEC.md: критерии R-1..R-4 закрыты, статус → `done`, дата `verified`.
- [ ] Секция R-5 «Известные ограничения» сверена с кодом — соответствует
      фактическому состоянию.
- [ ] Дуал-райт: gotcha-записи в AGENTS.md/engram по итогам эпика (если
      появились).

## Решения (вердикт владельца 2026-10-12)

- OPEN-1 = A — вырезать из `index.ts` мёртвые экспорты `useContactForm`,
  `CONTACT_EMAIL`, `ContactFormData`, `FormStatus`; оставить `Contact`.
- OPEN-2 = A — удалить мёртвые пропсы `id`/`className` из `ContactProps`.
