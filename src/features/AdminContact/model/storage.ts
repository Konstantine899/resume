// ============================================
// ContactContent — localStorage persistence (plan Contact CRUD §4)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, content }` under
// `resume.contact.content`. Callers persist FIRST and dispatch only on
// `true` (§4) — this module never throws, so a storage failure becomes
// a reported `false`, the slice stays untouched, and reload shows the
// previously saved document.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import {
  ContactContentEnvelopeSchema,
  ContactContentSchema,
  type ContactContent,
} from '@/entities/ContactContent';

export const CONTACT_CONTENT_STORAGE_KEY = 'resume.contact.content';

/**
 * Parsed document or `null` — for missing/absent/corrupt/versioned-invalid
 * data alike: every unreadable state falls back to the seed (§7), never a throw.
 */
export const readContactContent = (): ContactContent | null => {
  try {
    const raw = localStorage.getItem(CONTACT_CONTENT_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = ContactContentEnvelopeSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.content : null;
  } catch {
    return null;
  }
};

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch (§4 order, R-7).
 */
export const persistContactContent = (content: ContactContent): boolean => {
  try {
    const parsed = ContactContentSchema.safeParse(content);
    if (!parsed.success) return false;
    localStorage.setItem(
      CONTACT_CONTENT_STORAGE_KEY,
      JSON.stringify({ v: 1, content: parsed.data })
    );
    return true;
  } catch {
    return false;
  }
};

/** Drop the stored document (Reset path, §3). Idempotent, never throws. */
export const removeContactContent = (): void => {
  try {
    localStorage.removeItem(CONTACT_CONTENT_STORAGE_KEY);
  } catch {
    // Storage unavailable — the in-memory slice still works this session.
  }
};
