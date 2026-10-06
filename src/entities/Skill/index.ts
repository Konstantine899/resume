// ============================================
// Skill Entity — Public API
// ============================================
//
// Contract home for the Skills section (plan_skills_crud §1): both
// consumers — the showcase feature (`features/Skills`) and the admin
// feature (`features/AdminSkills`) — import THIS barrel; feature→feature
// imports are banned by FSD even through a public API (R-4).

export type { SkillCategory, SkillCategoryData, Technology } from './model/types';
export { SKILLS_DATA } from './model/constants';
export {
  SkillCategoryDataSchema,
  SkillsEnvelopeSchema,
  SKILL_CATEGORY_VALUES,
  TechnologySchema,
} from './model/services/schema';
export type { SkillsEnvelope } from './model/services/schema';
export { resolveIconSvg } from './lib/resolveIconSvg';
export { SKILL_ICON_KEYS } from './lib/skillIcons';
