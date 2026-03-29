// ============================================
// Project Entity - TypeScript Types
// ============================================

/**
 * Project category types
 */
export type ProjectCategory = 
  | 'ecommerce'     // E-commerce projects
  | 'portfolio'     // Portfolio websites
  | 'saas'          // Software as a Service
  | 'blockchain'    // Blockchain projects
  | 'mobile'        // Mobile applications
  | 'dashboard'     // Admin dashboards
  | 'api'           // API development
  | 'other';        // Other projects

/**
 * Project status types
 */
export type ProjectStatus = 
  | 'completed'     // Project is completed
  | 'in-progress'   // Project is in development
  | 'maintenance'   // Project is in maintenance
  | 'archived';     // Project is archived

/**
 * Technology icon interface
 */
export interface TechIcon {
  /**
   * Technology name
   */
  name: string;
  
  /**
   * Icon URL
   */
  url: string;
  
  /**
   * Whether to invert colors in dark mode
   */
  invertInDark?: boolean;
}

/**
 * Project interface
 */
export interface Project {
  /**
   * Unique identifier
   */
  id: string;
  
  /**
   * Project title
   */
  title: string;
  
  /**
   * Project description in multiple languages
   */
  description: {
    en: string;
    ru: string;
  };
  
  /**
   * Technology icons used in the project
   */
  techIcons: TechIcon[];
  
  /**
   * Project URL
   */
  link: string | null;
  
  /**
   * Project image URL
   */
  image: string;
  
  /**
   * Project category
   */
  category: ProjectCategory;
  
  /**
   * Project status
   */
  status: ProjectStatus;
  
  /**
   * Whether project is featured
   */
  featured: boolean;
  
  /**
   * Creation date
   */
  createdAt: Date;
  
  /**
   * Last update date
   */
  updatedAt: Date;
}

/**
 * DTO for creating a project
 */
export interface CreateProjectDto {
  title: string;
  description: {
    en: string;
    ru: string;
  };
  techIcons: Omit<TechIcon, 'name'>[];
  link?: string;
  image: string;
  category: ProjectCategory;
  featured?: boolean;
}

/**
 * DTO for updating a project
 */
export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  id: string;
  status?: ProjectStatus;
}

/**
 * Project filters
 */
export interface ProjectFilters {
  category?: ProjectCategory;
  status?: ProjectStatus;
  featured?: boolean;
  search?: string;
}

/**
 * API response for projects
 */
export interface ProjectsResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Projects state for state management
 */
export interface ProjectsState {
  items: Project[];
  currentItem: Project | null;
  filters: ProjectFilters;
  loading: boolean;
  error: string | null;
}

/**
 * Project key type
 */
export type ProjectKey = keyof Project;

/**
 * Project form data
 */
export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Project events
 */
export type ProjectEvent = 
  | { type: 'project.created'; payload: Project }
  | { type: 'project.updated'; payload: Project }
  | { type: 'project.deleted'; payload: string }
  | { type: 'project.filtered'; payload: ProjectFilters };

/**
 * Return type for useProjects hook
 */
export interface UseProjectsReturn {
  projects: Project[];
  filteredProjects: Project[];
  loading: boolean;
  error: string | null;
  filters: ProjectFilters;
  setFilters: (filters: ProjectFilters) => void;
  getProject: (id: string) => Project | undefined;
  refetch: () => void;
}

/**
 * Projects configuration
 */
export interface ProjectsConfig {
  itemsPerPage: number;
  defaultSort: ProjectKey;
  defaultSortOrder: 'asc' | 'desc';
  enableSearch: boolean;
  enableFilters: boolean;
}