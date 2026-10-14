---
status: done
spec: SPEC.md
---

# TODO — features/AdminJobs (селект статуса записи, rev.5, epic job-status-select)

**Закрыт (2026-10-14):** все WU выполнены и выжжены (выполненные пункты
удаляются — правило эпика); PR #230 SQUASH-MERGED в `dev` (`e359872`,
«feat(admin-jobs): JobForm status select (job-status-select) (#230)»), 8/8
CI-checks зелёные, ветка удалена. Вердикт владельца 2026-10-14 — **вариант A**:
один kit Select «Статус записи» (3 опции `''`/`'current'`/`'featured'`),
взаимоисключение флагов в пределах записи, prefill «оба → `'current'`»,
submit-нормализация в `handleSave`. Гейты: validate зелёный (public-api
37/37), axe-app 0 регрессий (baseline 4), бандл 748.6 < 768 KiB (Δ ~0.2 KiB
от merge-base), check:spec ready; превью light+dark (3 опции, A6-цикл
туда-обратно, prefill 4 типов записей, нормализация «оба» проверена в живом
UI). Пара SPEC/TODO переведена в `done` этим burn-down коммитом
(`docs/job-status-select-burn`). Контракт и критерии —
[SPEC.md](./SPEC.md) (`done`, `verified: '2026-10-14'`).
