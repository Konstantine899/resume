// ============================================
// Technology zod schemas (technologies-crud SPEC D1)
// ============================================
//
// Two schemas, one source of truth:
// - `TechnologySchema` — the catalog record: normalizes what is read from
//   localStorage and validates what is persisted. Field rules (slug key,
//   https URL OR internal /images/... path — tech-icon-upload A3) live
//   HERE; cross-record rules (uniqueness, edit-mode key immutability)
//   belong to the feature-level form factory (D2 layering: entities never
//   know about each other).
// - `TechnologiesEnvelopeSchema` — reads the envelope `{ v: 1, technologies }`;
//   `v` is a migration guard, unknown versions fall back to the seed.
//
// Messages are NOT set here — the admin form maps failures to i18n keys (i18n-first).

import { z } from 'zod';

import { isBaseMediaKey as isMediaKey } from '@/shared/lib/media';
import type { Technology } from '../types/types';

/** Slug: lowercase letters, digits, hyphens — no leading/trailing hyphen. */
const KEY_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Internal `/images/...` path written by the admin FileUpload flow
 * (tech-icon-upload A3): letters, digits, dots, underscores, hyphens and
 * nested slashes — NO spaces. `saveImageToDir` produces exactly this shape.
 */
const INTERNAL_IMAGES_PATH_REGEX = /^\/images\/[A-Za-z0-9._\-/]+$/;

export const TechnologySchema = z.object({
  key: z.string().regex(KEY_SLUG_REGEX),
  /**
   * Union (tech-icon-upload A3): absolute https:// URL (the legacy shape —
   * `http://` is rejected, mixed content on an https page; same posture as
   * Project's linkSchema) OR an internal `/images/...` path from the admin
   * upload flow. The seed URLs are all https so hydration never silently
   * rejects stored data.
   */
  url: z.union([
    z.url().refine((value) => value.startsWith('https://')),
    z.string().regex(INTERNAL_IMAGES_PATH_REGEX),
    z.string().refine((value) => isMediaKey(value)),
  ]),
  invertInDark: z.boolean().optional(),
});

/** The exact envelope persisted under `technologies` (SPEC D1). */
export const TechnologiesEnvelopeSchema = z.object({
  v: z.literal(1),
  technologies: z.array(TechnologySchema),
});

export type TechnologiesEnvelope = z.infer<typeof TechnologiesEnvelopeSchema>;

// Compile-time guard: the schema's inferred output must stay assignable
// to the FSD contract — a schema drift breaks the build, not the runtime.
const _contractCheck: Technology = {} as z.infer<typeof TechnologySchema>;
void _contractCheck;
