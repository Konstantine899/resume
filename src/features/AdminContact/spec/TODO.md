---
status: done
epic: contact-rows-crud
issue: 285
created: '2026-10-18'
verified: '2026-10-18'
spec: SPEC.md
---

# TODO — contact-rows-crud (сожжён)

> Эпик ЗАКРЫТ 2026-10-18: squash `a9565e8` (PR #286, CI 8/8), issue #285
> закрыт вручную (Closes-ключевое слово не срабатывает на non-default
> ветке). План: vault `plan_admin_contact_migration.md` rev.5 §10 «Трек D»
> (директива владельца 2026-10-18, авто-режим, оценка ≈4–5,5 ч показана
> перед стартом).
>
> Выполнено WU-1..8: открытая контрактная модель строк (slug-ключ, капы
> 600/120) → slice-экшены (`resetToDefaults` удалён) → 16 i18n-ключей →
> `ContactRowForm` (add/edit, pristine-Save, пайплайн snapshot→persist→
> dispatch→toast→exit) → `ContactEditorForm` на 3 сворачиваемых Card
> (гебометрия Skills, таблицы без инпутов, Pencil/Trash2 в `.cellActions`
> nowrap, Add/Reset в шапке, confirm-модалки с Cancel-focus и
> persist-fail-паритетом, email — inline Save) → page-тесты против
> реального стора → гейты: validate 3749/3749, check:spec 17, axe 0
> регрессий, бандл 832.0<840 KiB, превью-смоук light+dark без сырых
> ключей.
>
> Отклонения: R-8 «~15 ключей» → фактически 16 (`adminContactTableActions`
> добавлен в WU-5, SPEC исправлен по правилу 7); `withTableRows` вынесен в
> `ui/ContactRowForm/lib/` (react-refresh-правило). История — в git;
> контракт живёт в [SPEC.md](./SPEC.md).
