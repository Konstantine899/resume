// ============================================
// Project Entity - Public API
// ============================================

export type { Project, ProjectCategory, ProjectFilters, ProjectStatus } from './model/types/types';

// Constants
export { PROJECT_CATEGORIES, PROJECT_STATUSES, PROJECTS } from './model/constants/constants';

// Zod schemas (storage envelope + admin form resolver)
export {
  ProjectFormDataSchema,
  ProjectSchema,
  ProjectsEnvelopeSchema,
} from './model/schemes/schema';
export type { ProjectFormData, ProjectsEnvelope } from './model/schemes/schema';

// Utils
export {
  applyProjectFilters,
  filterProjectsByCategory,
  filterProjectsByStatus,
  getAllProjects,
  getFeaturedProjects,
  searchProjects,
} from './lib/utils';
