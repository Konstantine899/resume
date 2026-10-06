// ============================================
// Job Entity - Public API
// ============================================

// Types
export type {
  CreateJobDto,
  EmploymentType,
  Job,
  JobFilters,
  JobItem,
  JobKey,
  JobLevel,
  UpdateJobDto,
} from './types';

// Constants
export { EMPLOYMENT_TYPES, JOB_LEVELS, JOBS } from './constants';

// Utils
export {
  applyJobFilters,
  filterJobsByEmploymentType,
  filterJobsByLevel,
  formatJobPeriod,
  getAllJobs,
  getCurrentJob,
  getFeaturedJobs,
  searchJobs,
  sortJobsByDate,
} from './lib/utils';

// Zod schemas (store read/envelope — plan_workhistory_crud §6)
export { JobSchema, JobsEnvelopeSchema } from './schema';
export type { JobRecord, JobsEnvelope } from './schema';
