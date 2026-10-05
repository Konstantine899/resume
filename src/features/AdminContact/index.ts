// ============================================
// AdminContact (Contact CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD, §8): only `pages` and this feature itself may import this
// API — `features → features` is banned, so `features/Contact` never
// touches it (the vitrina receives content as a prop from HomePage).
//
// WU-1 ships the model only; the editor form is exported from here in
// WU-3 — and `storeReducers.ts` deep-imports `./model/contactContentSlice`
// precisely so this barrel (and the form/RHF code behind it) is
// instantiated only by the lazy `/admin/contact` route (lesson
// resume-lazy-rhf-chunk).

export { ContactEditorForm } from './ui/ContactEditorForm';
export {
  contactContentReducer,
  resetToDefaults,
  updateContactContent,
} from './model/contactContentSlice';
export { createContactSeed } from './model/seed';
export { selectContactContent } from './model/selectors';
export {
  CONTACT_CONTENT_STORAGE_KEY,
  persistContactContent,
  readContactContent,
  removeContactContent,
} from './model/storage';
export type { ContactContentRootState } from './model/types';
