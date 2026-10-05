// ============================================
// Project Entity - Public API
// ============================================

export type { Project, ProjectCategory, ProjectFilters, ProjectStatus } from './types';

// Constants
export { PROJECT_CATEGORIES, PROJECT_STATUSES, PROJECTS, TECH_ICONS } from './constants';

// Utils
export {
  applyProjectFilters,
  filterProjectsByCategory,
  filterProjectsByStatus,
  getAllProjects,
  getFeaturedProjects,
  resolveTechIcons,
  searchProjects,
} from './lib/utils';
