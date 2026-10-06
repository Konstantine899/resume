// ============================================
// Jobs — localStorage persistence (plan_workhistory_crud §5)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, data }` under
// `resume.jobs`. Callers persist FIRST and dispatch only on `true`
// (§5 order) — this module never throws, so a storage failure becomes
// a reported `false`, the slice stays untouched, and reload shows the
// previously saved collection.
//
// Reads revive ISO strings into Date instances via the zod schema (A11):
// the entity contract types `startDate: Date` and `sortJobsByDate` calls
// `.getTime()` — a leaked string would NaN-sort the vitrina.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import { JobsEnvelopeSchema, type Job } from '@/entities/Job';

export const JOBS_STORAGE_KEY = 'resume.jobs';

/**
 * Valid collection or `null` — for missing/absent/corrupt/version-mismatched
 * data alike: every unreadable state falls back to the seed (§7), never a
 * throw. Duplicate ids are skipped with a warning (hydration guard, §7).
 */
export const readJobs = (): Job[] | null => {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JobsEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    const seen = new Set<string>();
    const unique: Job[] = [];
    for (const job of parsed.data.data) {
      if (seen.has(job.id)) {
        // eslint-disable-next-line no-console
        console.warn(`[AdminJobs] Duplicate job id "${job.id}" skipped at hydration`);
        continue;
      }
      seen.add(job.id);
      unique.push(job);
    }
    return unique;
  } catch {
    return null;
  }
};

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch (§5 order).
 */
export const persistJobs = (jobs: Job[]): boolean => {
  try {
    const envelope = JobsEnvelopeSchema.safeParse({ v: 1, data: jobs });
    if (!envelope.success) return false;
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(envelope.data));
    return true;
  } catch {
    return false;
  }
};

/** Drop the stored collection (Reset path, §5). Idempotent, never throws. */
export const removeJobs = (): void => {
  try {
    localStorage.removeItem(JOBS_STORAGE_KEY);
  } catch {
    // Storage unavailable — the in-memory slice still works this session.
  }
};
