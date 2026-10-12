---
status: done
spec: SPEC.md
---

# TODO — features/Contact (гигиена публичной vitrina-секции, rev.1)

Эпик `contact-refactor` ЗАКРЫТ 2026-10-12 (PR #220): WU-1..4 исполнены и выжжены
(выполненные пункты удаляются — правило эпика). Итоги гейтов: `npm run validate`
3502/3502, axe-app 0 регрессий, бандл 733.5 < 744 KiB (дельта ≈ 0 — только
удаление кода), public-api 37/37. Контракт и критерии — [SPEC.md](./SPEC.md)
(status `done`, `verified: '2026-10-12'`). Вердикт владельца 2026-10-12:
OPEN-1=A, OPEN-2=A (см. «Решения» внизу).

## Решения (вердикт владельца 2026-10-12)

- OPEN-1 = A — вырезать из `index.ts` мёртвые экспорты `useContactForm`,
  `CONTACT_EMAIL`, `ContactFormData`, `FormStatus`; оставить `Contact`.
- OPEN-2 = A — удалить мёртвые пропсы `id`/`className` из `ContactProps`.
