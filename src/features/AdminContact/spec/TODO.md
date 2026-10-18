---
status: approved
epic: contact-row-textarea
issue: 289
created: '2026-10-18'
spec: SPEC.md
---

# TODO — contact-row-textarea

> Контракт: [SPEC.md](./SPEC.md). Правила: выполненный пункт **удаляется**
> (не отмечается). Каждый WU — отдельный conventional commit.
> План: vault `plan_admin_contact_migration.md` rev.6 §10.1. **Режим:
> СТРОГО AUTO** (директива владельца 2026-10-18).

## Оценка времени (показывается перед стартом — директива плана)

≈ 40–60 минут агентного времени: WU-1 TDD-замена формы ~20–30 мин ·
WU-2 гейты ~15–20 · WU-3 PR+CI+merge ~10 · WU-4 бёрн-даун ~5.

- [ ] WU-1 — TDD: в `ContactRowForm.test.tsx` EN/RU-ассерты на
      `tagName TEXTAREA` (RED на Input-рендере) → замена EN/RU `Input` →
      `Textarea` (`rows=3`, `autoResize`, кап-`maxLength`, тот же
      `error`-контракт); `key`/email — Input без правок (R-2);
      локали не трогаются (R-3)
- [ ] WU-2 — гейты: полный `npm run validate` (CPU-окно), `check:axe`,
      `check:bundle`, `check:spec`
- [ ] WU-3 — PR `--base dev` → CI → merge → ручное закрытие issue #289
- [ ] WU-4 — бёрн-даун пары + dual-write (vault + AGENTS.md)
