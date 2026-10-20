---
status: approved
spec: SPEC.md
epic: admin-about-table
created: '2026-10-19'
verified: '2026-10-20'
---

# TODO — features/AdminAbout (аменда rev.2: add/delete + Avatar + портрет)

> План к [SPEC.md](./SPEC.md) (approved, директива 2026-10-20). Предыдущая пара WU-0..9 сожжена 2026-10-20 (история в git). Пункты сгорают удалением.

## WU

- [ ] **WU-14 Портрет**: FileUpload accept jpg/png (MIME+ext, отказ иначе), saveImageToDir('about'), RTK Query `updateAboutPortrait` (локальный queryFn → свап на Nest.js), превью в админке, витрина читает `content.portrait`; тесты валидации форматов и мутации.
- [ ] **WU-15 i18n + тесты**: ключи en+ru (add/delete/превью/ошибки формата), parity + existence-guard, page-тест, баррел-пины; мёртвый код после R-1→R-1v2.
- [ ] **WU-16 Гейты**: validate, check:spec, axe light+dark, bundle (мерить — превышение = стоп), axe-stories, preview-смоук light+dark со скриншотами.
- [ ] **WU-17 Сдача**: squash `--base dev` (НЕ мержить), burn-down пары, `gh issue close` если есть issue эпика.
