// ============================================
// AdminSkills feature — Public API
// ============================================
//
// Consumed by the lazy /admin/skills page (WU-5) and by pages/Home
// (selectSkillsData, WU-4 — pages→features is legal). The showcase
// feature `features/Skills` must import ONLY entities/Skill: feature→
// feature imports are banned by FSD (R-4).

export {
  addSkillCategory,
  addTechnology,
  deleteSkillCategory,
  deleteTechnology,
  resetToDefaults,
  skillsReducer,
  updateSkillCategory,
  updateTechnology,
} from './model/slices/skillsSlice';
export {
  selectAllSkillsData,
  selectSkillCategoryById,
  selectSkillsData,
} from './model/selectors/selectors';
export {
  SKILLS_STORAGE_KEY,
  normalizeIconSvg,
  persistSkills,
  readSkills,
  removeSkills,
} from './model/services/storage';
export type { AdminSkillsRootState } from './model/types';

// WU-5: the editor UI — consumed by the lazy /admin/skills page only
// (resume-lazy-rhf-chunk: RHF must never reach the showcase bundle).
export { SkillCategoryForm } from './ui/SkillCategoryForm';
export type { SkillCategoryFormProps } from './ui/SkillCategoryForm';
export { SkillsEditorList } from './ui/SkillsEditorList';
export type { SkillsEditorListProps } from './ui/SkillsEditorList';
export { TechnologyForm } from './ui/TechnologyForm';
export type { TechnologyFormProps } from './ui/TechnologyForm';
