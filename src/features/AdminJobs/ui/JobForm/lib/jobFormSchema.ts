// ============================================
// jobFormSchema — RHF adapter for the JobForm (WorkHistory CRUD §7)
// ============================================
//
// The §7 validation table as one zod schema; every message IS the i18n key
// (i18n-first — the component maps errors.*.message straight through t()).
// Cross-field rules (current ⇄ endDate, endDate ≥ startDate) live in
// `periodCrossRules`; the per-field slices are SHARED with the field-scoped
// FieldEditForm via ./fieldSchemas (job-field-edit D2 — single source of
// truth, this file only COMPOSES them). The output is DTO-ready:
// - startDate: string ('YYYY-MM-DD') → Date;
// - endDate: '' → null while current, a real Date otherwise (the reducer
//   re-syncs anyway, A6 — this keeps makeJobRecord/applyJobUpdate honest);
// - companyUrl: trimmed '' → undefined (optional on the DTO).
//
// period is NEVER a form field — the reducer recomputes it (A5/R-3).

import { z } from 'zod';

import {
  EMPLOYMENT_TYPES,
  JOB_LEVELS,
  type EmploymentType,
  type Job,
  type JobLevel,
} from '@/entities/Job';
import {
  companyUrlField,
  currentField,
  endDateField,
  locationField,
  periodCrossRules,
  positionField,
  startDateField,
  technologiesField,
  toDateInput,
} from './fieldSchemas';

const employmentTypeEnum = z.enum(EMPLOYMENT_TYPES as [EmploymentType, ...EmploymentType[]], {
  message: 'adminJobErrEnum',
});
const levelEnum = z.enum(JOB_LEVELS as [JobLevel, ...JobLevel[]], { message: 'adminJobErrEnum' });

export const jobFormSchema = z
  .object({
    company: z.string().trim().min(2, 'adminJobErrCompany').max(80, 'adminJobErrCompany'),
    position: positionField,
    startDate: startDateField,
    endDate: endDateField,
    current: currentField,
    description: z.object({
      en: z
        .array(z.string().max(200, 'adminJobErrDescription'))
        .min(1, 'adminJobErrDescription')
        .max(6, 'adminJobErrDescription'),
      ru: z
        .array(z.string().max(200, 'adminJobErrDescription'))
        .min(1, 'adminJobErrDescription')
        .max(6, 'adminJobErrDescription'),
    }),
    technologies: technologiesField,
    location: locationField,
    employmentType: employmentTypeEnum,
    level: levelEnum,
    companyUrl: companyUrlField,
    featured: z.boolean(),
  })
  .superRefine(periodCrossRules)
  .transform((values) => ({
    ...values,
    endDate: values.current ? null : new Date(values.endDate),
  }));

export type JobFormSchema = typeof jobFormSchema;
export type JobFormValues = z.input<JobFormSchema>;
/** `startDate`/`endDate`/`companyUrl` differ input↔output — resolver needs both. */
export type JobFormOutput = z.output<JobFormSchema>;

/** Fresh blank values (never share one mutable object across mounts). */
export const emptyJobFormValues = (): JobFormValues => ({
  company: '',
  position: { en: '', ru: '' },
  startDate: '',
  endDate: '',
  // Create defaults to a FINISHED position — endDate is then required
  // and the form opens with both date inputs enabled.
  current: false,
  description: { en: [''], ru: [''] },
  technologies: [],
  location: '',
  employmentType: 'full-time',
  level: 'middle',
  companyUrl: '',
  featured: false,
});

/** Record → form values (edit-mode defaults; '' for absent/optional fields). */
export const toJobFormValues = (job: Job): JobFormValues => ({
  company: job.company,
  position: { ...job.position },
  startDate: toDateInput(job.startDate),
  endDate: job.endDate ? toDateInput(job.endDate) : '',
  current: job.current,
  description: { en: [...job.description.en], ru: [...job.description.ru] },
  technologies: [...job.technologies],
  location: job.location,
  employmentType: job.employmentType,
  level: job.level,
  companyUrl: job.companyUrl ?? '',
  featured: job.featured,
});
