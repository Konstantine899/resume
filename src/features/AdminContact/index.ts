// ============================================
// AdminContact (Contact CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD, §8): only `pages` and this feature itself may import this
// API — `features → features` is banned, so `features/Contact` never
// touches it (the vitrina receives content as a prop from HomePage).
//
// WU-1 ships the model only; the editor form is exported from here in
// WU-3 — and `storeReducers.ts` deep-imports `./model/slices/contactContentSlice`
// precisely so this barrel (and the form/RHF code behind it) is
// instantiated only by the lazy `/admin/contact` route (lesson
// resume-lazy-rhf-chunk).

export { selectContactContent } from './model/selectors';
export { createContactSeed } from './model/services/seed';
export {
  CONTACT_CONTENT_STORAGE_KEY,
  persistContactContent,
  readContactContent,
  removeContactContent,
} from './model/services/storage';
export {
  contactContentReducer,
  resetToDefaults,
  updateContactContent,
} from './model/slices/contactContentSlice';
export type { ContactContentRootState } from './model/types/types';
export { ContactEditorForm } from './ui/ContactEditorForm/ContactEditorForm';
