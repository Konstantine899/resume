---
status: done
spec: SPEC.md
---

# TODO — features/AdminMyWork (рефакторинг к паритету с AdminSkills, rev.1)

Эпик `admin-mywork-refactor` ЗАКРЫТ 2026-10-12 (PR #217): WU-1..7 исполнены и выжжены
(выполненные пункты удаляются — правило эпика). Итоги гейтов: `npm run validate`
3464/3464, `check:axe:stories` 72/72, axe-app 0 регрессий, бандл 732.3 < 744 KiB,
public-api 37/37. Контракт и критерии — [SPEC.md](./SPEC.md) (status `done`,
`verified: '2026-10-12'`). Вердикт владельца 2026-10-12: OPEN-1=A, OPEN-2=A,
OPEN-3=A, OPEN-4=A (см. «Решения» внизу).

## Решения (вердикт владельца 2026-10-12)

- OPEN-1 = A — форма переезжает в page-owned kit Modal на странице (паритет Skills).
- OPEN-2 = A — витрина полностью на kit DataTable: Table + Pagination + PageSizeGroup, сортировка → page=1.
- OPEN-3 = A — мёртвые экспорты баррела вырезаются: 12 значений + 2 типа; HomePage.test → deep-import.
- OPEN-4 = A — подтверждения релокируются: две confirm-модалки и кнопки reset/delete удаляются из ProjectForm; reset — шапка витрины, delete — списка; THEN-dispatch кейсы сохранить.
