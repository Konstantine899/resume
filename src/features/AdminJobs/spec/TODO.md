---
status: done
spec: SPEC.md
verified: '2026-10-21'
---

# TODO — features/AdminJobs (живая пара фичи)

**Закрыто (2026-10-21): незакрытых WU НЕТ.** Все эпики фичи done:
`jobs-detail-table` (#225), `job-field-edit` (#227), `job-status-select`
(#230) — каждый закрыт своим burn-down'ом (история в git: `2e9d6e4`,
`1a6be65` и др.); kit-level `modal-content-scroll` (#235/#236) — вне
контракта фичи.

**Лог восстановления пары (2026-10-21):** после #230 пара `spec/` была
перезаписана done-эпиком `modal-content-scroll` (#235/#236), и живой
контракт `features/AdminJobs` остался только в git-истории. Пара
восстановлена: SPEC взят из самой полной до-перезаписи версии
(`1a6be65`, rev.5 — секции rev.3/rev.4/rev.5) и сверен с кодом
(`verified: '2026-10-21'`): добавлены/уточнены поздние изменения #256
(`.cellActions` nowrap в ячейках detail-таблицы), #309/issue #302
(общий хук `useConfirmAction` в `JobsList`), точные line-референсы
`JobForm.tsx`/`Select.tsx` и фактический тип `JobsFormState`; исторические
секции «Контекст» и «Скоуп» помечены как состояние ДО эпика. Статусы
эпиков не менялись — все `done`.

Контракт и критерии — [SPEC.md](./SPEC.md) (`done`,
`verified: '2026-10-21'`). Новые WU не планируются: следующее изменение
фичи начинается с новой ревизии/эпика в этой же паре (перезапись — по
прецеденту `resume-admin-contact-migration` gotcha 4).
