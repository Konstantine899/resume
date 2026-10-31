---
status: draft
epic: modal-content-interface-migration
issue:
created: '2026-10-31'
spec: SPEC.md
---

# SPEC — shared/ui/Modal

> Single source of truth for this component (spec-driven workflow: AGENTS.md, section `Spec-driven features`).
> Statuses: `draft` -> `approved` -> `done`.
> Source plan: `D:\Dev\tools\DBObsidian\resume-app\wiki\plan\todo\modal-content-interface-migration.md`.

## Goal

Modernize the Modal content layer while preserving the existing host, overlay, open/close mechanics, focus behavior, and preset APIs.

## Context

- Layer: `shared` (FSD), feature area: `ui/Modal`.
- Existing system depends on `ModalRoot`, `ModalHeader`, `ModalContent`, `ModalFooter`, `ModalCloseButton`, `ModalForm`, `ModalAlert`, `ModalDrawer`.
- Variant A decision: improve compound composition and accessibility of `ModalContent` without changing the host architecture.
- Reuse only selected `shared/ui` primitives for content, forms, and dialog body states.
- Consumers are page, widget, and admin feature modals.

## Acceptance criteria

- [ ] `ModalContent` keeps `children` and `className` API.
- [ ] Body region remains the only scrolling area when `scroll='paper'`.
- [ ] No horizontal scroll at 320px and 400% zoom.
- [ ] Focus order, `Escape`, focus trap, initial focus, focus restore and focus-visible remain valid.
- [ ] Long structured content does not hide its first readable section.
- [ ] `aria-describedby` points only to a simple paragraph description, or is omitted for complex content.
- [ ] Footer remains outside the content scroll area and can stay sticky.
- [ ] `scroll-padding-block-end` or equivalent scrolling rule is applied so the focused element is not obscured by a sticky footer.
- [ ] Dark-mode behavior is supported only through tokens, with no blanket invert of multicolor icons.
- [ ] Contrast targets for AA dialogs: text 4.5:1, non-text interactive content 3:1.
- [ ] `prefers-reduced-motion` disables only decorative transitions, not core state changes.
- [ ] Baseline Phase 0 evidence exists before behavior changes.
- [ ] Component tests and consumer migration are green after each phase.

## Planned files

- `index.ts`
- `ui/Modal/Modal.tsx`
- `ui/ModalContent/ModalContent.tsx`
- `ui/ModalContent/ModalContent.module.scss`
- `ui/ModalHeader/ModalHeader.tsx`
- `ui/ModalFooter/ModalFooter.tsx`
- tests and stories under `Modal`
- related consumers and integration tests

## Out of scope

- Full native `<dialog>` root rewrite
- backend or state-management changes
- broad visual redesign
- changes to modal host architecture, overlay or focus trap

## Risks

- Additional wrappers may introduce focus-order or performance regressions.
- Tall forms may create overflow on mobile and iOS Safari.
- Moving scroll behavior can hide focused controls if sticky regions are not accounted for.
- Duplicate surfaces if `Card` is used as a wrapper inside the modal.

## Open questions

- Native host strategy is explicitly deferred; do not silently convert.
- Content data-slot naming contract to be approved before Phase 1.
