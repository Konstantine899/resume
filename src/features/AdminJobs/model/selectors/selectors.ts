// jobs selectors (plan_workhistory_crud WU-2, A1/§5).

import { sortJobsByDate, type Job } from '@/entities/Job';
import type { JobsRootState } from '../types/types';

export const selectAllJobs = (state: JobsRootState): Job[] => state.adminJobs;

/** Vitrina read path (A1): HomePage wires this into `<WorkHistory content>`. */
export const selectSortedJobs = (state: JobsRootState): Job[] =>
  sortJobsByDate(selectAllJobs(state));

export const selectJobById = (state: JobsRootState, id: string): Job | undefined =>
  selectAllJobs(state).find((job) => job.id === id);

/** The single `current: true` record (seed id 1) — admin "GET /jobs?current=1". */
export const selectCurrentJob = (state: JobsRootState): Job | undefined =>
  selectAllJobs(state).find((job) => job.current);
