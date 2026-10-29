// ============================================
// AboutContent normalization — transport strip
// ============================================
//
// `normalizeAboutPayload` selects only the six domain fields from a raw
// backend/storage/inbound payload and validates them with the strict
// AboutContentSchema. Transport metadata (id, updatedAt,
// expectedUpdatedAt) and any unknown key never reach the domain object.
//
// `extractAboutRevision` reads the revision marker (updatedAt) from the
// raw payload BEFORE strict validation — the revision is transport state,
// not content.

import { z } from 'zod';

import { AboutContentSchema } from './schema';
import type { AboutContent } from '../types/types';

/**
 * The parsed output of `normalizeAboutPayload` — pure domain content, no
 * transport fields (matches AboutContentSchema).
 */
export type AboutContentInput = z.infer<typeof AboutContentSchema>;

// Compile-time guard: the inferred normalizer output stays assignable to
// the FSD contract.
const _contractCheck: AboutContent = {} as AboutContentInput;
void _contractCheck;

export function normalizeAboutPayload(raw: unknown): AboutContentInput | undefined {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return undefined;

  const src = raw as Record<string, unknown>;

  const candidate = {
    fullName: src.fullName,
    descriptions: src.descriptions,
    stats: src.stats,
    statLabels: src.statLabels,
    ctaLabel: src.ctaLabel,
    portrait: src.portrait,
  };

  const parsed = AboutContentSchema.strict().safeParse(candidate);
  if (!parsed.success) return undefined;

  return parsed.data;
}

export function extractAboutRevision(raw: unknown): string | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;

  const value = (raw as Record<string, unknown>).updatedAt;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
