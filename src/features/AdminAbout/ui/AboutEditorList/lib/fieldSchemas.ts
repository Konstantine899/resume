// ============================================
// fieldSchemas — per-field zod slices + document helpers
// (admin-about-table WU-1 + WU-12 amendment)
// ============================================
//
// SINGLE source of truth for the per-field validation behind the About
// vitrina (SPEC R-2/R-3/R-4): every slice DELEGATES its caps to the shared
// AboutContentSchema in entities via `.pipe()` — no second copy of the
// 600/60/40/80 limits may live here (D2-parity with AdminMyWork
// ui/ProjectForm/lib/fieldSchemas and AdminJobs ui/JobForm/lib/fieldSchemas).
//
// WU-12 (amendment, contract v2): field addresses are DYNAMIC —
// `description-<any index>` and `stat-<record key>` (a custom stat is
// addressed BY its key, never by a positional index), so the schema entry
// is a FACTORY dispatch, not the old static 9-field record (AdminMyWork
// `metricFieldSchema` precedent: dynamic row → constant slice + address
// helper). The add-row resolver (D11) lives here too: kind → field set,
// plus the slug-collision refine (`adminAboutKeyExists`).
//
// Messages stay i18n-first: a keyed pre-pipe refinement re-issues every
// contract failure — original path kept, so the form can still tell en
// from ru — under the field's EXISTING i18n key, instead of zod's English
// defaults (the four `about*Required` keys already in en.json/ru.json).
//
// Save paths (SPEC R-2/R-3/R-4): snapshot selectAboutContent → merge
// (toMergedDocument / withAddedRow / withRemovedRow) → persist →
// updateAboutContent(merged). The slice is FULL REPLACE (aboutContentSlice),
// hence whole-document helpers instead of the partial patch (`toUpdateDto`)
// the other admin features use.

import { z } from 'zod';

import {
  AboutContentSchema,
  type AboutContent,
  type LocalizedText,
  type StatKey,
} from '@/entities/AboutContent';

/** The four KNOWN stat rows — the seed subset of the open record (D10). */
export const STAT_KEYS = [
  'aboutStatYears',
  'aboutStatProjects',
  'aboutStatUsers',
  'aboutStatRemote',
] as const satisfies readonly StatKey[];

/** Every editable row key of the vitrina — dynamic indices/keys since WU-12. */
export type EditAboutField = 'fullName' | `description-${number}` | `stat-${string}` | 'ctaLabel';

/** A real vitrina row (fullName is a scalar block — never a row, SPEC R-5). */
export type AboutRowField = Exclude<EditAboutField, 'fullName'>;

/** What a field schema parses to: the scalar or one LocalizedText. */
export type AboutFieldValueOf<F extends EditAboutField> = F extends 'fullName'
  ? string
  : LocalizedText;
export type AboutFieldValue = AboutFieldValueOf<EditAboutField>;

/** `description-N` → the array index (NaN/fraction/negative → 0, never trust the union). */
export const descriptionIndexOf = (field: EditAboutField): number => {
  const index = Number(field.slice('description-'.length));
  return Number.isInteger(index) && index >= 0 ? index : 0;
};

/** `stat-<key>` → the record key verbatim (WU-12: keys, not positions). */
export const statKeyOf = (field: EditAboutField): string => field.slice('stat-'.length);

/** Known stat keys are labeled by i18n; custom keys carry their own label. */
export const isKnownStatKey = (key: string): boolean =>
  (STAT_KEYS as readonly string[]).includes(key);

/**
 * Localized label of ANY stat row (D10): the four known keys translate via
 * `t()`, a custom key uses its stored `statLabels[key][language]` and falls
 * back to the raw key (honest data — the key IS shown when unlabeled).
 */
export const statRowLabel = (
  doc: AboutContent,
  key: string,
  language: 'en' | 'ru',
  translate: (key: string) => string
): string => (isKnownStatKey(key) ? translate(key) : (doc.statLabels?.[key]?.[language] ?? key));

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

