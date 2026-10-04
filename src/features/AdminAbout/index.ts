// ============================================
// AdminAbout (About CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD, §8): only `pages` and this feature itself may import this
// API — `features → features` is banned, so `features/About` never
// touches it (the vitrina receives content as a prop from HomePage).

export {
  aboutContentReducer,
  resetToDefaults,
  updateAboutContent,
} from './model/aboutContentSlice';
export { createAboutSeed } from './model/seed';
export { selectAboutContent } from './model/selectors';
export {
  ABOUT_CONTENT_STORAGE_KEY,
  persistAboutContent,
  readAboutContent,
  removeAboutContent,
} from './model/storage';
export type { AboutContentRootState } from './model/types';
