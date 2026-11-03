// ============================================
// makeTechnologyFormSchema — RHF adapter for the technology form
// NEW (2026-11-01): skills use the technology catalog as single source
// of truth, so the form stores a tech key instead of local name/icon.
// ============================================

import { z } from 'zod';

export const makeTechnologyFormSchema = (
  existingKeys: readonly string[],
  availableKeys: readonly string[] = [],
  mode: 'create' | 'edit' = 'create'
) =>
  z.object({
    techKey: z
      .string()
      .trim()
      .min(1, 'skillsErrTechName')
      .refine((value) => availableKeys.includes(value), { message: 'skillsErrTechName' })
      .refine((value) => mode === 'edit' || !existingKeys.includes(value), {
        message: 'skillsErrTechExists',
      }),
    invertInDark: z.boolean(),
  });

export type TechnologyFormSchema = ReturnType<typeof makeTechnologyFormSchema>;
export type TechnologyFormValues = z.input<TechnologyFormSchema>;
export type TechnologyFormOutput = z.output<TechnologyFormSchema>;

export const emptyTechnologyFormValues = (): TechnologyFormValues => ({
  techKey: '',
  invertInDark: false,
});

import type { SkillTechnology } from '@/entities/Skill';

// catalogDefault feeds the resolved value: when neither override nor
// snapshot is stored, the form shows what the resolver would render
// (`override ?? catalog ?? snapshot`, D5), so saving "untouched" does not
// silently freeze the old default.
export const toTechnologyFormValues = (
  technology: SkillTechnology,
  catalogDefault?: boolean
): TechnologyFormValues => ({
  techKey: technology.techKey ?? '',
  invertInDark:
    technology.invertInDarkOverride ?? catalogDefault ?? technology.invertInDark ?? false,
});
