// ============================================
// Projects — localStorage persistence (plan_projects_crud §4)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, projects }` under
// `resume.projects`. Mechanics (parse/validate/fallback/write) come from
// the shared `createVersionedStorage` factory (issue #302); this module
// keeps only the feature specifics: the key, the envelope schema, the
// payload extraction and the duplicate-id hydration guard (§7).
//
// Callers persist FIRST and dispatch only on `true` (§3 order) — every
// failure is a reported `false`/`null`, never a throw, so the slice
// stays untouched and reload shows the previously saved collection.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import { ProjectsEnvelopeSchema, type Project, type ProjectsEnvelope } from '@/entities/Project';
import { createVersionedStorage, dedupeById } from '@/shared/lib/versionedStorage';

export const PROJECTS_STORAGE_KEY = 'resume.projects';

const storage = createVersionedStorage<Project[], ProjectsEnvelope>({
  key: PROJECTS_STORAGE_KEY,
  envelopeSchema: ProjectsEnvelopeSchema,
  extract: (envelope) => envelope.projects,
  wrap: (projects) => ({ v: 1, projects }),
  // Duplicate ids are skipped with a warning (hydration guard, §7).
  postProcess: (projects) =>
    dedupeById(
      projects,
      (project) => project.id,
      (id) => `[AdminMyWork] Duplicate project id "${id}" skipped at hydration`
    ),
});

/**
 * Valid collection or `null` — for missing/absent/corrupt/version-mismatched
 * data alike: every unreadable state falls back to the seed (§7), never a
 * throw. Duplicate ids are skipped with a warning (hydration guard, §7).
 */
export const readProjects = storage.read;

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch (§3 order).
 */
export const persistProjects = storage.persist;

/** Drop the stored collection (Reset path, §3). Idempotent, never throws. */
export const removeProjects = storage.remove;
