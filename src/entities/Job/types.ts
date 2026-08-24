// ============================================
// Job Entity - TypeScript Types
// ============================================

export interface JobItem {
  title: string;
  company: string;
  period: string;
  description: string;
  technologies?: string[];
}

/**
 * Job employment type
 */
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';

/**
 * Job level types
 */
export type JobLevel = 'junior' | 'middle' | 'senior' | 'lead' | 'principal' | 'architect';

/**
 * Job interface
 */
export interface Job {
  id: string;
  company: string;
  position: string;
  period: string;
  startDate: Date;
  endDate: Date | null;
  description: {
    en: string[];
    ru: string[];
  };
  technologies: string[];
  location: string;
  current: boolean;
  employmentType: EmploymentType;
  level: JobLevel;
  companyUrl?: string;
  featured: boolean;
}

/**
 * DTO for creating a job
 */
export interface CreateJobDto {
  company: string;
  position: string;
  period: string;
  startDate: Date;
  endDate?: Date | null;
  description: {
    en: string[];
    ru: string[];
  };
  technologies: string[];
  location: string;
  employmentType: EmploymentType;
  level: JobLevel;
  companyUrl?: string;
  featured?: boolean;
}

/**
 * DTO for updating a job
 */
export interface UpdateJobDto extends Partial<CreateJobDto> {
  id: string;
  current?: boolean;
}

/**
 * Job filters
 */
export interface JobFilters {
  level?: JobLevel;
  employmentType?: EmploymentType;
  featured?: boolean;
  search?: string;
}

/**
 * Job key type
 */
export type JobKey = keyof Job;
