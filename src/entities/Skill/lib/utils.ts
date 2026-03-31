import { SKILLS } from '../constants';
import type { Skill, SkillCategory, SkillFilters, SkillLevel } from '../types';
import { SKILL_LEVEL_VALUES } from '../types';

/**
 * Get numeric value for skill level
 */
export const getSkillLevelValue = (level: SkillLevel): number => {
  return SKILL_LEVEL_VALUES[level];
};

/**
 * Filter skills by category
 */
export const filterSkillsByCategory = (
  skills: Skill[],
  category: SkillCategory
): Skill[] => {
  return skills.filter((skill) => skill.category === category);
};

/**
 * Filter skills by level
 */
export const filterSkillsByLevel = (
  skills: Skill[],
  level: SkillLevel
): Skill[] => {
  return skills.filter((skill) => skill.level === level);
};

/**
 * Get featured skills
 */
export const getFeaturedSkills = (skills: Skill[]): Skill[] => {
  return skills.filter((skill) => skill.featured);
};

/**
 * Search skills by name
 */
export const searchSkills = (
  skills: Skill[],
  query: string
): Skill[] => {
  const lowerQuery = query.toLowerCase();
  return skills.filter((skill) =>
    skill.name.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Sort skills by level (highest first)
 */
export const sortSkillsByLevel = (skills: Skill[]): Skill[] => {
  return [...skills].sort(
    (a, b) => getSkillLevelValue(b.level) - getSkillLevelValue(a.level)
  );
};

/**
 * Sort skills by years of experience (highest first)
 */
export const sortSkillsByExperience = (skills: Skill[]): Skill[] => {
  return [...skills].sort(
    (a, b) => b.yearsOfExperience - a.yearsOfExperience
  );
};

/**
 * Apply multiple filters to skills
 */
export const applySkillFilters = (
  skills: Skill[],
  filters: SkillFilters
): Skill[] => {
  let result = [...skills];

  if (filters.category) {
    result = filterSkillsByCategory(result, filters.category);
  }

  if (filters.level) {
    result = filterSkillsByLevel(result, filters.level);
  }

  if (filters.featured) {
    result = getFeaturedSkills(result);
  }

  if (filters.search) {
    result = searchSkills(result, filters.search);
  }

  return result;
};

/**
 * Get all skills (default export for convenience)
 */
export const getAllSkills = (): Skill[] => SKILLS;

/**
 * Get skills grouped by category
 */
export const getSkillsByCategory = (
  skills: Skill[]
): Record<SkillCategory, Skill[]> => {
  return skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<SkillCategory, Skill[]>
  );
};
