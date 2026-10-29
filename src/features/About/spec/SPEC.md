---
status: done
epic: about-only-cache-sync
created: 2026-10-29
---

# SPEC — About-only cache sync micro-slice

status: done
epic: about-only-cache-sync
created: 2026-10-29

## Contract

- Backend API GET /about returns normalized payload with updatedAt, fullName, descriptions, stats, statLabels, ctaLabel, optional portrait.
- Backend API PUT /about replaces entire About document (full replace).
- RTK Query tags: AboutContent provided by getAboutContent, invalidated by updateAboutContent and updateAboutPortrait.
- Frontend App.tsx normalizes payload by removing id/updatedAt and dispatching updateAboutContent only on success.

---

## Amendment — Remaining About sync fixes (sdd-session-2026-10-29-02, spec)

Formal spec: `.opencode/specs/sdd-session-2026-10-29-02/spec.md`.

- Public bootstrap MUST call `loadAbout()` on mount (not only on focus/visibility/
  inbound invalidation); guarded by an in-flight promise ref for StrictMode safety.
- Payload normalization MUST allow-list only domain fields and validate with
  `AboutContentSchema.strict()`; transport metadata (`id`, `updatedAt`,
  `expectedUpdatedAt`) MUST be stripped before dispatch.
- `updatedAt` is captured only into `loadedAboutRevisionRef` from the raw payload.
- Resume seed fallback retained on invalid/unavailable payload.
- Fallback storage event listener for browsers lacking BroadcastChannel.
- Portrait stored as backend URL; frontend never treats local file as source of truth.
- Lazy hydration of technologies slice (already implemented elsewhere).
- All mutation failures preserve previous state and show toast.
- Conflict resolution: last write wins based on updatedAt.
