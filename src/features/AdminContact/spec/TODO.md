---
status: approved
epic: contact-social-crud
issue: 293
created: '2026-10-18'
spec: SPEC.md
---

# TODO — contact-social-crud

> Контракт: [SPEC.md](./SPEC.md). Правила: выполненный пункт **удаляется**
> (не отмечается). Каждый WU — отдельный conventional commit.
> План: vault `plan_admin_contact_migration.md` rev.7 §10.2.
> **Режим: СТРОГО AUTO** (директива владельца 2026-10-18).

## Оценка времени (показывается перед стартом — директива плана)

≈ 4,5–6 часов агентного времени: WU-1 контракт+схема+seed+storage ~40–50
мин · WU-2 slice+helper ~40 · WU-3 i18n ~20 · WU-4 `ContactSocialForm`
TDD ~50 · WU-5 блок в редакторе + тесты ~80–90 · WU-6 страница-тесты
~30 · WU-7 гейты ~50 · WU-8 PR/CI/merge ~20 · WU-9 бёрн-даун ~30.

- [ ] WU-1 — контракт (`ContactContent.socialLinks` optional в схеме,
      обязательный в типе) + `ContactSocialLink` + seed из `SOCIAL_LINKS` + read-path merge в `storage.ts` + тесты (старый конверт → seed
      ссылок, `{}` остаётся пустым, roundtrip)
- [ ] WU-2 — slice (`ContactTableRow` += socials, union value) +
      `withTableRows`/`omitKey` widening + тесты upsert/remove/reset
- [ ] WU-3 — 4 новых i18n-ключа en+ru + parity `adminKeys`
- [ ] WU-4 — TDD `ContactSocialForm` (RED → GREEN: pristine-Save,
      slug-валидация/дубликат, name/href-ошибки, persist-пайплайн,
      persist-fail)
- [ ] WU-5 — `ContactEditorForm`: CRUD-блок socials (Add/Reset
      testid-паритет, `.cellActions` Pencil/Trash2, confirm-модалки,
      URL `variant="ghost"` — тест), удалить read-only-тест (D8)
- [ ] WU-6 — `AdminContactPage.test`: socials add-row через реальный стор
- [ ] WU-7 — гейты: полный `npm run validate` (CPU-окно), `check:axe`,
      `check:bundle`, `check:spec`, preview smoke light+dark
- [ ] WU-8 — PR `--base dev` → CI → merge → ручное закрытие issue #293
- [ ] WU-9 — бёрн-даун пары + dual-write (vault + AGENTS.md)
