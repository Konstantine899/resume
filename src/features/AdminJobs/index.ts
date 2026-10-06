// ============================================
// AdminJobs (WorkHistory CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD): only `pages` and this feature itself may import this API —
// `features → features` is banned, so `features/WorkHistory` (the vitrina)
// never touches it; the vitrina receives content as a prop from HomePage
// (Design C).
//
// WU-2 ships the model only; the editor UI is exported from here in
// WU-5 — and `storeReducers.ts` deep-imports `./model/slices/jobsSlice`
// precisely so this barrel (and the form/RHF code behind it) is
// instantiated only by the lazy `/admin/jobs` route (lesson
// resume-lazy-rhf-chunk).

export {
  addJob,
  applyJobToggle,
  applyJobUpdate,
  deleteJob,
  jobsReducer,
  makeJobRecord,
  resetToDefaults,
  toggleCurrent,
  updateJob,
} from './model/slices/jobsSlice';
export { createJobsSeed } from './model/services/seed';
export {
  selectAllJobs,
  selectCurrentJob,
  selectJobById,
  selectSortedJobs,
} from './model/selectors';
export { JOBS_STORAGE_KEY, persistJobs, readJobs, removeJobs } from './model/services/storage';
export type { JobsRootState } from './model/types';

// WU-5: the editor UI — consumed by the lazy /admin/jobs page only
// (resume-lazy-rhf-chunk: RHF must never reach the showcase bundle).
export { JobForm } from './ui/JobForm';
export { JobsList } from './ui/JobsList';
