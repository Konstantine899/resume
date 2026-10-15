// ============================================
// Skill zod schemas (plan_skills_crud §6, §7)
// ============================================
//
// Two schemas, one source of truth:
// - `SkillCategoryDataSchema` / `TechnologySchema` — validate a document
//   before it is persisted AND drive the admin form (react-hook-form
//   zodResolver in WU-5).
// - `SkillsEnvelopeSchema` — reads the localStorage envelope
//   `{ v: 1, data }`; `v` is a migration guard, unknown versions fall
//   back to the seed (§5).
//
// Limits come straight from the plan's validation table (§7):
// name 2–30; iconSvg non-empty (NOT an enum — legacy vite-URLs and key
// names both live in the store, A3 passthrough); iconFilter ≤200 and must
// contain `brightness(`/`invert(`. Uniqueness: technology name inside a
// category (render key) and category inside the envelope — zod `refine`.
// Messages are NOT set here — the form maps failures to i18n keys.

import { z } from 'zod';

import type { SkillCategoryData } from '../types/types';

export const SKILL_CATEGORY_VALUES = [
  'frontend',
  'backend',
  'testing',
  'devops',
  'methodologies',
  'architecture',
  'ai',
] as const;

const SkillCategorySchema = z.enum(SKILL_CATEGORY_VALUES);

export const TechnologySchema = z.object({
  name: z.string().trim().min(2).max(30),
  iconSvg: z.string().min(1),
  invertInDark: z.boolean().optional(),
  iconFilter: z
    .string()
    .max(200)
    .refine((value) => value.includes('brightness(') || value.includes('invert('), {
      message: 'iconFilter must contain brightness( or invert(',
    })
    .optional(),
});

export const SkillCategoryDataSchema = z
  .object({
    category: SkillCategorySchema,
    categoryName: z.string().trim().min(3).max(50),
    technologies: z.array(TechnologySchema),
  })
  .refine(
    (category) =>
      new Set(category.technologies.map((tech) => tech.name)).size === category.technologies.length,
    { message: 'duplicate technology name inside category' }
  );

/** The exact envelope persisted under `resume.skills` (§5). */
export const SkillsEnvelopeSchema = z
  .object({
    v: z.literal(1),
    data: z.array(SkillCategoryDataSchema),
  })
  .refine(
    (envelope) =>
      new Set(envelope.data.map((category) => category.category)).size === envelope.data.length,
    { message: 'duplicate category inside envelope' }
  );

export type SkillsEnvelope = z.infer<typeof SkillsEnvelopeSchema>;

// Compile-time guard: the schema's inferred output must stay assignable
// to the FSD contract — a schema drift breaks the build, not the runtime.
const _contractCheck: SkillCategoryData = {} as z.infer<typeof SkillCategoryDataSchema>;
void _contractCheck;
