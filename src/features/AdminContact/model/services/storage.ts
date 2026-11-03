// ============================================
// ContactContent — localStorage persistence (plan Contact CRUD §4)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, content }` under
// `resume.contact.content`. Mechanics (parse/validate/fallback/write)
// come from the shared `createVersionedStorage` factory (issue #302);
// this module keeps only the feature specifics: the key, the envelope
// schema, the payload extraction and the legacy-upgrade hook (R-1).
//
// Callers persist FIRST and dispatch only on `true` (§4) — every failure
// is a reported `false`/`null`, never a throw, so the slice stays
// untouched and reload shows the previously saved document.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import {
  ContactContentEnvelopeSchema,
  type ContactContent,
  type ContactContentEnvelope,
} from '@/entities/ContactContent';
import { createVersionedStorage } from '@/shared/lib/versionedStorage';
import { createContactSeed } from './seed';

export const CONTACT_CONTENT_STORAGE_KEY = 'resume.contact.content';

/**
 * contact-social-crud R-1: a document persisted BEFORE the socials table
 * has no `socialLinks` key — the read-path injects the seed links BEFORE
 * validation, so missing (legacy) is upgraded while an explicitly saved
 * `{}` stays empty (the admin really deleted every row).
 */
const upgradeLegacyDocument = (raw: unknown): unknown =>
  raw !== null &&
  typeof raw === 'object' &&
  'content' in raw &&
  raw.content !== null &&
  typeof raw.content === 'object' &&
  !('socialLinks' in raw.content)
    ? {
        ...raw,
        content: {
          ...raw.content,
          socialLinks: createContactSeed().socialLinks,
        },
      }
    : raw;

const storage = createVersionedStorage<ContactContent, ContactContentEnvelope>({
  key: CONTACT_CONTENT_STORAGE_KEY,
  envelopeSchema: ContactContentEnvelopeSchema,
  extract: (envelope) => envelope.content,
  wrap: (content) => ({ v: 1, content }),
  upgrade: upgradeLegacyDocument,
});

/**
 * Parsed document or `null` — for missing/absent/corrupt/versioned-invalid
 * data alike: every unreadable state falls back to the seed (§7), never a throw.
 */
export const readContactContent = storage.read;

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch (§4 order, R-7).
 */
export const persistContactContent = storage.persist;

/** Drop the stored document (Reset path, §3). Idempotent, never throws. */
export const removeContactContent = storage.remove;
