// ============================================
// Skill Entity - Public API
// ============================================

// Types
export type {
  CreateSkillDto,
  Skill,
  SkillCategory,
  SkillFilters,
  SkillKey,
  SkillLevel,
  UpdateSkillDto,
} from './types';

// Constants & Mappings
export { SKILL_CATEGORIES, SKILL_LEVELS, SKILLS } from './constants';

export { SKILL_LEVEL_VALUES } from './types';

// Utils
export {
  applySkillFilters,
  filterSkillsByCategory,
  filterSkillsByLevel,
  getAllSkills,
  getFeaturedSkills,
  getSkillLevelValue,
  getSkillsByCategory,
  searchSkills,
  sortSkillsByExperience,
  sortSkillsByLevel,
} from './lib/utils';