/** The fullName scalar slice (contract trim + cap 80). */
const fullNameFieldSchema = keyedContract(AboutContentSchema.shape.fullName, 'aboutNameRequired');

/** The CTA slice: the edit form never WRITES null (null = row DELETE, R-3). */
const ctaFieldSchema = keyedContract(
  AboutContentSchema.shape.ctaLabel.def.innerType,
  'aboutCtaRequired'
);

/**
 * One paragraph slice: any `descriptions[i]` (cap 600 + min 1 from the
 * contract). Exported as a factory so the add-row resolver composes it —
 * the address (`index`) is validated by the CALLER's schema/type contract,
 * the value rules are identical for every row (AdminMyWork metric parity).
 */
export const descriptionFieldSchema = () =>
  keyedContract(AboutContentSchema.shape.descriptions.def.element, 'aboutParagraphEmpty');

/** One stat slice: any `stats[<key>]` entry (cap 60 + min 1 from the contract). */
export const statFieldSchema = () =>
  keyedContract(AboutContentSchema.shape.stats.def.valueType, 'aboutStatRequired');

/** Resolver entry for ANY vitrina row (field modal input: string | LocalizedText). */
export const aboutFieldSchema = <F extends EditAboutField>(
  field: F
): z.ZodType<AboutFieldValueOf<F>> => {
  const schema =
    field === 'fullName'
      ? fullNameFieldSchema
      : field === 'ctaLabel'
        ? ctaFieldSchema
        : field.startsWith('description-')
          ? descriptionFieldSchema()
          : statFieldSchema();
  return schema as unknown as z.ZodType<AboutFieldValueOf<F>>;
};

/** The form-values KEY the active field's value lives under (WU-4). */
export const valueKeyOf = (field: EditAboutField): keyof AboutFieldFormValues => {
  if (field === 'fullName') return 'fullName';
  if (field === 'ctaLabel') return 'ctaLabel';
  return field.startsWith('description-') ? 'description' : 'stat';
};

/**
 * zodResolver entry (WU-4): RHF hands the resolver the WHOLE form-values
 * object (`{ description: {en,ru} }`), while the slices parse the field
 * VALUE — so the resolver schema wraps the slice under the value key.
 * `z.object` prefixes every issue path with the key, which is exactly the
 * nesting the modal's `errors.<valueKey>.<locale>` lookups expect.
 * The return type is INFERRED on purpose — an annotated `z.ZodType<…>`
 * with an `unknown` input no longer satisfies @hookform/resolvers v5's
 * `Zod4Type<unknown, FieldValues>` parameter (TS2345).
 */
export const aboutFieldResolverSchema = (field: EditAboutField) =>
  z.object({
    [valueKeyOf(field)]: aboutFieldSchema(field),
  });

// ---- form values / merged document (edit) ----

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
  // v2 guards: ctaLabel may be null (row deleted) and array/record index
  // access may miss — the edit modal only opens from an EXISTING row, so
  // an empty default is the honest unreachable fallback.
  if (field === 'ctaLabel') {
    return doc.ctaLabel !== null ? { ctaLabel: { ...doc.ctaLabel } } : {};
  }
  if (field.startsWith('description-')) {
    const paragraph = doc.descriptions[descriptionIndexOf(field)];
    return paragraph !== undefined ? { description: { ...paragraph } } : {};
  }
  const stat = doc.stats[statKeyOf(field)];
  return stat !== undefined ? { stat: { ...stat } } : {};
};

/**
 * Snapshot → ONE field replaced → FULL document (SPEC R-4 save path; the
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
      ),
    };
  }
  const key = statKeyOf(field);
  return { ...base, stats: { ...base.stats, [key]: { ...(value as LocalizedText) } } };
};

// ---- add/delete row (WU-12 amendment, SPEC R-2/R-3 / D11) ----

/** The kind of row the add modal creates (kit Select options, D11). */
export type AboutRowKind = 'description' | 'stat' | 'cta';

