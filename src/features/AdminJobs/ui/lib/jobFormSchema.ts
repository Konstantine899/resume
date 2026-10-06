// ============================================
// jobFormSchema — RHF adapter for the JobForm (WorkHistory CRUD §7)
// ============================================
//
// The §7 validation table as one zod schema; every message IS the i18n key
// (i18n-first — the component maps errors.*.message straight through t()).
// Cross-field rules (current ⇄ endDate, endDate ≥ startDate) live in one
// superRefine; the output is DTO-ready:
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

/** Day-precision bounds: `2022-02-30` style overflow still parses in JS — accepted. */
const isDateInput = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());

const isFuture = (value: string): boolean => {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return new Date(value).getTime() > endOfToday.getTime();
};

const employmentTypeEnum = z.enum(EMPLOYMENT_TYPES as [EmploymentType, ...EmploymentType[]], {
  message: 'adminJobErrEnum',
});
const levelEnum = z.enum(JOB_LEVELS as [JobLevel, ...JobLevel[]], { message: 'adminJobErrEnum' });

export const jobFormSchema = z
  .object({
    company: z.string().trim().min(2, 'adminJobErrCompany').max(80, 'adminJobErrCompany'),
    position: z.object({
      en: z.string().trim().min(3, 'adminJobErrPosition').max(100, 'adminJobErrPosition'),
      ru: z.string().trim().min(3, 'adminJobErrPosition').max(100, 'adminJobErrPosition'),
    }),
    startDate: z
      .string()
      .refine((value) => isDateInput(value) && !isFuture(value), {
        message: 'adminJobErrStartDate',
      })
      .transform((value) => new Date(value)),
    /** Cross-field rules in superRefine below — required ⇔ !current. */
    endDate: z.string(),
    current: z.boolean(),
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
    technologies: z
      .array(z.string())
      .max(15, 'adminJobErrTechnologies')
      .refine((values) => new Set(values).size === values.length, {
        message: 'adminJobErrTechnologies',
      }),
    location: z.string().trim().min(2, 'adminJobErrLocation').max(80, 'adminJobErrLocation'),
    employmentType: employmentTypeEnum,
    level: levelEnum,
    companyUrl: z
      .string()
      .trim()
      .refine(
        (value) => {
          if (value === '') return true;
          if (!value.startsWith('https://')) return false;
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'adminJobErrUrl' }
      )
      .transform((value) => (value === '' ? undefined : value)),
    featured: z.boolean(),
  })
  .superRefine((values, ctx) => {
    // current ⇒ endDate ignored entirely (A6: the reducer nulls it).
    if (values.current) return;
    const fail = () =>
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'adminJobErrEndDate' });
    if (values.endDate === '' || !isDateInput(values.endDate)) return fail();
    // Object-level checks run only after every child parsed, so
    // values.startDate is already a valid Date here (no lying compare).
    if (new Date(values.endDate).getTime() < values.startDate.getTime()) return fail();
  })
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

/** 'YYYY-MM-DD' in LOCAL time — toISOString would shift by the UTC offset. */
const toDateInput = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

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
