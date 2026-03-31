// ============================================
// Project Entity - Public API
// ============================================

// Types
export type {
  CreateProjectDto, Project,
  ProjectCategory, ProjectFilters,
  ProjectKey, ProjectStatus,
  TechIcon, UpdateProjectDto
} from './types';

// Constants
export {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES, PROJECTS
} from './constants';

// Utils
export {
  applyProjectFilters, filterProjectsByCategory,
  filterProjectsByStatus, getAllProjects, getFeaturedProjects,
  searchProjects
} from './lib/utils';

