// ============================================
// Projects seed — THE source of defaults (plan_projects_crud §5, R-1)
// ============================================
//
// The seed IS the live `PROJECTS` constant (the vitrina's stage-0 source),
// returned as a FRESH DEEP COPY: RTK auto-freezes state, and without the
// copy the store would freeze the shared constant's nested objects too.
// JSON round-trip — the data is JSON-safe by contract (WU-1 removed the
// Date fields), and unlike a field-by-field copy it cannot forget a field.
// `resetToDefaults` always comes back here.

import type { Project } from '@/entities/Project';
import { PROJECTS } from '@/entities/Project';

export const createProjectsSeed = (): Project[] =>
  PROJECTS.map((project): Project => JSON.parse(JSON.stringify(project)));
