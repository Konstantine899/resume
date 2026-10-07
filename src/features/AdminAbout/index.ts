// ============================================
// AdminAbout (About CRUD admin side) — Public API
// ============================================
//
// NOTE (FSD, §8): only `pages` and this feature itself may import this
// API — `features → features` is banned, so `features/About` never
// touches it (the vitrina receives content as a prop from HomePage).

export { selectAboutContent } from './model/selectors';
export { createAboutSeed } from './model/services/seed';
export {
  ABOUT_CONTENT_STORAGE_KEY,
  persistAboutContent,
  readAboutContent,
  removeAboutContent,
} from './model/services/storage';
export {
  aboutContentReducer,
  resetToDefaults,
  updateAboutContent,
} from './model/slices/aboutContentSlice';
export type { AboutContentRootState } from './model/types/types';
export { AboutEditorForm } from './ui/AboutEditorForm/AboutEditorForm';
export type { AboutEditorFormProps } from './ui/AboutEditorForm/AboutEditorForm';
