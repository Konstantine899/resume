// Jobs seed — THE source of defaults (plan_workhistory_crud §5, R-1)
// ============================================
//
// The seed IS the live `JOBS` constant (the vitrina's stage-0 source),
// returned as a FRESH DEEP COPY: RTK auto-freezes state, and without the
// copy the store would freeze the shared constant's nested objects too.
// Unlike Projects, this entity KEEPS real Date fields (A11 is a conscious
// difference) — `structuredClone` preserves them, a JSON round-trip would
// downgrade them to strings. `resetToDefaults` always comes back here.

import type { Job } from '@/entities/Job';
import { JOBS } from '@/entities/Job';

export const createJobsSeed = (): Job[] => structuredClone(JOBS);
