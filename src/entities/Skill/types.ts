// ============================================
// Skill Entity - TypeScript Types
// ============================================

export interface SkillItem {
  name: string;
  icon: string;
  iconAlt?: string;
}

/**
 * Skill category types
 */
export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'tools'
  | 'soft-skills';

/**
 * Skill proficiency levels
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Skill interface
 */
export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  category: SkillCategory;
  yearsOfExperience: number;
  lastUsed: string;
  iconUrl?: string;
  featured: boolean;
  projectIds?: string[];
}

/**
 * DTO for creating a skill
 */
export interface CreateSkillDto {
  name: string;
  level: SkillLevel;
  category: SkillCategory;
  yearsOfExperience: number;
  lastUsed: string;
  iconUrl?: string;
  featured?: boolean;
  projectIds?: string[];
}

/**
 * DTO for updating a skill
 */
export interface UpdateSkillDto extends Partial<CreateSkillDto> {
  id: string;
}

/**
 * Skill filters
 */
export interface SkillFilters {
  category?: SkillCategory;
  level?: SkillLevel;
  featured?: boolean;
  search?: string;
}

/**
 * Skill level numeric mapping
 */
export const SKILL_LEVEL_VALUES = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
} as const;

/**
 * Skill key type
 */
export type SkillKey = keyof Skill;
