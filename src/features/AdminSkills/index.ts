// ============================================
// AdminSkills feature — Public API
// ============================================
//
// Consumed by the lazy /admin/skills page (WU-5) and by pages/Home's
// integration test (persistSkills/removeSkills). The showcase feature
// `features/Skills` must import ONLY entities/Skill: feature→feature
// imports are banned by FSD (R-4).
//
// Barrel hygiene (issue #301, gold standard admin-jobs-refactor WU-8 /
// admin-contact-refactor WU-3): this barrel only carries what `src/`
// actually imports THROUGH it — 17 dead re-exports were dropped
// (selectors selectSkillCategoryById/selectSkillsData — HomePage
// deep-imports model/selectors; storage normalizeIconSvg/readSkills/
// SKILLS_STORAGE_KEY — unit tests deep-import services/storage; the
// seven slice actions + skillsReducer — storeReducers.ts deep-imports
// the slice and the editor UI uses relative deep imports; the type
// re-exports AdminSkillsRootState and the three *Props interfaces have
// no barrel consumer). The implementations and their unit tests are
// untouched; `index.test.ts` pins both halves of that contract.

export { selectAllSkillsData } from './model/selectors/selectors';
export { persistSkills, removeSkills } from './model/services/storage';
// WU-5: the editor UI — consumed by the lazy /admin/skills page only
// (resume-lazy-rhf-chunk: RHF must never reach the showcase bundle).
export { SkillCategoryForm } from './ui/SkillCategoryForm/SkillCategoryForm';
export { SkillsEditorList } from './ui/SkillsEditorList/SkillsEditorList';
export { TechnologyForm } from './ui/TechnologyForm/TechnologyForm';
