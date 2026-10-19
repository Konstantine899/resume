// ============================================
// versionedStorage — generic localStorage envelope persistence
// ============================================
//
// The six admin CRUD services (About/Contact/MyWork/Jobs/Skills storage
// services + entities/Technology) all implement the same stage-1
// "backend": a versioned envelope `{ v: 1, ... }` under a fixed key,
// JSON-parse → zod-validate → `null`/`false` on every unreadable state,
// never a throw. This factory owns that shared MECHANICS; each feature
// keeps its own specifics: key, envelope schema, payload extraction
// (the envelope field name differs per feature), legacy-upgrade hooks
// and post-validation fixes (dedupe).
//
// Contract (inherited by every delegating service):
// - read(): parsed document or `null` — missing/absent/corrupt/
//   version-mismatched data alike fall back to the seed at the slice
//   level, never a throw.
// - persist(data): validate, then write. `false` means NOTHING was
//   written (invalid payload or storage failure) — the caller must NOT
//   dispatch (persist-THEN-dispatch rule).
// - remove(): drop the stored document. Idempotent, never throws.
//
// Swap note: on the NestJS stage the delegating services are replaced by
// RTK Query; nothing outside imports localStorage directly.

import type { z } from 'zod';

export interface VersionedStorage<T> {
  read: () => T | null;
  persist: (data: T) => boolean;
  remove: () => void;
}

export interface VersionedStorageConfig<T, E> {
  /** The fixed localStorage key (`resume.about.content`, ...). */
  key: string;
  /** The exact envelope schema persisted by this feature (`{ v: 1, ... }`). */
  envelopeSchema: z.ZodType<E>;
  /** Pull the domain payload out of a VALIDATED envelope (field name differs per feature). */
  extract: (envelope: E) => T;
  /** Wrap a domain payload into the envelope object BEFORE validation on write. */
  wrap: (data: T) => unknown;
  /**
   * Optional read-path hook applied to the parsed JSON BEFORE envelope
   * validation (legacy-document upgrades, e.g. Contact's missing
   * `socialLinks`).
   */
  upgrade?: (raw: unknown) => unknown;
  /**
   * Optional read-path fix applied to the validated payload (dedupe of
   * duplicated ids, ...).
   */
  postProcess?: (data: T) => T;
}

/**
 * Build the read/persist/remove trio for one `{ v: 1 }` envelope key.
 * Feature-specific logic stays in the feature and is injected via
 * `extract`/`wrap`/`upgrade`/`postProcess`.
 */
export const createVersionedStorage = <T, E>(
  config: VersionedStorageConfig<T, E>
): VersionedStorage<T> => {
  const { key, envelopeSchema, extract, wrap, upgrade, postProcess } = config;

  const read = (): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      const parsedJson: unknown = JSON.parse(raw);
      const candidate = upgrade ? upgrade(parsedJson) : parsedJson;
      const parsed = envelopeSchema.safeParse(candidate);
      if (!parsed.success) return null;
      const data = extract(parsed.data);
      return postProcess ? postProcess(data) : data;
    } catch {
      return null;
    }
  };

  const persist = (data: T): boolean => {
    try {
      const parsed = envelopeSchema.safeParse(wrap(data));
      if (!parsed.success) return false;
      localStorage.setItem(key, JSON.stringify(parsed.data));
      return true;
    } catch {
      return false;
    }
  };

  const remove = (): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable — the in-memory state still works this session.
    }
  };

  return { read, persist, remove };
};

/**
 * Shared hydration guard: skip duplicated records with a console.warn
 * (per-feature message — the entity noun differs: project id / job id /
 * catalog key). Pure — no storage access.
 */
export const dedupeById = <T>(
  items: readonly T[],
  getId: (item: T) => string,
  formatWarning: (id: string) => string
): T[] => {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const item of items) {
    const id = getId(item);
    if (seen.has(id)) {
      // eslint-disable-next-line no-console
      console.warn(formatWarning(id));
      continue;
    }
    seen.add(id);
    unique.push(item);
  }
  return unique;
};
