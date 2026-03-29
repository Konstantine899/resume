// ============================================
// Project Entity - Public API
// ============================================

export type { 
  Project, 
  ProjectCategory, 
  ProjectStatus, 
  TechIcon, 
  CreateProjectDto, 
  UpdateProjectDto, 
  ProjectFilters, 
  ProjectsResponse, 
  ProjectsState, 
  UseProjectsReturn, 
  ProjectsConfig 
} from './types';

export { 
  projects, 
  TECH_ICONS, 
  DEFAULT_PROJECT_VALUES, 
  PROJECTS_CONFIG, 
  getProjectById, 
  filterProjects, 
  sortProjects 
} from './constants';