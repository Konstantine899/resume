---
status: approved
epic: contact-rows-crud
issue: 285
created: '2026-10-18'
spec: SPEC.md
---

# TODO — contact-rows-crud

> Контракт: [SPEC.md](./SPEC.md). Правила: выполненный пункт **удаляется**
> (не отмечается). Каждый WU — отдельный conventional commit.
> План: vault `plan_admin_contact_migration.md` rev.5 §10. **Режим:
> СТРОГО AUTO** (директива владельца 2026-10-18) — без пофазовых
> подтверждений, merge при зелёных чеках, issue закрывается вручную.

## Оценка времени (показывается перед стартом — директива плана §10.0)

≈ 4–5,5 ч агентного времени: WU-1 контракт ~30–40 мин · WU-2 store ~30–40 ·
WU-3 i18n ~10 · WU-4 форма строки ~40–50 · WU-5 рефакторинг формы ~90–120 ·
WU-6 страница-тесты ~15 · WU-7 гейты ~45–60 · WU-8 PR+CI+merge ~20 ·
WU-9 бёрн-даун ~15.

- [ ] WU-1 — контракт: схема открытых записей (slug-ключ, max 600/120) +
      vitrina `Contact.tsx` per-key `?.` fallback; TDD: schema-тесты
      (add/невалидный ключ/пустое значение) + тест fallback в витрине;
      `useContactForm` — без правок
- [ ] WU-2 — store: slice-экшены `upsertContactTableRow` /
      `removeContactTableRow` / `resetContactTable`, удалить
      `resetToDefaults`; persist-THEN-dispatch snapshot-хелперы; TDD:
      тесты слайса + порядок persist→dispatch + persist-fail не меняет
      state
- [ ] WU-3 — i18n: ~15 flat-ключей en+ru по SPEC R-8; parity-тест не править
- [ ] WU-4 — `ui/ContactRowForm/` (add/edit, RHF+zod, key-immutable в
      edit, pristine-Save); TDD RED→GREEN: prefill, дубль-ключ, pristine,
      save→persist+dispatch+toast+exit
- [ ] WU-5 — рефакторинг `ContactEditorForm`: 3 Card со сворачиванием
      (дефолт свёрнуты, ARA-раундтрип), таблицы строками (0 input в
      ячейках), `.cellActions` nowrap Pencil/Trash2, Add/Reset над
      таблицей, 3 модалки (row-form/delete/reset, Cancel-focus,
      persist-fail открыт), email inline Save; подвал Save/Reset удалён;
      TDD: новый набор формы
- [ ] WU-6 — `AdminContactPage.test`: адаптация (контактные
      contactSave/contactReset-ассерты), прогон HomePage/витрина/
      useContactForm
- [ ] WU-7 — гейты R-9: validate, точечные vitest, check:axe, check:bundle,
      check:spec, preview smoke light+dark (collapse→expand→модалки→сырые
      ключи)
- [ ] WU-8 — PR `--base dev` (DRAFT→ready), CI, squash-merge, ручное
      закрытие issue #285
- [ ] WU-9 — бёрн-даун: SPEC→done+verified, TODO→closing note, dual-write
      vault `memory.md` + AGENTS.md; план rev.5 → status done

## Открытые пункты (закрываются вердиктом)

- OPEN-1 — CRUD соцссылок (SPEC «Не в области», план §10.2 D8): по умолчанию
  read-only; владелец вправе потребовать отдельным эпиком (вето в любой
  момент до merge).
