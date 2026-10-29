# SPEC — About-only cache sync micro-slice

status: draft
epic: about-only-cache-sync
created: 2026-10-29

## Contract

- Backend API GET /about returns normalized payload with updatedAt, fullName, descriptions, stats, statLabels, ctaLabel, optional portrait.
- Backend API PUT /about replaces entire About document (full replace).
- RTK Query tags: AboutContent provided by getAboutContent, invalidated by updateAboutContent and updateAboutPortrait.
- Frontend App.tsx normalizes payload by removing id/updatedAt and dispatching updateAboutContent only on success.
- Cross-tab sync via BroadcastChannel with strict message schema {entity:'about',updatedAt,sourceTabId}; receiver validates schema before triggering loadAbout().
- Fallback storage event listener for browsers lacking BroadcastChannel.
- Portrait stored as backend URL; frontend never treats local file as source of truth.
- Lazy hydration of technologies slice (already implemented elsewhere).
- All mutation failures preserve previous state and show toast.
- Conflict resolution: last write wins based on updatedAt.
