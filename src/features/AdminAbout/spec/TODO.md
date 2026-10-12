---
status: done
spec: SPEC.md
---

# TODO — features/AdminAbout (рефакторинг к паритету с AdminSkills, rev.1)

Эпик `admin-about-refactor` ЗАКРЫТ 2026-10-12 (PR #218): WU-1..4 исполнены и выжжены
(выполненные пункты удаляются — правило эпика). Итоги гейтов: `npm run validate`
3485/3485, axe-app 0 регрессий (PATHS += `/admin/about`), бандл 733.3 < 744 KiB,
public-api 37/37. Контракт и критерии — [SPEC.md](./SPEC.md) (status `done`,
`verified: '2026-10-12'`). Вердикт владельца 2026-10-12: OPEN-1=B, OPEN-2=A,
OPEN-3=A (см. «Решения» внизу).

## Решения (вердикт владельца 2026-10-12)

- OPEN-1 = B (форма остаётся инлайн)
- OPEN-2 = A (срез 7 мёртвых экспортов)
- OPEN-3 = A (PATHS += /admin/about)
