// ============================================
// Project zod schemas (plan_projects_crud §5, §7)
// ============================================
//
// Three schemas, one source of truth:
// - `ProjectSchema` — the full collection record: normalizes what is read
//   from localStorage and validates what is persisted.
// - `ProjectsEnvelopeSchema` — reads the envelope `{ v: 1, projects }`;
//   `v` is a migration guard, unknown versions fall back to the seed (§7).
// - `ProjectFormDataSchema` — the admin form (react-hook-form zodResolver);
//   derived via `.omit()` from `ProjectSchema`, so form fields and record
//   fields can NEVER drift apart.
//
// Limits come straight from the plan's validation table (§7): title 2–100
// after trim; description locale ≤600; ≥1 techIcon key from TECH_ICONS;
// link = null | absolute https:// | internal `/…`; image = valid URL;
// role requires BOTH locales when present; metric ≤40; year 2000…2100.
// Messages are NOT set here — the form maps failures to i18n keys (i18n-first).

import { z } from 'zod';

import { PROJECT_CATEGORIES, PROJECT_STATUSES, TECH_ICONS } from './constants';
import type { Project, ProjectCategory, ProjectStatus } from './types';

/** Runtime enum over the TECH_ICONS dictionary keys — single source (A3). */
const TECH_ICON_KEYS = Object.keys(TECH_ICONS) as [string, ...string[]];

/** Runtime enums from the SAME constants the admin selects render (A5). */
const categoryEnum = z.enum(PROJECT_CATEGORIES as [ProjectCategory, ...ProjectCategory[]]);
const statusEnum = z.enum(PROJECT_STATUSES as [ProjectStatus, ...ProjectStatus[]]);

/** `null` (no link) | absolute https:// URL | internal app path `/…` (§7). */
const linkSchema = z.union([
  z.null(),
  z.url().refine((value) => value.startsWith('https://')),
  z
    .string()
    .min(2)
    .refine((value) => value.startsWith('/')),
]);

export const ProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(2).max(100),
  description: z.object({
    en: z.string().min(1).max(600),
    ru: z.string().min(1).max(600),
  }),
  techIcons: z.array(z.enum(TECH_ICON_KEYS)).min(1),
  link: linkSchema,
  image: z.url(),
  category: categoryEnum,
  status: statusEnum,
  featured: z.boolean(),
  role: z
    .object({
      en: z.string().trim().min(1),
      ru: z.string().trim().min(1),
    })
    .optional(),
  metrics: z.array(z.string().max(40)).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  /** ISO-8601 only — Date objects are never stored (§4, R-8). */
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

/** The exact envelope persisted under `resume.projects` (§4). */
export const ProjectsEnvelopeSchema = z.object({
  v: z.literal(1),
  projects: z.array(ProjectSchema),
});

/** Form fields only — `id`/`createdAt`/`updatedAt` are system-managed. */
export const ProjectFormDataSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectFormData = z.infer<typeof ProjectFormDataSchema>;
export type ProjectsEnvelope = z.infer<typeof ProjectsEnvelopeSchema>;

// Compile-time guard: the schema's inferred output must stay assignable
// to the FSD contract — a schema drift breaks the build, not the runtime.
const _contractCheck: Project = {} as z.infer<typeof ProjectSchema>;
void _contractCheck;
