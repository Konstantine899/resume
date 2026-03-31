import { JOBS } from '../constants';
import type { EmploymentType, Job, JobFilters, JobLevel } from '../types';

/**
 * Filter jobs by level
 */
export const filterJobsByLevel = (
  jobs: Job[],
  level: JobLevel
): Job[] => {
  return jobs.filter((job) => job.level === level);
};

/**
 * Filter jobs by employment type
 */
export const filterJobsByEmploymentType = (
  jobs: Job[],
  employmentType: EmploymentType
): Job[] => {
  return jobs.filter((job) => job.employmentType === employmentType);
};

/**
 * Get current job only
 */
export const getCurrentJob = (jobs: Job[]): Job | null => {
  return jobs.find((job) => job.current) || null;
};

/**
 * Get featured jobs
 */
export const getFeaturedJobs = (jobs: Job[]): Job[] => {
  return jobs.filter((job) => job.featured);
};

/**
 * Search jobs by company or position
 */
export const searchJobs = (
  jobs: Job[],
  query: string,
  language: 'en' | 'ru' = 'en'
): Job[] => {
  const lowerQuery = query.toLowerCase();
  return jobs.filter(
    (job) =>
      job.company.toLowerCase().includes(lowerQuery) ||
      job.position.toLowerCase().includes(lowerQuery) ||
      job.description[language].some((desc:any) => desc.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Apply multiple filters to jobs
 */
export const applyJobFilters = (
  jobs: Job[],
  filters: JobFilters
): Job[] => {
  let result = [...jobs];

  if (filters.level) {
    result = filterJobsByLevel(result, filters.level);
  }

  if (filters.employmentType) {
    result = filterJobsByEmploymentType(result, filters.employmentType);
  }

  if (filters.featured) {
    result = getFeaturedJobs(result);
  }

  if (filters.search) {
    result = searchJobs(result, filters.search);
  }

  return result;
};

/**
 * Get all jobs (default export for convenience)
 */
export const getAllJobs = (): Job[] => JOBS;

/**
 * Sort jobs by start date (newest first)
 */
export const sortJobsByDate = (jobs: Job[]): Job[] => {
  return [...jobs].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
};
