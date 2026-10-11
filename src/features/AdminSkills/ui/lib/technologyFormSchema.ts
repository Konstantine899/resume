// ============================================
// makeTechnologyFormSchema — RHF adapter for the technology form (WU-5)
// ============================================
//
// Plan §7 rules, delegated to the SHARED `TechnologySchema` where the
// types align (single source of truth):
// - `name`: required, 2–30 → skillsErrTechName; UNIQUE inside the
//   category (render key, R-9) → skillsErrTechExists ('custom' issue);
// - `iconSvg` (rev.2, skills-icon-upload): the Select is GONE — the form
//   value is '' (edit: «keep the current record») or an uploaded
//   `/images/skills/…` path; create with '' fails → skillsErrIcon; the
//   entity contract still accepts legacy keys on the STORED record —
//   the form never produces them anymore;
// - `iconFilter`: optional, ≤200, contains brightness(/invert( — the DOM
//   always submits a string, '' adapts to undefined via .pipe();
// - `invertInDark`: boolean checkbox.
//
// Component mapping: presence → skillsErrTechIcon / skillsErrFilter;
// for `name` it branches on issue type ('custom' = duplicate).

import { z } from 'zod';

import { TechnologySchema, type Technology } from '@/entities/Skill';

export const makeTechnologyFormSchema = (
  existingNames: readonly string[],
  mode: 'create' | 'edit' = 'create'
) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(30)
      .refine((value) => !existingNames.includes(value), { message: 'skillsErrTechExists' }),
    iconSvg: z
      .string()
      .refine((value) => (mode === 'edit' ? true : value !== ''), {
        message: 'skillsErrIcon',
      })
      .refine((value) => value === '' || value.startsWith('/images/'), {
        message: 'skillsErrIcon',
      }),
    iconFilter: z
      .string()
      .transform((value) => (value.trim() === '' ? undefined : value.trim()))
      .pipe(TechnologySchema.shape.iconFilter),
    invertInDark: z.boolean(),
  });

export type TechnologyFormSchema = ReturnType<typeof makeTechnologyFormSchema>;
export type TechnologyFormValues = z.input<TechnologyFormSchema>;
/** `iconFilter: '' → undefined` differs input from output — resolver needs both. */
export type TechnologyFormOutput = z.output<TechnologyFormSchema>;

/** Fresh blank values (never share one mutable object across mounts). */
export const emptyTechnologyFormValues = (): TechnologyFormValues => ({
  name: '',
  iconSvg: '',
  iconFilter: '',
  invertInDark: false,
});

/**
 * Record → form values (edit-mode defaults; '' for absent optional fields).
 * `iconSvg` maps to '' — the stored record (key or path) is kept until the
 * user uploads a replacement (rev.2 contract).
 */
export const toTechnologyFormValues = (technology: Technology): TechnologyFormValues => ({
  name: technology.name,
  iconSvg: '',
  iconFilter: technology.iconFilter ?? '',
  invertInDark: technology.invertInDark ?? false,
});
