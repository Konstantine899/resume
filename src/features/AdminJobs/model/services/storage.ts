// ============================================
// Jobs — localStorage persistence (plan_workhistory_crud §5)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, data }` under
// `resume.jobs`. Mechanics (parse/validate/fallback/write) come from the
// shared `createVersionedStorage` factory (issue #302); this module keeps
// only the feature specifics: the key, the envelope schema, the payload
// extraction and the duplicate-id hydration guard (§7).
//
// Reads revive ISO strings into Date instances via the zod schema (A11):
// the entity contract types `startDate: Date` and `sortJobsByDate` calls
// `.getTime()` — a leaked string would NaN-sort the vitrina.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import { JobsEnvelopeSchema, type Job, type JobsEnvelope } from '@/entities/Job';
import { createVersionedStorage, dedupeById } from '@/shared/lib/versionedStorage';

export const JOBS_STORAGE_KEY = 'resume.jobs';

const storage = createVersionedStorage<Job[], JobsEnvelope>({
  key: JOBS_STORAGE_KEY,
  envelopeSchema: JobsEnvelopeSchema,
  extract: (envelope) => envelope.data,
  wrap: (jobs) => ({ v: 1, data: jobs }),
  // Duplicate ids are skipped with a warning (hydration guard, §7).
  postProcess: (jobs) =>
    dedupeById(
      jobs,
      (job) => job.id,
      (id) => `[AdminJobs] Duplicate job id "${id}" skipped at hydration`
    ),
});

/**
 * Valid collection or `null` — for missing/absent/corrupt/version-mismatched
 * data alike: every unreadable state falls back to the seed (§7), never a
 * throw. Duplicate ids are skipped with a warning (hydration guard, §7).
 */
export const readJobs = storage.read;

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch (§5 order).
 */
export const persistJobs = storage.persist;

/** Drop the stored collection (Reset path, §5). Idempotent, never throws. */
export const removeJobs = storage.remove;
