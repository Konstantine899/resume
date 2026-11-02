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

let lastReadEnvelope: string | null = null;

const upgradeTechnologyEnvelope = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const envelope = raw as { v?: unknown; technologies?: unknown };
  if (envelope.v !== 1 || !Array.isArray(envelope.technologies)) return raw;
  return {
    v: 2,
    technologies: envelope.technologies.map((record) => {
      if (!record || typeof record !== 'object' || Array.isArray(record)) return record;
      const technology = record as { key?: unknown; name?: unknown };
      const currentName = typeof technology.name === 'string' ? technology.name.trim() : '';
      return {
        ...technology,
        name:
          currentName.length > 0
            ? currentName
            : typeof technology.key === 'string'
              ? technology.key
              : undefined,
      };
    }),
  };
};

const storage = createVersionedStorage<Technology[], TechnologiesEnvelope>({
  key: TECHNOLOGIES_STORAGE_KEY,
  envelopeSchema: TechnologiesEnvelopeSchema,
  extract: (envelope) => envelope.technologies,
  wrap: (technologies) => ({ v: 2, technologies }),
  // Duplicate keys are skipped with a warning (hydration guard).
  upgrade: upgradeTechnologyEnvelope,
  postProcess: (technologies) =>
    dedupeById(
      technologies,
      (tech) => tech.key,
      (key) => `[Technology] Duplicate key "${key}" skipped at hydration`
    ),
});
const baseRead = storage.read;
const basePersist = storage.persist;

/**
 * Technology storage read with a one-shot v1 -> v2 write-back when a migration
 * (or normalization) actually ran. Importing modules only receive the already
 * normalized catalog; migration state persistence remains idempotent and is
 * only attempted when the source envelope is still v1 (see M1).
 */
export const readTechnologies = (): Technology[] | null => {
  try {
    const raw = localStorage.getItem(TECHNOLOGIES_STORAGE_KEY);
    if (raw !== null) {
      const parsedJson: unknown = JSON.parse(raw);
      if (
        parsedJson !== null &&
        typeof parsedJson === 'object' &&
        !Array.isArray(parsedJson) &&
        (parsedJson as { v?: unknown }).v === 1
      ) {
        const migrated = upgradeTechnologyEnvelope(parsedJson);
        const validated = TechnologiesEnvelopeSchema.safeParse(migrated);
        if (validated.success) {
          const normalized = dedupeById(
            validated.data.technologies,
            (tech) => tech.key,
            (key) => `[Technology] Duplicate key "${key}" skipped at hydration`
          );
          // One write attempt: on failure the already-parsed catalog is
          // returned and the next read retries. Never throw downstream.
          void basePersist(normalized);
          lastReadEnvelope = raw;
          return normalized;
        }
      }
    }
  } catch {
    // Fall through to the shared read path below.
  }
  try {
    lastReadEnvelope = localStorage.getItem(TECHNOLOGIES_STORAGE_KEY);
  } catch {
    lastReadEnvelope = null;
  }
  return baseRead();
};

export const persistTechnologies = (data: Technology[]): boolean => {
  let currentEnvelope: string | null;
  try {
    currentEnvelope = localStorage.getItem(TECHNOLOGIES_STORAGE_KEY);
  } catch {
    currentEnvelope = null;
  }
  // Multi-tab collision avoidance: reject stale writes instead of clobbering.
  if (lastReadEnvelope === null || currentEnvelope === null) {
    lastReadEnvelope = currentEnvelope;
  }
  if (lastReadEnvelope !== null && currentEnvelope !== lastReadEnvelope) {
    return false;
  }
  const result = basePersist(data);
  if (result) {
    try {
      lastReadEnvelope = localStorage.getItem(TECHNOLOGIES_STORAGE_KEY);
    } catch {
      lastReadEnvelope = null;
    }
  }
  return result;
};

// NOTE: no remove() here on purpose — the Technologies catalog has no
// reset path (SPEC D1); storage.drop is wired only where a feature owns
// a Reset action.
