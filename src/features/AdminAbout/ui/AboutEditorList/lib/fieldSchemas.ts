// ============================================
// fieldSchemas — per-field zod slices + merged-document helper
// (admin-about-table WU-1)
// ============================================
//
// SINGLE source of truth for the per-field validation behind the About
// vitrina (SPEC R-3): every slice DELEGATES its caps to the shared
// AboutContentSchema in entities via `.pipe()` — no second copy of the
// 600/60/40/80 limits may live here (D2-parity with AdminMyWork
// ui/ProjectForm/lib/fieldSchemas and AdminJobs ui/JobForm/lib/fieldSchemas).
//
// Messages stay i18n-first: a keyed pre-pipe refinement re-issues every
// contract failure — original path kept, so the form can still tell en
// from ru — under the field's EXISTING i18n key, instead of zod's English
// defaults (the four `about*Required` keys already in en.json/ru.json).
//
// Save path (SPEC R-3): snapshot selectAboutContent → toMergedDocument →
// persistAboutContent → updateAboutContent(merged). The slice is FULL
// REPLACE (aboutContentSlice), hence a whole-document helper instead of
// the partial patch (`toUpdateDto`) the other admin features use.

import { z } from 'zod';

import {
  AboutContentSchema,
  type AboutContent,
  type LocalizedText,
  type StatKey,
} from '@/entities/AboutContent';

/** The four stat rows in document order — index source for `stat-N`. */
export const STAT_KEYS = [
  'aboutStatYears',
  'aboutStatProjects',
  'aboutStatUsers',
  'aboutStatRemote',
] as const satisfies readonly StatKey[];

/** Every editable row key of the vitrina — 3 descriptions + 4 stats included. */
export type EditAboutField =
  'fullName' | `description-${0 | 1 | 2}` | `stat-${0 | 1 | 2 | 3}` | 'ctaLabel';

/** What a field schema parses to: the scalar or one LocalizedText. */
export type AboutFieldValueOf<F extends EditAboutField> = F extends 'fullName'
  ? string
  : LocalizedText;
export type AboutFieldValue = AboutFieldValueOf<EditAboutField>;

/** `description-N` → tuple index 0..2 (NaN/out-of-range → 0, never trust the union). */
export const descriptionIndexOf = (field: EditAboutField): 0 | 1 | 2 => {
  const index = Number(field.slice('description-'.length));
  return index === 1 || index === 2 ? index : 0;
};

/** `stat-N` → STAT_KEYS index 0..3 (NaN/fraction/out-of-range → 0). */
export const statIndexOf = (field: EditAboutField): 0 | 1 | 2 | 3 => {
  const index = Number(field.slice('stat-'.length));
  return Number.isInteger(index) && index >= 1 && index <= 3 ? (index as 1 | 2 | 3) : 0;
};

// ---- contract delegation (caps live ONLY in entities) ----

/**
 * Contract delegation WITH i18n messages: `superRefine` runs the SHARED
 * contract first and re-issues every failure (original path kept — the
 * modal still sees `['en']` vs `['ru']`) under the field's i18n key;
 * `.pipe(contract)` then enforces the very same contract as the SSOT
 * backstop. Limits are NEVER restated here — the entity schema owns them.
 */
const keyedContract = <T extends z.ZodType>(contract: T, messageKey: string) =>
  z
    .any()
    .superRefine((value, ctx) => {
      const result = contract.safeParse(value);
      if (result.success) return;
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: 'custom', path: [...issue.path], message: messageKey });
      }
    })
    .pipe(contract);

/** One paragraph slice: `descriptions[N]` (cap 600 + min 1 from the contract). */
const descriptionFieldSchema = (index: 0 | 1 | 2) =>
  keyedContract(AboutContentSchema.shape.descriptions.def.items[index], 'aboutParagraphEmpty');

/** One stat slice: `stats.<StatKey>` (cap 60 + min 1 from the contract). */
const statFieldSchema = (index: 0 | 1 | 2 | 3) =>
  keyedContract(AboutContentSchema.shape.stats.shape[STAT_KEYS[index]], 'aboutStatRequired');

/**
 * The nine per-field schemas, one per vitrina row (SPEC R-3). The
 * `satisfies` clause keeps the record COMPLETE at compile time — a new
 * union member without a schema breaks the build, not the runtime.
 */
export const aboutFieldSchemas = {
  fullName: keyedContract(AboutContentSchema.shape.fullName, 'aboutNameRequired'),
  'description-0': descriptionFieldSchema(0),
  'description-1': descriptionFieldSchema(1),
  'description-2': descriptionFieldSchema(2),
  'stat-0': statFieldSchema(0),
  'stat-1': statFieldSchema(1),
  'stat-2': statFieldSchema(2),
  'stat-3': statFieldSchema(3),
  ctaLabel: keyedContract(AboutContentSchema.shape.ctaLabel, 'aboutCtaRequired'),
} as const satisfies Record<EditAboutField, z.ZodType<AboutFieldValue>>;

/** Resolver entry for ANY vitrina row (field modal input: string | LocalizedText). */
export const aboutFieldSchema = <F extends EditAboutField>(
  field: F
): z.ZodType<AboutFieldValueOf<F>> =>
  aboutFieldSchemas[field] as unknown as z.ZodType<AboutFieldValueOf<F>>;

// ---- form values / merged document ----

/**
 * Input-side form state; only the ACTIVE field's keys are actually used
 * (same shape discipline as AdminMyWork `FieldFormValues`).
 */
export type AboutFieldFormValues = {
  fullName?: string;
  description?: LocalizedText;
  stat?: LocalizedText;
  ctaLabel?: LocalizedText;
};

/** Document → input defaults for the active field only (RHF needs DOM forms). */
export const defaultValuesFor = (
  field: EditAboutField,
  doc: AboutContent
): AboutFieldFormValues => {
  if (field === 'fullName') return { fullName: doc.fullName };
  if (field === 'ctaLabel') return { ctaLabel: { ...doc.ctaLabel } };
  if (field.startsWith('description-')) {
    return { description: { ...doc.descriptions[descriptionIndexOf(field)] } };
  }
  return { stat: { ...doc.stats[STAT_KEYS[statIndexOf(field)]] } };
};

/**
 * Snapshot → ONE field replaced → FULL document (SPEC R-3 save path; the
 * slice does a full replace). Sibling fields ride through untouched, the
 * edited LocalizedText is copied so the caller's form state never aliases
 * the stored document, and `base` is NEVER mutated (deep-frozen fixture
 * in the tests).
 */
export const toMergedDocument = <F extends EditAboutField>(
  base: AboutContent,
  field: F,
  value: AboutFieldValueOf<F>
): AboutContent => {
  if (field === 'fullName') return { ...base, fullName: value as string };
  if (field === 'ctaLabel') return { ...base, ctaLabel: { ...(value as LocalizedText) } };
  if (field.startsWith('description-')) {
    const index = descriptionIndexOf(field);
    return {
      ...base,
      descriptions: base.descriptions.map((paragraph, position) =>
        position === index ? { ...(value as LocalizedText) } : paragraph
      ) as AboutContent['descriptions'],
    };
  }
  const statKey = STAT_KEYS[statIndexOf(field)];
  return { ...base, stats: { ...base.stats, [statKey]: { ...(value as LocalizedText) } } };
};
