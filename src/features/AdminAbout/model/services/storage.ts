// ============================================
// AboutContent — localStorage persistence (plan About CRUD §4)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, content }` under
// `resume.about.content`. Mechanics (parse/validate/fallback/write) come
// from the shared `createVersionedStorage` factory (issue #302); this
// module keeps only the feature specifics: the key, the envelope schema
// and the payload extraction.
//
// Callers persist FIRST and dispatch only on `true` (§4) — every failure
// is a reported `false`/`null`, never a throw, so the slice stays
// untouched and reload shows the previously saved document.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import {
  AboutContentEnvelopeSchema,
  type AboutContent,
  type AboutContentEnvelope,
} from '@/entities/AboutContent';
import { createVersionedStorage } from '@/shared/lib/versionedStorage';

export const ABOUT_CONTENT_STORAGE_KEY = 'resume.about.content';

const storage = createVersionedStorage<AboutContent, AboutContentEnvelope>({
  key: ABOUT_CONTENT_STORAGE_KEY,
  envelopeSchema: AboutContentEnvelopeSchema,
  extract: (envelope) => envelope.content,
  wrap: (content) => ({ v: 1, content }),
});

/**
 * Parsed document or `null` — for missing/absent/corrupt/versioned-invalid
 * data alike: every unreadable state falls back to the seed (§7), never a throw.
 */
export const readAboutContent = storage.read;

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch (§4 order, R-7).
 */
export const persistAboutContent = storage.persist;

/** Drop the stored document (Reset path, §3). Idempotent, never throws. */
export const removeAboutContent = storage.remove;
