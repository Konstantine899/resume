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
//   back to the seed (§5). Only v1 ever had a producer (AD-3): the v2
//   branch that `8702de1e` added never wrote a single record.
//
// Limits come straight from the plan's validation table (§7):
// name 2–30; iconSvg non-empty (NOT an enum — legacy vite-URLs and key
// names both live in the store, A3 passthrough); iconFilter ≤200 and must
// contain `brightness(`/`invert(`. Every technology carries AT LEAST ONE
// identifier — `techKey` (catalog link) or `name` (legacy) — so the shared
// `keyOf` stays total (AD-7). Uniqueness: technology key inside a category
// (row identity, AD-1) and category inside the envelope — zod `refine`.
// Messages are NOT set here — the form maps failures to i18n keys.

import { z } from 'zod';

import { keyOf } from '../../lib/keyOf';
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

export const TechnologySchema = z
  .object({
    name: z.string().trim().min(2).max(30).optional(),
    iconSvg: z.string().min(1).optional(),
    invertInDark: z.boolean().optional(),
    iconFilter: z
      .string()
      .max(200)
      .refine((value) => value.includes('brightness(') || value.includes('invert('), {
        message: 'iconFilter must contain brightness( or invert(',
      })
      .optional(),
    techKey: z.string().trim().min(1).optional(),
    invertInDarkOverride: z.boolean().optional(),
  })
  // AD-7: a record with neither identifier has no identity — `keyOf` would
  // return '' and two such records would collide into one list row (D3).
  .refine((tech) => Boolean(tech.techKey ?? tech.name), {
    message: 'technology requires techKey or name',
  });

export const SkillCategoryDataSchema = z
  .object({
    category: SkillCategorySchema,
    categoryName: z.string().trim().min(3).max(50),
    technologies: z.array(TechnologySchema),
  })
  .refine(
    (category) => new Set(category.technologies.map(keyOf)).size === category.technologies.length,
    { message: 'duplicate technology key inside category' }
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
