---
status: draft
epic: modal-content-scroll
created: '2026-10-14'
verified: '2026-10-14'
spec: SPEC.md
---

# TODO — modal-content-scroll

План по WU: `wiki/plan/plan_modal_content_scroll.md` §5. Критерии — в `SPEC.md`.

- [ ] WU-1: `.modal` (ModalRoot.module.scss) `+ display: flex; flex-direction: column`;
  `.content` (ModalContent.module.scss) `+ min-height: 0` (парой, обязательны обе);
  stylelint --fix + ручная проверка `//`-комментариев; опц. story «TallContent».
- [ ] WU-1 (проба): превью/headed — JobForm выше панели → скролл внутри панели,
  header на месте, последний чип достижим; короткая модалка без полосы; ≤640px ок.
- [ ] WU-2: `npm run validate` (CPU <45 %), `check:axe` — 0 регрессий,
  `check:bundle` — в бюджете; PR в `dev`, CI зелёный.
- [ ] WU-3: после merge — SPEC/TODO → `status: done`; dual-write (vault `memory.md`
  + `memory/index.md` + AGENTS-гетч: flex-scroll паттерн `flex:1 + min-height:0`);
  burn-down-коммит (прецедент `docs/*-todo-burn`).
