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

---

# Amendment TODO — Contact CRM ingestion (2026-10-27)

- [ ] T-0. approved by owner
- [ ] T-1. add DTO types in types.ts + createContactMessage mutation in apiSlice
- [ ] T-2. replace EmailJS submit with API call in useContactForm
- [ ] T-3. add honeypot + form caps + locale
- [ ] T-4. update i18n keys en/ru + parity
- [ ] T-5. update tests payload/tosat/reset + rate limit
- [ ] T-6. regenerate openapi snapshot after backend endpoint
- [ ] T-7. docs / vault dual-write

---

# Amendment 4-6 TODO — Contact CRM (2026-10-27)

- [ ] F-H0. contact submit contract aligned (backend endpoint done)
- [ ] F-H1. DTO update with subject/body/source/locale
- [ ] F-H2. createContactMessage api endpoint + reauth skip behavior
- [ ] F-H3. honeypot in payload + client validation
- [ ] F-H4. RFC mapping for 400/422/429/503 in form
- [ ] F-H5. locale metadata and URL submit
- [ ] F-H6. i18n keys + parity check ` check:spec`
- [ ] F-H7. AppRouter test/ smoke hardening
- [ ] F-H8. email normalization domain-lowercase / trim
- [ ] F-H9. run full `npm run validate`, document CPU gate environment
