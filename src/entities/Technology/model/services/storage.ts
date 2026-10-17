// ============================================
// Technologies — localStorage persistence (SPEC D1/D5)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, technologies }` under
// the plan-specified key `technologies`. Callers persist FIRST and dispatch
// only on `true` — this module never throws, so a storage failure becomes
// a reported `false`, the slice stays untouched, and reload shows the
// previously saved catalog.
//
// Swap note: on the NestJS stage this whole module is replaced by RTK Query;
// nothing outside imports localStorage directly.

import { TechnologiesEnvelopeSchema } from '../schemes/schema';
import type { Technology } from '../types/types';

export const TECHNOLOGIES_STORAGE_KEY = 'technologies';

/**
 * Valid catalog or `null` — for missing/absent/corrupt/version-mismatched
 * data alike: every unreadable state falls back to the seed (D5), never a
 * throw. Duplicate keys are skipped with a warning (hydration guard).
 */
export const readTechnologies = (): Technology[] | null => {
  try {
    const raw = localStorage.getItem(TECHNOLOGIES_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = TechnologiesEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    const seen = new Set<string>();
    const unique: Technology[] = [];
    for (const tech of parsed.data.technologies) {
      if (seen.has(tech.key)) {
        // eslint-disable-next-line no-console
        console.warn(`[Technology] Duplicate key "${tech.key}" skipped at hydration`);
        continue;
      }
      seen.add(tech.key);
      unique.push(tech);
    }
    return unique;
  } catch {
    return null;
  }
};

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch.
 */
export const persistTechnologies = (technologies: Technology[]): boolean => {
  try {
    const envelope = TechnologiesEnvelopeSchema.safeParse({ v: 1, technologies });
    if (!envelope.success) return false;
    localStorage.setItem(TECHNOLOGIES_STORAGE_KEY, JSON.stringify(envelope.data));
    return true;
  } catch {
    return false;
  }
};
