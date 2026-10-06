// ============================================
// makeTechnologyFormSchema — RHF adapter for the technology form (WU-5)
// ============================================
//
// Plan §7 rules, delegated to the SHARED `TechnologySchema` where the
// types align (single source of truth):
// - `name`: required, 2–30 → skillsErrTechName; UNIQUE inside the
//   category (render key, R-9) → skillsErrTechExists ('custom' issue);
// - `iconSvg`: one of the 62 available file keys → skillsErrIcon; the
//   store contract allows legacy values, so callers pass `knownIcons`
//   widened with the record's current value when it is not a listed key
//   (editing a name must not fail on an unknown stored icon);
// - `iconFilter`: optional, ≤200, contains brightness(/invert( — the DOM
//   always submits a string, '' adapts to undefined via .pipe();
// - `invertInDark`: boolean checkbox.
//
// Component mapping: presence → skillsErrTechIcon / skillsErrFilter;
// for `name` it branches on issue type ('custom' = duplicate).

import { z } from 'zod';

import { SKILL_ICON_KEYS, TechnologySchema, type Technology } from '@/entities/Skill';

export const makeTechnologyFormSchema = (
  existingNames: readonly string[],
  knownIcons: readonly string[] = SKILL_ICON_KEYS
) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(30)
      .refine((value) => !existingNames.includes(value), { message: 'skillsErrTechExists' }),
    iconSvg: z.string().refine((value) => knownIcons.includes(value), { message: 'skillsErrIcon' }),
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
  iconSvg: SKILL_ICON_KEYS[0] ?? '',
  iconFilter: '',
  invertInDark: false,
});

/** Record → form values (edit-mode defaults; '' for absent optional fields). */
export const toTechnologyFormValues = (technology: Technology): TechnologyFormValues => ({
  name: technology.name,
  iconSvg: technology.iconSvg,
  iconFilter: technology.iconFilter ?? '',
  invertInDark: technology.invertInDark ?? false,
});
