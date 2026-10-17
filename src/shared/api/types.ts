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
