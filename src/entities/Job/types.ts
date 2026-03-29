// ============================================
// Job Entity - TypeScript Types
// ============================================

/**
 * Job type (employment type)
 */
export type JobType = 
  | 'full-time'     // Full-time employment
  | 'part-time'     // Part-time employment
  | 'contract'      // Contract work
  | 'freelance'     // Freelance work
  | 'internship';   // Internship

/**
 * Job location type
 */
export type JobLocation = 
  | 'onsite'        // On-site work
  | 'remote'        // Remote work
  | 'hybrid';       // Hybrid work

/**
 * Job interface
 */
export interface Job {
  /**
   * Unique identifier
   */
  id: string;
  
  /**
   * Company name
   */
  company: string;
  
  /**
   * Job title/position
   */
  position: string;
  
  /**
   * Job description in multiple languages
   */
  description: {
    en: string;
    ru: string;
  };
  
  /**
   * Responsibilities in multiple languages
   */
  responsibilities: {
    en: string[];
    ru: string[];
  };
  
  /**
   * Achievements in multiple languages
   */
  achievements: {
    en: string[];
    ru: string[];
  };
  
  /**
   * Technologies used
   */
  technologies: string[];
  
  /**
   * Start date
   */
  startDate: Date;
  
  /**
   * End date (null for current position)
   */
  endDate: Date | null;
  
  /**
   * Job type
   */
  type: JobType;
  
  /**
   * Job location
   */
  location: JobLocation;
  
  /**
   * Company website
   */
  companyWebsite: string | null;
  
  /**
   * Company logo URL
   */
  companyLogo: string | null;
  
  /**
   * Whether job is featured
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
 * DTO for creating a job
 */
export interface CreateJobDto {
  company: string;
  position: string;
  description: {
    en: string;
    ru: string;
  };
  responsibilities: {
    en: string[];
    ru: string[];
  };
  achievements: {
    en: string[];
    ru: string[];
  };
  technologies: string[];
  startDate: Date;
  endDate?: Date | null;
  type: JobType;
  location: JobLocation;
  companyWebsite?: string;
  companyLogo?: string;
  featured?: boolean;
}

/**
 * DTO for updating a job
 */
export interface UpdateJobDto extends Partial<CreateJobDto> {
  id: string;
}

/**
 * Job filters
 */
export interface JobFilters {
  type?: JobType;
  location?: JobLocation;
  featured?: boolean;
  search?: string;
}

/**
 * API response for jobs
 */
export interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Jobs state for state management
 */
export interface JobsState {
  items: Job[];
  currentItem: Job | null;
  filters: JobFilters;
  loading: boolean;
  error: string | null;
}

/**
 * Job key type
 */
export type JobKey = keyof Job;

/**
 * Job form data
 */
export type JobFormData = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Job events
 */
export type JobEvent = 
  | { type: 'job.created'; payload: Job }
  | { type: 'job.updated'; payload: Job }
  | { type: 'job.deleted'; payload: string }
  | { type: 'job.filtered'; payload: JobFilters };

/**
 * Return type for useJobs hook
 */
export interface UseJobsReturn {
  jobs: Job[];
  filteredJobs: Job[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  getJob: (id: string) => Job | undefined;
  refetch: () => void;
}

/**
 * Jobs configuration
 */
export interface JobsConfig {
  itemsPerPage: number;
  defaultSort: JobKey;
  defaultSortOrder: 'asc' | 'desc';
  enableSearch: boolean;
  enableFilters: boolean;
}