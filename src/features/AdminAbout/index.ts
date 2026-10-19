// ============================================
// AdminAbout (About CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD, §8): only `pages` and this feature itself may import this
// API — `features → features` is banned, so `features/About` never
// touches it (the vitrina receives content as a prop from HomePage).
//
// admin-about-refactor WU-3 (SPEC R-4): the barrel keeps ONLY symbols
// with a production consumer at the BARREL level:
// - `AboutEditorList` — `AdminAboutPage` (the lazy /admin/about route);
// - `createAboutSeed` / `persistAboutContent` / `removeAboutContent` —
//   `HomePage.test` (`fsd-imports/tests-public-api-only` forces a test to
//   consume a cross-slice symbol through the barrel, so these stay).
// Seven dead re-exports are gone (selectAboutContent, ABOUT_CONTENT_
// STORAGE_KEY, readAboutContent, aboutContentReducer, resetToDefaults,
// updateAboutContent, AboutContentRootState) — their IMPLEMENTATIONS stay
// put: `storeReducers.ts` deep-imports the slice and `HomePage.tsx`
// deep-imports the selector (resume-lazy-rhf-chunk: instantiating this
// barrel — and the RHF form behind it — in the main chunk is forbidden),
// while the model's own unit tests import the modules directly.
//
// `src/features/AdminAbout/index.test.ts` pins the live set.

export { createAboutSeed } from './model/services/seed';
export { persistAboutContent, removeAboutContent } from './model/services/storage';
export { AboutEditorList } from './ui/AboutEditorList/AboutEditorList';
export type { AboutEditorListProps } from './ui/AboutEditorList/AboutEditorList';