/** Add-modal form values; only the ACTIVE kind's keys are populated. */
export type AboutRowFormValues = {
  description?: LocalizedText;
  statLabel?: LocalizedText;
  stat?: LocalizedText;
  ctaLabel?: LocalizedText;
};

/** What the add seam writes: description appends, stat carries its key+label. */
export type AboutRowPayload =
  | { kind: 'description'; value: LocalizedText }
  | { kind: 'stat'; key: string; label: LocalizedText; value: LocalizedText }
  | { kind: 'cta'; value: LocalizedText };

/**
 * D11 stat key: slug of the EN label — lowercase, runs of anything outside
 * `[a-z0-9]` collapse to one dash, edge dashes dropped, capped at 40 (the
 * contract's key cap). A non-latin label yields '' — the resolver rejects
 * it (`adminAboutKeyInvalid`) instead of inventing a key.
 */
export const slugFromLabel = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 40)
    .replace(/-+$/, '');

/**
 * Add-row resolver (R-2): the kind selects the field set; the stat kind
 * validates BOTH 60-cap slices and refines the generated slug key against
 * `existingKeys` (collision → `adminAboutKeyExists`, empty slug →
 * `adminAboutKeyInvalid`, both under the EN label input).
 * The return type is INFERRED for the same @hookform/resolvers v5 reason
 * as `aboutFieldResolverSchema`.
 */
export const aboutRowResolverSchema = (kind: AboutRowKind, existingKeys: readonly string[]) => {
  if (kind === 'description') return z.object({ description: descriptionFieldSchema() });
  if (kind === 'cta') return z.object({ ctaLabel: ctaFieldSchema });
  return z
    .object({ statLabel: statFieldSchema(), stat: statFieldSchema() })
    .superRefine((values, ctx) => {
      // Refinements run only after the shape parsed — statLabel is defined.
      const slug = slugFromLabel(values.statLabel.en);
      if (slug === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['statLabel', 'en'],
          message: 'adminAboutKeyInvalid',
        });
        return;
      }
      if (existingKeys.includes(slug)) {
        ctx.addIssue({
          code: 'custom',
          path: ['statLabel', 'en'],
          message: 'adminAboutKeyExists',
        });
      }
    });
};

/** Snapshot → the added row appended → FULL document (R-2). */
export const withAddedRow = (base: AboutContent, payload: AboutRowPayload): AboutContent => {
  switch (payload.kind) {
    case 'description':
      return { ...base, descriptions: [...base.descriptions, { ...payload.value }] };
    case 'stat':
      return {
        ...base,
        stats: { ...base.stats, [payload.key]: { ...payload.value } },
        statLabels: { ...(base.statLabels ?? {}), [payload.key]: { ...payload.label } },
      };
    case 'cta':
      return { ...base, ctaLabel: { ...payload.value } };
  }
};

/**
 * Snapshot → the row removed → FULL document (R-3): a description is cut
 * by INDEX, a stat loses its `stats[key]` AND `statLabels[key]` entries,
 * the CTA row becomes `null` (the vitrina hides the link). `base` is NEVER
 * mutated.
 */
export const withRemovedRow = (base: AboutContent, field: AboutRowField): AboutContent => {
  if (field === 'ctaLabel') return { ...base, ctaLabel: null };
  if (field.startsWith('description-')) {
    const index = descriptionIndexOf(field);
    return { ...base, descriptions: base.descriptions.filter((_, pos) => pos !== index) };
  }
  const key = statKeyOf(field);
  const stats = Object.fromEntries(Object.entries(base.stats).filter(([k]) => k !== key));
  const statLabels =
    base.statLabels !== undefined
      ? Object.fromEntries(Object.entries(base.statLabels).filter(([k]) => k !== key))
      : undefined;
  return { ...base, stats, ...(statLabels !== undefined ? { statLabels } : {}) };
};
