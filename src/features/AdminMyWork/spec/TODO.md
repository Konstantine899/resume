---
status: approved
spec: SPEC.md
verified: '2026-10-21'
---

# TODO — features/AdminMyWork (mywork-metrics-bullet-rows)

Эпик `mywork-metrics-bullet-rows` (директива владельца «выполни средние», задача A из трёх, 2026-10-21). Правила сгорания: выполненная единица **удаляется**, а не отмечается; критерии приёмки живут в [SPEC.md](./SPEC.md).

1. TDD RED: тесты `ui/ProjectForm/ProjectForm.test.tsx` — рендер строк метрик из defaultValues (edit), одна пустая строка в create, add / remove / move ↑↓, disabled-матрица (↑ первый, ↓ последний, X при одной строке), round-trip: строки доходят до записи, пустые строки отбрасываются.
2. `ui/ProjectForm/lib/projectFormSchema.ts`: вход `metrics: string[]` (trim + drop-blank вместо `splitMetricLines` по строкам), `emptyProjectFormValues` / `toProjectFormValues` дают `['']` при пустом списке; выход не меняется.
3. `ui/ProjectForm/ProjectForm.tsx`: Textarea метрик → bullet-блок `data-testid="project-metrics"` (Heading h3 + `Paragraph asChild`-инпуты + `IconButton` ↑/↓/X в Tooltip + кнопка `projectMetricAdd`), хендлеры add/remove/move на `setValue(…, { shouldDirty: true })`.
4. `ui/ProjectForm/ProjectForm.module.scss`: `.metricBlock` / `.metricRow` / `.metricInput` (геометрия JobForm `.bulletBlock` / `.bulletRow` / `.bulletInput`).
5. Локали: 4 ключа `projectMetricAdd` / `projectMetricUp` / `projectMetricDown` / `projectMetricRemove` (en+ru).
6. Гейты: vitest `src/features/AdminMyWork` + `src/pages/Admin` + `src/shared/lib/i18n`, type-check, lint, lint:styles, prettier (изменённые), check:spec, build + check:bundle (кап `total.maxSize` 896256 — НЕ поднимать).

Предыдущая пара (эпик `mywork-field-image-fileupload`, issue #273, done) перезаписана — история в git.
