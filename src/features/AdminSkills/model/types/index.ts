// AdminSkills feature-local types (plan_skills_crud §5, §12).

import type { SkillCategoryData } from '@/entities/Skill';

/** Root-state shape for this slice — selectors are typed against it. */
export interface AdminSkillsRootState {
  adminSkills: SkillCategoryData[];
}
