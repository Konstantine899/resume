// ============================================
// AboutContent — localStorage persistence (plan About CRUD §4)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, content }` under
// `resume.about.content`. Callers persist FIRST and dispatch only on
// `true` (§4) — this module never throws, so a storage failure becomes
// a reported `false`, the slice stays untouched, and reload shows the
// previously saved document.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import {
  AboutContentEnvelopeSchema,
  AboutContentSchema,
  type AboutContent,
} from '@/entities/AboutContent';

export const ABOUT_CONTENT_STORAGE_KEY = 'resume.about.content';

/**
 * Parsed document or `null` — for missing/absent/corrupt/versioned-invalid
 * data alike: every unreadable state falls back to the seed (§7), never a throw.
 */
export const readAboutContent = (): AboutContent | null => {
  try {
    const raw = localStorage.getItem(ABOUT_CONTENT_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = AboutContentEnvelopeSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.content : null;
  } catch {
    return null;
  }
};

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch (§4 order, R-7).
 */
export const persistAboutContent = (content: AboutContent): boolean => {
  try {
    const parsed = AboutContentSchema.safeParse(content);
    if (!parsed.success) return false;
    localStorage.setItem(ABOUT_CONTENT_STORAGE_KEY, JSON.stringify({ v: 1, content: parsed.data }));
    return true;
  } catch {
    return false;
  }
};

/** Drop the stored document (Reset path, §3). Idempotent, never throws. */
export const removeAboutContent = (): void => {
  try {
    localStorage.removeItem(ABOUT_CONTENT_STORAGE_KEY);
  } catch {
    // Storage unavailable — the in-memory slice still works this session.
  }
};
