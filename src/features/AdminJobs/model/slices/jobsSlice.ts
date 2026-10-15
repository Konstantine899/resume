// ============================================
// jobsSlice — plan_workhistory_crud WU-2 / §5
// ============================================
//
// Stage-1 store for the JOBS collection (`Job[]`). Rules:
// - Persist FIRST, dispatch only when persist returned success (§5) — the
//   reducer therefore NEVER generates ids itself: the caller builds the exact
//   record/patch via `makeJobRecord` / `applyJobUpdate` / `applyJobToggle`,
//   persists the resulting array, then dispatches the SAME payload. Store
//   and storage stay byte-identical (§3 order).
// - `period` is a display dup of the dates (A5): every helper recomputes it
//   through `formatJobPeriod` — payload.period never survives.
// - `current ⇄ endDate` sync (A6): current forces endDate=null; switching
//   OFF never invents an end date (honest-data rule, recruiter audit P1) —
//   the form must supply one before a current=false record can be saved (§7).
// - Lazy hydration: the stored collection is read on the FIRST reducer
//   call — i.e. at configureStore — not at module import (lesson
//   resume-rtk-lazy-hydration); Date revival happens in storage.ts (A11).
//
// Side effects (localStorage writes) live in `storage.ts`.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { formatJobPeriod, type CreateJobDto, type Job, type UpdateJobDto } from '@/entities/Job';
import { createJobsSeed } from '../services/seed';
import { readJobs } from '../services/storage';

const jobsSlice = createSlice({
  name: 'adminJobs',
  // Placeholder for RTK's typing; the real first state comes from the
  // hydration wrapper below.
  initialState: [] as Job[],
  reducers: {
    addJob(state, action: PayloadAction<Job>) {
      state.push(action.payload);
    },
    updateJob(state, action: PayloadAction<UpdateJobDto>) {
      const found = state.find((job) => job.id === action.payload.id);
      if (found) Object.assign(found, applyJobUpdate(found, action.payload));
    },
    deleteJob(state, action: PayloadAction<string>) {
      const index = state.findIndex((job) => job.id === action.payload);
      if (index !== -1) state.splice(index, 1);
    },
    toggleCurrent(state, action: PayloadAction<string>) {
      const found = state.find((job) => job.id === action.payload);
      if (found) Object.assign(found, applyJobToggle(found));
    },
    resetToDefaults() {
      return createJobsSeed();
    },
  },
});

export const { addJob, deleteJob, resetToDefaults, toggleCurrent, updateJob } = jobsSlice.actions;

/**
 * Create payload: system-managed `id` + defaults + the recomputed `period`
 * are generated HERE, once — the form persists the array built from this
 * record and then dispatches it verbatim (§5 order guarantees store ===
 * storage). `current` defaults to false (absent from CreateJobDto, §4); the
 * create form may pass true explicitly for a "still working here" record.
 */
export const makeJobRecord = (dto: CreateJobDto, current = false): Job => {
  const endDate = current ? null : (dto.endDate ?? null);
  return {
    ...dto,
    id: crypto.randomUUID(),
    current,
    featured: dto.featured ?? false,
    endDate,
    period: formatJobPeriod(dto.startDate, endDate, current),
  };
};

/**
 * Merge helper shared by the reducer and the form's persist-first `next`
 * array: field merge + current⇄endDate sync (A6) + period recompute (A5).
 */
export const applyJobUpdate = (job: Job, dto: UpdateJobDto): Job => {
  const patch: Partial<Job> = { ...dto };
  delete patch.id;
  const current = patch.current ?? job.current;
  const startDate = patch.startDate ?? job.startDate;
  const endDate = current ? null : patch.endDate !== undefined ? patch.endDate : job.endDate;
  const merged: Job = { ...job, ...patch, current, startDate, endDate };
  return { ...merged, period: formatJobPeriod(startDate, endDate, current) };
};

/**
 * Flip helper for the quick "current" action (A6): ON ⇒ endDate null;
 * OFF ⇒ endDate left as-is (still null on a previously-current record —
 * no date is invented; the form enforces a real endDate on next save, §7).
 */
export const applyJobToggle = (job: Job): Job => {
  const current = !job.current;
  const endDate = current ? null : job.endDate;
  return {
    ...job,
    current,
    endDate,
    period: formatJobPeriod(job.startDate, endDate, current),
  };
};

/** Store → stored collection → seed: every unreadable state lands on the seed (§7). */
export const jobsReducer: typeof jobsSlice.reducer = (state, action) =>
  jobsSlice.reducer(state ?? readJobs() ?? createJobsSeed(), action);
