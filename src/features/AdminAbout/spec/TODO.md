---
status: approved
spec: SPEC.md
epic: admin-about-table
created: '2026-10-19'
verified: '2026-10-19'
---

# TODO — features/AdminAbout (витрина на kit Table, rev.1)

> План к [SPEC.md](./SPEC.md) (`approved` 2026-10-19: OPEN-1=а, OPEN-2=да, OPEN-3=да, OPEN-4=да). Пункты сгорают удалением, не отметками.

## Предусловие

- [ ] Перед PR эпика: rebase ветки на свежий `dev` (если PR #314 ещё не замержен — файл `AboutEditorForm.module.scss` конфликтует).

## WU

- [x] **WU-0** Вердикты OPEN-1..4 → `status: approved` (2026-10-19).
- [ ] **WU-1 (TDD)** `ui/AboutEditorList/lib/fieldSchemas.ts`: zod-слайсы 9 полей + `toMergedDocument(base, field, value)`; красные → зелёные тесты.
- [ ] **WU-2** Vitrina-save-путь: снапшот → merge → `persistAboutContent` → `updateAboutContent(merged)`; persist-fail не двигает стор (error-тост, модалка открыта) — тесты вместе с WU-3.
- [ ] **WU-3** Витрина `ui/AboutEditorList/`: kit Table [Поле|EN|RU|Действия] + шапка (h2+hint) + Reset-контур + Pencil в `.cellActions` nowrap; rename `AboutEditorForm` → `AboutEditorList` (баррел, `AdminAboutPage`, пин).
- [ ] **WU-4** `ui/AboutFieldEditForm/`: модалка per-row (Textarea 600 / Input 60/40/80, pristine-disabled Save, `key=`field`), i18n.
- [ ] **WU-5** fullName-блок с inline Save.
- [ ] **WU-6** i18n en+ru + parity; тесты: page-тест переписать, старый form-тест переписать/убить, мёртвый SCSS удалить.
- [ ] **WU-7** `useConfirmAction` на Reset-confirm (OPEN-4).
- [ ] **WU-8** Гейты: validate, check:spec, axe-app (light+dark), check:bundle (мерить), preview-смоук на сырые ключи.
- [ ] **WU-9** Squash `--base dev` (НЕ мержить без слова владельца), burn-down этой пары, `gh issue close`.
