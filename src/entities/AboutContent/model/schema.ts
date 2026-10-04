// ============================================
// AboutContent zod schemas (plan About CRUD §5, §7)
// ============================================
//
// Two schemas, one source of truth:
// - `AboutContentSchema` — resolves the admin form (react-hook-form
//   zodResolver) AND validates a document before it is persisted.
// - `AboutContentEnvelopeSchema` — reads the localStorage envelope
//   `{ v: 1, content }`; `v` is a migration guard, unknown versions
//   fall back to the seed (§7).
//
// Limits come straight from the plan's validation table (§7):
// fullName 2–80 after trim; each paragraph locale ≤600; each stat locale
// ≤60; ctaLabel locale ≤40. Messages are NOT set here — the form maps
// failures to i18n keys (R-4: no hardcoded text).

import { z } from 'zod';

import type { AboutContent } from './types';

/** One localized string with a shared per-locale length cap. */
const localizedText = (max: number) =>
  z.object({
    en: z.string().min(1).max(max),
    ru: z.string().min(1).max(max),
  });

export const AboutContentSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  descriptions: z.tuple([localizedText(600), localizedText(600), localizedText(600)]),
  stats: z.object({
    aboutStatYears: localizedText(60),
    aboutStatProjects: localizedText(60),
    aboutStatUsers: localizedText(60),
    aboutStatRemote: localizedText(60),
  }),
  ctaLabel: localizedText(40),
});

/** The exact envelope persisted under `resume.about.content` (§4.1). */
export const AboutContentEnvelopeSchema = z.object({
  v: z.literal(1),
  content: AboutContentSchema,
});

export type AboutContentEnvelope = z.infer<typeof AboutContentEnvelopeSchema>;

// Compile-time guard: the schema's inferred output must stay assignable
// to the FSD contract — a schema drift breaks the build, not the runtime.
const _contractCheck: AboutContent = {} as z.infer<typeof AboutContentSchema>;
void _contractCheck;
