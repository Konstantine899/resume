---
status: approved
epic: contact-kit-max
issue: 282
created: '2026-10-17'
spec: SPEC.md
---

# TODO — contact-kit-max

> Контракт: [SPEC.md](./SPEC.md). Правила: выполненный пункт **удаляется**
> (не отмечается). Каждый WU — отдельный conventional commit.
> План: vault `plan_admin_contact_migration.md` rev.4 §8. Режим: auto.

- [ ] WU-1 — RED: тесты-семантика таблиц в `ContactEditorForm.test.tsx`
      (R-1/R-2/R-3): таблицы по ролям с caption `adminFieldTexts`,
      `adminFieldFormTexts`, `adminContactSocials`; columnheaders
      `['adminContactTableField','EN','RU']` и
      `['adminContactSocialName','adminContactSocialUrl']`, rows = N+1,
      socials-ссылки по роли `link`, testid `contact-form-socials` отсутствует;
      существующие 12 тестов не правятся (зелёные — пин через aria-label, C2)
- [ ] WU-2 — GREEN: `ContactEditorForm` → kit `Table` ×3 (тексты, formTexts,
      соцссылки), `aria-label` вместо `label`, удаление `.localeRow`/`.socialList`/`.field` + комментарий про layout-обёртки в SCSS; удалить import `Badge`, добавить `Table`/`Link`
- [ ] WU-3 — i18n: 4 ключа en+ru (`adminContactTableField`, `adminContactSocials`,
      `adminContactSocialName`, `adminContactSocialUrl`) — R-5, parity-тест не править
- [ ] WU-4 — гейты R-6: validate, точечные vitest (форма + AdminContactPage + HomePage),
      check:axe, check:bundle, check:spec, preview smoke light+dark на сырые ключи
- [ ] WU-5 — PR `--base dev` (DRAFT → ready), CI 8/8, squash-merge, ручное
      закрытие issue #282 (Closes не работает на dev — resume-closes-keyword-nondefault)
- [ ] WU-6 — burn-down: SPEC → `done` + `verified`, TODO → closing-note,
      dual-write: vault `memory.md` + `AGENTS.md` (gotcha класса resume-kit-*)

## Открытые пункты (закрываются вердиктом)

- OPEN-1 — ширина первой колонки таблиц текстов (`width: '12rem'` vs auto):
  вердикт владельца при preview-смоук.
