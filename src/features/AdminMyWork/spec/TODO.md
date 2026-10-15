---
status: done
spec: SPEC.md
verified: '2026-10-15'
---

# TODO — features/AdminMyWork (аменда mywork-field-actions, issue #245, rev.3)

Закрыто 2026-10-15: squash `e9f2696`, PR #246 (Closes #245), CI 8/8;
validate 3609/3609, axe 0 регрессий (`/admin/mywork` чист light+dark),
бандл 762.1 < 768 KiB, public-api 37/37, превью-смоук (Pencil строки →
prefilled-модалка `Редактировать: Название` + pristine-disabled Save +
Save→dispatch→тост; очистка link → строка исчезла по R-4 honest-data;
3 метрики: ↑ средней поменяла порядок, Trash2 удалила, крайние ↑↓
disabled, одиночная метрика — все действия disabled). Пункты WU-1..7
сгорели: (1) документация rev.3 (SPEC R-B1..R-B7 + vault), (2)
fieldSchemas 16/16, (3) i18n 5 ключей en+ru, (4) ProjectCard-действия
26/26, (5) FieldEditForm 8/8, (6) wiring + page-tests 10/10, (7) гейты.

Побочные фиксы, найденные эпиком (pre-existing, не в скоупе rev.3 изначально):
`projectFieldImage` и `projectFieldTechIcons` отсутствовали в ОБЕИХ
локали (raw-ключи в detail-таблице — второй и третий инстансы класса
`resume-shared-key`-бага семейства i18n); `javascript:`-фикстура
fieldSchemas-теста нарушала `no-script-url` (сплит конкатенацией,
семантика reject сохранена).

Контракт выполнен: `SPEC.md` (status: done, §Аменда rev.3 R-B1..R-B7,
инвариант R-1 аннотирован как отменённый амендой) и план
`wiki/plan/plan_mywork_detail_table.md` §Аменда rev.3.

## Известные проблемы (вне скоупа, не чинить)

- [ ] Кит не имеет Checkbox/Switch/Chip — Button-toggle techIcons и
      aria-pressed featured в ProjectForm и FieldEditForm остаются.
- [ ] `model/selectors/index.ts` — OPEN-8 repo-wide, не трогается.
