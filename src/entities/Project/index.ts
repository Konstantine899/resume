// ============================================
// Project Entity - Public API
// ============================================

export type { Project, ProjectCategory, ProjectFilters, ProjectStatus } from './model/types';

// Constants
export { PROJECT_CATEGORIES, PROJECT_STATUSES, PROJECTS } from './model/constants';

// Utils
export {
  applyProjectFilters,
  filterProjectsByCategory,
  filterProjectsByStatus,
  getAllProjects,
  getFeaturedProjects,
  searchProjects,
} from './lib/utils';
