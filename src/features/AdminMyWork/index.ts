// ============================================
// AdminMyWork (Projects CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD, §8): only `pages` and this feature itself may import this
// API — `features → features` is banned, so `features/MyWork` (the
// vitrina) never touches it; the vitrina receives content as a prop from
// HomePage (Design C).
//
// WU-2 ships the model only; the editor UI is exported from here in
// WU-4 — and `storeReducers.ts` deep-imports `./model/myWorkSlice`
// precisely so this barrel (and the form/RHF code behind it) is
// instantiated only by the lazy `/admin/mywork` route (lesson
// resume-lazy-rhf-chunk).

export {
  addProject,
  deleteProject,
  makeProjectRecord,
  makeUpdatePatch,
  myWorkReducer,
  resetToDefaults,
  updateProject,
} from './model/myWorkSlice';
export { createProjectsSeed } from './model/seed';
export { selectAllProjects, selectFeaturedProjects, selectProjectById } from './model/selectors';
export {
  PROJECTS_STORAGE_KEY,
  persistProjects,
  readProjects,
  removeProjects,
} from './model/storage';
export type { MyWorkRootState, ProjectUpdatePatch } from './model/types';
