// ============================================
// Project Entity - TypeScript Types
// ============================================

/**
 * Project category types
 */
export type ProjectCategory =
  | 'ecommerce'
  | 'portfolio'
  | 'saas'
  | 'blockchain'
  | 'mobile'
  | 'dashboard'
  | 'api'
  | 'other';

/**
 * Project status types
 */
export type ProjectStatus =
  | 'completed'
  | 'in-progress'
  | 'maintenance'
  | 'archived';

/**
 * Technology icon interface
 */
export interface TechIcon {
  name: string;
  url: string;
  invertInDark?: boolean;
}

/**
 * Project interface
 */
export interface Project {
  id: string;
  title: string;
  description: {
    en: string;
    ru: string;
  };
  techIcons: TechIcon[];
  link: string | null;
  image: string;
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  createdAt: Date;
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
 * Project key type
 */
export type ProjectKey = keyof Project;
