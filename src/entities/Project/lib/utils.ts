import { PROJECTS } from '../constants';
import type { Project, ProjectCategory, ProjectFilters, ProjectStatus } from '../types';

/**
 * Filter projects by category
 */
export const filterProjectsByCategory = (
  projects: Project[],
  category: ProjectCategory
): Project[] => {
  return projects.filter((project) => project.category === category);
};

/**
 * Filter projects by status
 */
export const filterProjectsByStatus = (
  projects: Project[],
  status: ProjectStatus
): Project[] => {
  return projects.filter((project) => project.status === status);
};

/**
 * Get featured projects
 */
export const getFeaturedProjects = (projects: Project[]): Project[] => {
  return projects.filter((project) => project.featured);
};

/**
 * Search projects by title or description
 */
export const searchProjects = (
  projects: Project[],
  query: string,
  language: 'en' | 'ru' = 'en'
): Project[] => {
  const lowerQuery = query.toLowerCase();
  return projects.filter(
    (project) =>
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description[language].toLowerCase().includes(lowerQuery)
  );
};

/**
 * Apply multiple filters to projects
 */
export const applyProjectFilters = (
  projects: Project[],
  filters: ProjectFilters
): Project[] => {
  let result = [...projects];

  if (filters.category) {
    result = filterProjectsByCategory(result, filters.category);
  }

  if (filters.status) {
    result = filterProjectsByStatus(result, filters.status);
  }

  if (filters.featured) {
    result = getFeaturedProjects(result);
  }

  if (filters.search) {
    result = searchProjects(result, filters.search);
  }

  return result;
};

/**
 * Get all projects (default export for convenience)
 */
export const getAllProjects = (): Project[] => PROJECTS;
