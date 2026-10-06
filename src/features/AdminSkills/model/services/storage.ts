// ============================================
// Skills — localStorage persistence (plan_skills_crud §5)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, data }` under
// `resume.skills`. Callers persist FIRST and dispatch only on `true`
// (§3 order) — this module never throws, so a storage failure becomes
// a reported `false`, the slice stays untouched, and reload shows the
// previously saved collection.
//
// Every write runs iconSvg normalization first (A3/R-3): vite content
// hashes change on rebuild, so the store must only ever contain key
// names (`'react'`), never URLs — legacy URLs are reduced on the way in,
// and the WU-2 resolver passes them through on the way out.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import { SKILLS_DATA, SkillsEnvelopeSchema, type SkillCategoryData } from '@/entities/Skill';

export const SKILLS_STORAGE_KEY = 'resume.skills';

/**
 * URL/key → key name: basename → strip `.svg` → strip the 8-char vite
 * content hash. Values that are already key names and `data:` URLs pass
 * through untouched. Pure — exported for direct unit tests.
 */
export const normalizeIconSvg = (value: string): string => {
  if (value.startsWith('data:')) return value;
  if (!value.includes('/') && !value.endsWith('.svg')) return value;

  const base = value.split('/').pop() ?? value;
  const withoutExt = base.endsWith('.svg') ? base.slice(0, -4) : base;
  return withoutExt.replace(/-[A-Za-z0-9_-]{8}$/, '');
};

/** Apply normalization across a whole collection (immutably). */
const normalizeAll = (data: SkillCategoryData[]): SkillCategoryData[] =>
  data.map((category) => ({
    ...category,
    technologies: category.technologies.map((technology) => ({
      ...technology,
      iconSvg: normalizeIconSvg(technology.iconSvg),
    })),
  }));

/**
 * Valid collection or `null` — for missing/absent/corrupt/version-mismatched
 * data alike: every unreadable state falls back to the seed (§7), never a
 * throw.
 */
export const readSkills = (): SkillCategoryData[] | null => {
  try {
    const raw = localStorage.getItem(SKILLS_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = SkillsEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    return parsed.data.data;
  } catch {
    return null;
  }
};

/**
 * Normalize, validate, then write. `false` means NOTHING was written
 * (invalid payload or storage failure) — the caller must NOT dispatch
 * (§3 order).
 */
export const persistSkills = (data: SkillCategoryData[]): boolean => {
  try {
    const envelope = SkillsEnvelopeSchema.safeParse({ v: 1, data: normalizeAll(data) });
    if (!envelope.success) return false;
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(envelope.data));
    return true;
  } catch {
    return false;
  }
};

/** Drop the stored collection (Reset path, §3). Idempotent, never throws. */
export const removeSkills = (): void => {
  try {
    localStorage.removeItem(SKILLS_STORAGE_KEY);
  } catch {
    // Storage unavailable — the in-memory slice still works this session.
  }
};

/** Seed re-export for hydration fallbacks (single source: entities/Skill). */
export const skillsSeed = (): SkillCategoryData[] =>
  SKILLS_DATA.map((category) => ({
    ...category,
    technologies: [...category.technologies],
  }));
