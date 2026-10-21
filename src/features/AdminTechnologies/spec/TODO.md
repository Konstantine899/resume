---
status: approved
epic: technologies-pagination-default-5
issue: 271
created: '2026-10-17'
spec: SPEC.md
---

# TODO — features/AdminTechnologies (default 5 + нумерация ниже таблицы)

> План эпика issue #271 (директива владельца 2026-10-17). Язык: русский
> (правило владельца). Контракт и вердикты: [SPEC.md](./SPEC.md).
> Правило: выполненный шаг УДАЛЯЕТСЯ, а не отмечается галочкой.
> WU-0..WU-6 сгорели (код, тесты, SPEC/TODO, гейты зелёные: validate
> 3714/3714 — два CPU-флейка зелёные в изоляции, public-api 37/37, бандл
> 778.3 < 784 KiB без подъёма капов, axe 0 регрессий от baseline 4, check:spec
> 16, дифф локалей пуст).

## Работа

- [ ] WU-7: один конвеншнл-коммит `feat(technologies-admin): default page
  size 5 and pagination below the table`; push; DRAFT PR
      `--base dev` (ОБЯЗАТЕЛЬНО — default-ветка репо `main`), body:
      директивы, `Closes #271`, результаты гейтов. НЕ мержить, НЕ удалять
      ветки.
