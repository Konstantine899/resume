import { JOBS } from '../model/constants/constants';
import type { EmploymentType, Job, JobFilters, JobLevel } from '../model/types/types';

/**
 * Filter jobs by level
 */
export const filterJobsByLevel = (jobs: Job[], level: JobLevel): Job[] => {
  return jobs.filter((job) => job.level === level);
};

/**
 * Filter jobs by employment type
 */
export const filterJobsByEmploymentType = (jobs: Job[], employmentType: EmploymentType): Job[] => {
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
export const searchJobs = (jobs: Job[], query: string, language: 'en' | 'ru' = 'en'): Job[] => {
  const lowerQuery = query.toLowerCase();
  return jobs.filter(
    (job) =>
      job.company.toLowerCase().includes(lowerQuery) ||
      // Position is localized (en/ru) — match either language.
      job.position.en.toLowerCase().includes(lowerQuery) ||
      job.position.ru.toLowerCase().includes(lowerQuery) ||
      job.description[language].some((desc) => desc.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Apply multiple filters to jobs
 */
export const applyJobFilters = (jobs: Job[], filters: JobFilters): Job[] => {
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

/**
 * Display-string dup of the date range (plan_workhistory_crud A5/§6) —
 * `period` is NEVER entered by hand: the reducer recomputes it from these
 * three inputs on every date/flag change. Em-dash, exactly like the seed.
 *
 * A null endDate renders as an open range regardless of the `current` flag:
 * there is no honest end date to show, and the admin form forbids saving
 * `current: false` without one (§7) — no dates are ever invented.
 */
export const formatJobPeriod = (
  startDate: Date,
  endDate: Date | null,
  current: boolean
): string => {
  const startYear = startDate.getFullYear();
  if (current || endDate === null) {
    return `${startYear} — Present`;
  }
  return `${startYear} — ${endDate.getFullYear()}`;
};
