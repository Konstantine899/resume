// ============================================
// Projects — localStorage persistence (plan_projects_crud §4)
// ============================================
//
// Stage-1 "backend": a versioned envelope `{ v: 1, projects }` under
// `resume.projects`. Callers persist FIRST and dispatch only on `true`
// (§3 order) — this module never throws, so a storage failure becomes
// a reported `false`, the slice stays untouched, and reload shows the
// previously saved collection.
//
// Swap note (§4.1): on the NestJS stage this whole module is replaced by
// RTK Query; nothing outside imports localStorage directly.

import { ProjectsEnvelopeSchema, type Project } from '@/entities/Project';

export const PROJECTS_STORAGE_KEY = 'resume.projects';

/**
 * Valid collection or `null` — for missing/absent/corrupt/version-mismatched
 * data alike: every unreadable state falls back to the seed (§7), never a
 * throw. Duplicate ids are skipped with a warning (hydration guard, §7).
 */
export const readProjects = (): Project[] | null => {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = ProjectsEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    const seen = new Set<string>();
    const unique: Project[] = [];
    for (const project of parsed.data.projects) {
      if (seen.has(project.id)) {
        // eslint-disable-next-line no-console
        console.warn(`[AdminMyWork] Duplicate project id "${project.id}" skipped at hydration`);
        continue;
      }
      seen.add(project.id);
      unique.push(project);
    }
    return unique;
  } catch {
    return null;
  }
};

/**
 * Validate, then write. `false` means NOTHING was written (invalid payload
 * or storage failure) — the caller must NOT dispatch (§3 order).
 */
export const persistProjects = (projects: Project[]): boolean => {
  try {
    const envelope = ProjectsEnvelopeSchema.safeParse({ v: 1, projects });
    if (!envelope.success) return false;
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(envelope.data));
    return true;
  } catch {
    return false;
  }
};

/** Drop the stored collection (Reset path, §3). Idempotent, never throws. */
export const removeProjects = (): void => {
  try {
    localStorage.removeItem(PROJECTS_STORAGE_KEY);
  } catch {
    // Storage unavailable — the in-memory slice still works this session.
  }
};
