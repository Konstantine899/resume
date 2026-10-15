// skills selectors (plan_skills_crud §12 WU-1).

import type { SkillCategoryData } from '@/entities/Skill';
import type { AdminSkillsRootState } from '../types/types';

/** Admin read path: EVERY category, empty ones included. */
export const selectAllSkillsData = (state: AdminSkillsRootState): SkillCategoryData[] =>
  state.adminSkills;

/**
 * Vitrina read path (A1/R-10): categories that still have technologies —
 * an empty category renders as a heading with no items, so the showcase
 * hides it while the admin list keeps it visible.
 */
export const selectSkillsData = (state: AdminSkillsRootState): SkillCategoryData[] =>
  selectAllSkillsData(state).filter((category) => category.technologies.length > 0);

export const selectSkillCategoryById = (
  state: AdminSkillsRootState,
  category: string
): SkillCategoryData | undefined =>
  selectAllSkillsData(state).find((entry) => entry.category === category);
