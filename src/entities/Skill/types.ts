// ============================================
// Skill Entity - TypeScript Types
// ============================================

/**
 * Skill category types
 */
export type SkillCategory = 
  | 'technologies'  // Programming languages and frameworks
  | 'tools'         // Development tools and platforms
  | 'languages'     // Human languages
  | 'soft-skills'   // Soft skills and methodologies
  | 'other';        // Other skills

/**
 * Skill proficiency level
 */
export type SkillLevel = 
  | 'beginner'      // 1-2 years experience
  | 'intermediate'  // 2-4 years experience  
  | 'advanced'      // 4-6 years experience
  | 'expert';       // 6+ years experience

/**
 * Skill interface
 */
export interface Skill {
  /**
   * Unique identifier
   */
  id: string;
  
  /**
   * Skill name
   */
  name: string;
  
  /**
   * Skill description in multiple languages
   */
  description: {
    en: string;
    ru: string;
  };
  
  /**
   * Skill category
   */
  category: SkillCategory;
  
  /**
   * Skill proficiency level
   */
  level: SkillLevel;
  
  /**
   * Years of experience
   */
  yearsOfExperience: number;
  
  /**
   * Skill icon URL
   */
  icon: string | null;
  
  /**
   * Whether skill is featured
   */
  featured: boolean;
  
  /**
   * Last used date
   */
  lastUsed: Date;
  
  /**
   * Projects where skill was used
   */
  projectsUsedIn: string[];
  
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
 * DTO for creating a skill
 */
export interface CreateSkillDto {
  name: string;
  description: {
    en: string;
    ru: string;
  };
  category: SkillCategory;
  level: SkillLevel;
  yearsOfExperience: number;
  icon?: string;
  featured?: boolean;
  lastUsed: Date;
  projectsUsedIn?: string[];
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
 * API response for skills
 */
export interface SkillsResponse {
  data: Skill[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Skills state for state management
 */
export interface SkillsState {
  items: Skill[];
  currentItem: Skill | null;
  filters: SkillFilters;
  loading: boolean;
  error: string | null;
}

/**
 * Skill key type
 */
export type SkillKey = keyof Skill;

/**
 * Skill form data
 */
export type SkillFormData = Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Skill events
 */
export type SkillEvent = 
  | { type: 'skill.created'; payload: Skill }
  | { type: 'skill.updated'; payload: Skill }
  | { type: 'skill.deleted'; payload: string }
  | { type: 'skill.filtered'; payload: SkillFilters };

/**
 * Return type for useSkills hook
 */
export interface UseSkillsReturn {
  skills: Skill[];
  filteredSkills: Skill[];
  loading: boolean;
  error: string | null;
  filters: SkillFilters;
  setFilters: (filters: SkillFilters) => void;
  getSkill: (id: string) => Skill | undefined;
  refetch: () => void;
}

/**
 * Skills configuration
 */
export interface SkillsConfig {
  itemsPerPage: number;
  defaultSort: SkillKey;
  defaultSortOrder: 'asc' | 'desc';
  enableSearch: boolean;
  enableFilters: boolean;
}

/**
 * Skill category with skills
 */
export interface SkillCategoryWithSkills {
  title: string;
  skills: string[];
}

/**
 * Skills grouped by category
 */
export type SkillsByCategory = Record<SkillCategory, Skill[]>;