// ============================================
// Contact document DTO — LOCAL mirror (migration plan rev.3, §3.7)
// ============================================
//
// FSD constraint: `shared` may NOT import `entities`, so the wire shape is
// declared here structurally instead of reusing `entities/ContactContent`.
// The mirror intentionally tracks the localStorage envelope `{ v: 1, content }`
// (plan §3.5 D3-а is the default assumption) — the FINAL wire format is
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
  persist: (content: unknown) => boolean | Promise<boolean>;
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

// ============================================
// Auth DTOs (Plan 2 step 2)
// ============================================

/** Login credentials sent to `/auth/login`. */
export type AuthCredentials = {
  email: string;
  password: string;
};

/** Registration credentials (alias with optional deviceId for parity). */
export type RegisterCredentials = AuthCredentials & {
  deviceId?: string;
};

/** Wire shape of `/auth/login` and `/auth/refresh`. */
export type AuthTokenResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

/** Wire shape of `/auth/me`. */
export type AuthUser = {
  id: string;
  email: string;
  role: string;
  theme: UserTheme;
  language: UserLanguage;
};

// ============================================
// Auth preferences DTOs (Phase A backend)
// ============================================
export type UserTheme = 'light' | 'dark';

// About document DTO (sync about plan)
export type AboutContentDto = {
  fullName: string;
  descriptions: { en: string; ru: string }[];
  stats: Record<string, { en: string; ru: string }>;
  statLabels?: Record<string, { en: string; ru: string }>;
  ctaLabel: { en: string; ru: string } | null;
  portrait?: string;
  updatedAt?: string;
  expectedUpdatedAt?: string;
  id?: string;
};

// Contact messages (admin inbox, Phase 4)
export type ContactMessageAdminStatus = 'NEW' | 'READ' | 'REPLIED';
export type ContactMessageAdminDto = {
  id: string;
  email: string;
  subject?: string;
  body: string;
  source?: string;
  locale?: string;
  status: ContactMessageAdminStatus;
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
};

export type ListContactMessagesQuery = {
  status?: 'ALL' | ContactMessageAdminStatus;
  skip?: number;
  take?: number;
};
export type UserLanguage = 'en' | 'ru';

/** Wire shape of PATCH /users/me/preferences. */
export type UpdatePreferencesInput = {
  theme?: UserTheme;
  language?: UserLanguage;
};

// ============================================
// Site settings DTO (Phase A backend)
// ============================================
export type SiteSettingsDto = {
  id: string;
  resumeUrl: string | null;
  updatedAt?: string;
};

// Contact messages (plan-contact-crm / backend POST /contact/messages)
export type CreateContactMessageInput = {
  email: string;
  subject?: string;
  body: string;
  source?: string;
  locale?: UserLanguage;
  website?: string;
};
