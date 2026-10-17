---
status: done
epic: contact-kit-max
issue: 282
created: '2026-10-17'
verified: '2026-10-18'
spec: SPEC.md
---

# TODO — contact-kit-max (закрыт)

> Эпик **завершён**: squash `dc3bafa` (PR #283, CI 8/8), issue #282 закрыт
> вручную (Closes не работает на dev — resume-closes-keyword-nondefault).
>
> Итог: три kit `Table` в `ContactEditorForm` (тексты 10×2, formTexts 4×2,
> соцссылки Name|URL), accessible name «key · LOCALE» → `aria-label` с той
> же строкой (C2 — 10 старых тестов зелёные без правок), удалены
> `.localeRow`/`.socialList`/`.field`, 4 i18n-ключа en+ru. Гейты: validate
> 3730/3730, axe 0 регрессий, бандл 821.9 < 840 KiB (без подъёма капов),
> preview smoke light+dark чист.
>
> OPEN-1 (ширина первой колонки) закрыт исполнителем: `width: '12rem'`
> прошёл preview-смоук и axe; владелец может уточнить при ревью. Следующая пара spec/ этого блока перезаписывает
> эту (история в git).
