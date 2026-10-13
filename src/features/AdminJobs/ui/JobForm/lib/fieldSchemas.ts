// ============================================
// fieldSchemas — shared per-field zod slices (job-field-edit WU-1)
// ============================================
//
// SINGLE source of truth for the per-field validation rules used by BOTH
// the full JobForm (jobFormSchema composes from these) and the field-scoped
// FieldEditForm (one field at a time). No second copy of min/max/messages
// may live anywhere else (SPEC R-1 r4 — the anti-drift condition D2).
//
// Message keys stay i18n-first (every message IS the key — parity with
// jobFormSchema). Cross-field period rules (current ⇄ endDate,
// endDate ≥ startDate) live in `periodCrossRules`, shared by the full
// form's superRefine and the period field-modal schema.

import { z } from 'zod';

/** Day-precision bounds: `2022-02-30` style overflow still parses in JS — accepted. */
const isDateInput = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());

const isFuture = (value: string): boolean => {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return new Date(value).getTime() > endOfToday.getTime();
};

/** Local-time 'YYYY-MM-DD' — toISOString would shift by the UTC offset. */
export const toDateInput = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

// ---- scalar slices (exactly the jobFormSchema rules, moved verbatim) ----

export const positionField = z.object({
  en: z.string().trim().min(3, 'adminJobErrPosition').max(100, 'adminJobErrPosition'),
  ru: z.string().trim().min(3, 'adminJobErrPosition').max(100, 'adminJobErrPosition'),
});

export const startDateField = z
  .string()
  .refine((value) => isDateInput(value) && !isFuture(value), {
    message: 'adminJobErrStartDate',
  })
  .transform((value) => new Date(value));

/** Cross-field rules live in `periodCrossRules` below — required ⇔ !current. */
export const endDateField = z.string();

export const currentField = z.boolean();

export const locationField = z
  .string()
  .trim()
  .min(2, 'adminJobErrLocation')
  .max(80, 'adminJobErrLocation');

export const companyUrlField = z
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
  .transform((value) => (value === '' ? undefined : value));

export const technologiesField = z
  .array(z.string())
  .max(15, 'adminJobErrTechnologies')
  .refine((values) => new Set(values).size === values.length, {
    message: 'adminJobErrTechnologies',
  });

/**
 * current ⇄ endDate + endDate ≥ startDate. Runs as a superRefine AFTER the
 * children parsed — `values.startDate` is already a Date here (no lying
 * compare). Shared verbatim by jobFormSchema and periodFieldSchema.
 */
export const periodCrossRules = (
  values: { startDate: Date; endDate: string; current: boolean },
  ctx: z.RefinementCtx
): void => {
  // current ⇒ endDate ignored entirely (A6: the reducer nulls it).
  if (values.current) return;
  const fail = () =>
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'adminJobErrEndDate' });
  if (values.endDate === '' || !isDateInput(values.endDate)) return fail();
  if (new Date(values.endDate).getTime() < values.startDate.getTime()) return fail();
};

// ---- field-modal schemas (one field at a time) ----

/** Editable field keys (SPEC R-2 r4) — bullets are NOT in this union. */
export type EditField = 'position' | 'period' | 'location' | 'companyUrl' | 'technologies';

/** Period slice: the same rules as in the full form, DTO-ready output. */
export const periodFieldSchema = z
  .object({
    startDate: startDateField,
    endDate: endDateField,
    current: currentField,
  })
  .superRefine(periodCrossRules)
  .transform((values) => ({
    ...values,
    endDate: values.current ? null : new Date(values.endDate),
  }));

export const positionFieldSchema = z.object({ position: positionField });
export const locationFieldSchema = z.object({ location: locationField });
export const companyUrlFieldSchema = z.object({ companyUrl: companyUrlField });
export const technologiesFieldSchema = z.object({ technologies: technologiesField });

export const fieldEditSchemas = {
  position: positionFieldSchema,
  period: periodFieldSchema,
  location: locationFieldSchema,
  companyUrl: companyUrlFieldSchema,
  technologies: technologiesFieldSchema,
} as const;

/** Field → existing label key (one place — SPEC R-1 r4). */
export const EDIT_FIELD_LABEL_KEYS: Record<EditField, string> = {
  position: 'adminJobsTablePosition',
  period: 'adminJobsTablePeriod',
  location: 'adminJobLocation',
  companyUrl: 'adminJobCompanyUrl',
  technologies: 'adminJobTechnologies',
};
