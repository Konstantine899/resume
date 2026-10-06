// ============================================
// Job zod schemas (plan_workhistory_crud §6/§7)
// ============================================
//
// Two schemas, one source of truth:
// - `JobSchema` — the full record: normalizes what is read from
//   localStorage and validates what is persisted. Dates arrive as ISO
//   strings after JSON and are revived by `z.coerce.date()` (A11 — the
//   entity contract types them as Date and `sortJobsByDate` calls
//   `.getTime()`, so a string would NaN-sort the vitrina).
// - `JobsEnvelopeSchema` — reads/writes the envelope `{ v: 1, data }` under
//   `resume.jobs`; `v` is a migration guard, unknown versions fall back to
//   the seed (§7).
//
// The admin FORM schema (zodResolver + i18n error keys, §7 table) lands in
// WU-6 derived from this shape — messages are NOT set here (i18n-first).
//
// NOTE: schema.ts was planned for WU-6, but WU-2's storage already needs
// EnvelopeSchema.safeParse (WU-2 bullet) — pulled forward, noted in PR #175.

import { z } from 'zod';

import { EMPLOYMENT_TYPES, JOB_LEVELS } from './constants';
import type { EmploymentType, Job, JobLevel } from './types';

/** Runtime enums from the SAME constants the admin selects render (A9). */
const employmentTypeEnum = z.enum(EMPLOYMENT_TYPES as [EmploymentType, ...EmploymentType[]]);
const levelEnum = z.enum(JOB_LEVELS as [JobLevel, ...JobLevel[]]);

export const JobSchema = z.object({
  id: z.string().min(1),
  company: z.string().trim().min(2).max(80),
  position: z.object({
    en: z.string().trim().min(3).max(100),
    ru: z.string().trim().min(3).max(100),
  }),
  /** Display dup of the dates (A5) — recomputed by the reducer, never manual. */
  period: z.string().min(1),
  startDate: z.coerce.date(),
  /** `null` ⇔ open-ended (typically `current: true`); ZodNullable short-circuits null. */
  endDate: z.coerce.date().nullable(),
  description: z.object({
    en: z.array(z.string()).min(1).max(6),
    ru: z.array(z.string()).min(1).max(6),
  }),
  technologies: z.array(z.string()).max(15),
  location: z.string().trim().min(2).max(80),
  current: z.boolean(),
  employmentType: employmentTypeEnum,
  level: levelEnum,
  /** Absolute URL — the form additionally enforces https:// (§7). */
  companyUrl: z.url().optional(),
  featured: z.boolean(),
});

/** The exact envelope persisted under `resume.jobs` (§5). */
export const JobsEnvelopeSchema = z.object({
  v: z.literal(1),
  data: z.array(JobSchema),
});

export type JobRecord = z.infer<typeof JobSchema>;
export type JobsEnvelope = z.infer<typeof JobsEnvelopeSchema>;

// Compile-time guard: the schema's inferred output must stay assignable
// to the FSD contract — a schema drift breaks the build, not the runtime.
const _contractCheck: Job = {} as JobRecord;
void _contractCheck;
