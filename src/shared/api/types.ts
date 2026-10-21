// ============================================
// Contact document DTO — LOCAL mirror (migration plan rev.3, §3.7)
// ============================================
//
// FSD constraint: `shared` may NOT import `entities`, so the wire shape is
// declared here structurally instead of reusing `entities/ContactContent`.
// The mirror intentionally tracks the localStorage envelope `{ v: 1, content }`
// (plan §3.5 D3-α is the default assumption) — the FINAL wire format is
// approved when the real NestJS backend arrives (decision D3), and this file
// is the single swap point for that change.

/** Contact document envelope — mirrors the localStorage cache format. */
export type ContactDocumentDto = {
  /** Envelope version; `1` matches the localStorage envelope today. */
  v: 1;
  /** Full document payload; full-replace semantics (contract C2). */
  content: Record<string, unknown>;
};

// ============================================
// About portrait DTO (admin-about-table WU-14)
// ============================================
//
// FSD constraint again: `shared` may NOT import `entities/AboutContent`, so
// the portrait payload is declared STRUCTURALLY — and deliberately as
// `unknown`, NOT `Record<string, unknown>`: the entity contract is an
// `interface`, and an interface has no implicit index signature, so it is
// not assignable to `Record<string, unknown>` (verified with tsc). The
// consuming feature (AdminAbout) passes its concrete `AboutContent` (an
// `unknown` takes it with no cast) plus a persist seam that down-casts
// back to its own contract — so this layer stays free of feature/entity
// imports (allowedImports.shared = ['shared']).

/**
 * `updateAboutPortrait` argument: the full merged document (portrait path
 * already applied) plus the persistence seam injected by the feature. The
 * seam returns `true` when the document was written, `false` otherwise —
 * the same contract as the feature's `persistAboutContent`.
 *
 * The seam must be an ARROW FUNCTION at the call site: its parameter is
 * `unknown` (this layer cannot know the document shape), so passing a
 * named `(content: AboutContent) => boolean` reference directly would fail
 * strict parameter contravariance — the feature writes
 * `persist: (doc) => persistAboutContent(doc as AboutContent)`.
 */
export type UpdateAboutPortraitArg = {
  /** Full document, full-replace semantics; `portrait` carries the path. */
  content: unknown;
  /** Feature-owned persistence seam (localStorage today, API on swap). */
  persist: (content: unknown) => boolean;
};

/**
 * `updateAboutPortrait` result: the persisted document. A `false` from the
 * persist seam is NOT part of this data type — it travels on the ERROR
 * channel (`{ status: 500, data: { message: 'persist-failed' } }`), so the
 * mutation REJECTS (`.unwrap()` throws), the caller toasts and never
 * dispatches (persist-THEN-dispatch invariant preserved).
 */
export type UpdateAboutPortraitResult = {
  /** The document the seam wrote — mirrors the `content` passed in today. */
  document: unknown;
};
