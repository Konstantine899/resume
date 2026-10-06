// ============================================
// AdminSkills feature — Public API
// ============================================
//
// Consumed by the lazy /admin/skills page (WU-5) and by pages/Home
// (selectSkillsData, WU-4 — pages→features is legal). The showcase
// feature `features/Skills` must import ONLY entities/Skill: feature→
// feature imports are banned by FSD (R-4).

export {
  selectAllSkillsData,
  selectSkillCategoryById,
  selectSkillsData,
} from './model/selectors/selectors';
export {
  normalizeIconSvg,
  persistSkills,
  readSkills,
  removeSkills,
  SKILLS_STORAGE_KEY,
} from './model/services/storage';
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
export type { AdminSkillsRootState } from './model/types/types';

// WU-5: the editor UI — consumed by the lazy /admin/skills page only
// (resume-lazy-rhf-chunk: RHF must never reach the showcase bundle).
export { SkillCategoryForm } from './ui/SkillCategoryForm/SkillCategoryForm';
export type { SkillCategoryFormProps } from './ui/SkillCategoryForm/SkillCategoryForm';
export { SkillsEditorList } from './ui/SkillsEditorList/SkillsEditorList';
export type { SkillsEditorListProps } from './ui/SkillsEditorList/SkillsEditorList';
export { TechnologyForm } from './ui/TechnologyForm/TechnologyForm';
export type { TechnologyFormProps } from './ui/TechnologyForm/TechnologyForm';
