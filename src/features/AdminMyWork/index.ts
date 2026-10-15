// ============================================
// AdminMyWork (Projects CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD, §8): only `pages` and this feature itself may import this
// API — `features → features` is banned, so `features/MyWork` (the
// vitrina) never touches it; the vitrina receives content as a prop from
// HomePage (Design C).
//
// admin-mywork-refactor WU-6 (SPEC R-7): the barrel keeps ONLY symbols
// with a production consumer — `AdminMyWorkPage` (list, form, selector)
// — plus `removeProjects`/`myWorkReducer`. `removeProjects` stays
// because `fsd-imports/tests-public-api-only` forces HomePage.test to
// consume it through the barrel (a cross-slice deep import from a test
// is an ESLint error; AdminJobs has the same shape). The slice itself
// is deep-imported by `storeReducers.ts` (resume-lazy-rhf-chunk: this
// barrel — and the form/RHF code behind it — is instantiated only by
// the lazy /admin/mywork route).
//
// `src/features/AdminMyWork/index.test.ts` pins the live set.

export { selectAllProjects } from './model/selectors';
export { removeProjects } from './model/services/storage';
export { myWorkReducer } from './model/slices/myWorkSlice';
export type { MyWorkRootState, ProjectUpdatePatch } from './model/types/types';

// The editor UI — consumed by the lazy /admin/mywork page only
// (resume-lazy-rhf-chunk: RHF must never reach the showcase bundle).
export { FieldEditForm } from './ui/FieldEditForm/FieldEditForm';
export { MyWorkEditorList } from './ui/MyWorkEditorList/MyWorkEditorList';
export { ProjectForm } from './ui/ProjectForm/ProjectForm';
// Type-only — the page keys its modal state on the row key union
// (rev.3 field edit); erased at compile time, no runtime cost.
export type { EditProjectField } from './ui/ProjectForm/lib/fieldSchemas';
