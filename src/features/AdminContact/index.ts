// ============================================
// AdminContact (Contact CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD, §8): only `pages` and this feature itself may import this
// API — `features → features` is banned, so `features/Contact` never
// touches it (the vitrina receives content as a prop from HomePage).
//
// admin-contact-refactor WU-3 (SPEC R-3): the barrel keeps ONLY symbols
// with a production consumer at the BARREL level:
// - `ContactEditorForm` — `AdminContactPage` (the lazy /admin/contact route);
// - `createContactSeed` / `persistContactContent` / `removeContactContent` —
//   `HomePage.test` (`fsd-imports/tests-public-api-only` forces a test to
//   consume a cross-slice symbol through the barrel, so these stay —
//   AdminAbout/AdminMyWork index.ts carry the identical trio).
// Seven dead re-exports are gone (selectContactContent,
// CONTACT_CONTENT_STORAGE_KEY, readContactContent, contactContentReducer,
// resetToDefaults, updateContactContent, ContactContentRootState) — their
// IMPLEMENTATIONS stay put: `storeReducers.ts` deep-imports the slice and
// `HomePage.tsx` deep-imports the selector (resume-lazy-rhf-chunk:
// instantiating this barrel — and the RHF form behind it — in the main
// chunk is forbidden), while the model's own unit tests import the modules
// directly.
//
// `src/features/AdminContact/index.test.ts` pins the live set.

export { createContactSeed } from './model/services/seed';
export { persistContactContent, removeContactContent } from './model/services/storage';
export { ContactEditorForm } from './ui/ContactEditorForm/ContactEditorForm';
export type { ContactEditorFormProps } from './ui/ContactEditorForm/ContactEditorForm';
