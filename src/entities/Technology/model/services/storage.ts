// ============================================
// Technologies — localStorage persistence (SPEC D1/D5)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, technologies }` under
// the plan-specified key `technologies`. Mechanics (parse/validate/
// fallback/write) come from the shared `createVersionedStorage` factory
// (issue #302); this module keeps only the specifics: the key, the
// envelope schema, the payload extraction and the duplicate-key
// hydration guard.
//
// Callers persist FIRST and dispatch only on `true` — every failure is a
// reported `false`/`null`, never a throw, so the slice stays untouched
// and reload shows the previously saved catalog.
//
// Swap note: on the NestJS stage this whole module is replaced by RTK
// Query; nothing outside imports localStorage directly.

import { createVersionedStorage, dedupeById } from '@/shared/lib/versionedStorage';
import { TechnologiesEnvelopeSchema } from '../schemes/schema';
import type { Technology } from '../types/types';
import type { TechnologiesEnvelope } from '../schemes/schema';

export const TECHNOLOGIES_STORAGE_KEY = 'technologies';

const storage = createVersionedStorage<Technology[], TechnologiesEnvelope>({
  key: TECHNOLOGIES_STORAGE_KEY,
  envelopeSchema: TechnologiesEnvelopeSchema,
  extract: (envelope) => envelope.technologies,
  wrap: (technologies) => ({ v: 1, technologies }),
  // Duplicate keys are skipped with a warning (hydration guard).
  postProcess: (technologies) =>
    dedupeById(
      technologies,
      (tech) => tech.key,
      (key) => `[Technology] Duplicate key "${key}" skipped at hydration`
    ),
});

/**
 * Valid catalog or `null` — for missing/absent/corrupt/version-mismatched
 * data alike: every unreadable state falls back to the seed (D5), never a
 * throw. Duplicate keys are skipped with a warning (hydration guard).
 */
export const readTechnologies = storage.read;

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch.
 */
export const persistTechnologies = storage.persist;

// NOTE: no remove() here on purpose — the Technologies catalog has no
// reset path (SPEC D1); storage.drop is wired only where a feature owns
// a Reset action.
