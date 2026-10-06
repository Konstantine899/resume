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
// WU-4 — and `storeReducers.ts` deep-imports `./model/slices/myWorkSlice`
// precisely so this barrel (and the form/RHF code behind it) is
// instantiated only by the lazy `/admin/mywork` route (lesson
// resume-lazy-rhf-chunk).

export { selectAllProjects, selectFeaturedProjects, selectProjectById } from './model/selectors';
export { createProjectsSeed } from './model/services/seed';
export {
  persistProjects,
  PROJECTS_STORAGE_KEY,
  readProjects,
  removeProjects,
} from './model/services/storage';
export {
  addProject,
  deleteProject,
  makeProjectRecord,
  makeUpdatePatch,
  myWorkReducer,
  resetToDefaults,
  updateProject,
} from './model/slices/myWorkSlice';
export type { MyWorkRootState, ProjectUpdatePatch } from './model/types/types';

// WU-4: the editor UI — consumed by the lazy /admin/mywork page only
// (resume-lazy-rhf-chunk: RHF must never reach the showcase bundle).
export { MyWorkEditorList } from './ui/MyWorkEditorList/MyWorkEditorList';
export type { MyWorkEditorListProps } from './ui/MyWorkEditorList/MyWorkEditorList';
export { ProjectForm } from './ui/ProjectForm/ProjectForm';
export type { ProjectFormProps } from './ui/ProjectForm/ProjectForm';
