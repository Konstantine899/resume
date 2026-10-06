// AdminJobs feature-local types (plan_workhistory_crud WU-2).

import type { Job } from '@/entities/Job';

/** Root-state shape for this slice — selectors are typed against it. */
export interface JobsRootState {
  adminJobs: Job[];
}
