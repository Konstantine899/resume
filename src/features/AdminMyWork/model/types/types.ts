// AdminMyWork feature-local types (plan_projects_crud §4, §5).

import type { Project, ProjectFormData } from '@/entities/Project';

/** Root-state shape for this slice — selectors are typed against it. */
export interface MyWorkRootState {
  myWork: Project[];
}

/**
 * Payload of `updateProject`: every form field + the caller-stamped
 * `updatedAt`. The SAME object is persisted FIRST (§3 order), and the
 * reducer merges it verbatim — the slice never generates its own
 * timestamp, so storage and store stay byte-identical.
 */
export type ProjectUpdatePatch = ProjectFormData & { updatedAt: string };
