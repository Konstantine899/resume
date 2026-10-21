// ============================================
// makeTechnologyFormSchema — RHF adapter for the technology form (WU-3)
// + tech-icon-upload (issue #261, WU-1)
// ============================================
//
// technologies-crud SPEC / D2 layering: field rules delegate to the
// SHARED entity contract where the types align — single source of truth;
// cross-record rules (uniqueness, edit-mode key immutability) live HERE.
//
// - `key`: slug per the entity contract; UNIQUE in create mode
//   (`adminTechKeyExists` 'custom' issue); IMMUTABLE in edit mode (D7 —
//   `value === originalKey`, `adminTechKeyInvalid`). The disabled Input
//   alone is NOT a guarantee: jsdom and console tampering can still
//   change a disabled field's value, so the schema rejects the change.
// - `iconUrl` (tech-icon-upload A1): the URL Input is GONE — the value is
//   a PROVISIONAL marker (the picked file's name, set by onFileSelect) or
//   the record's stored url (edit-mode default). Create REQUIRES a file
//   (non-empty → `adminTechIconRequired`); edit accepts any string — the
//   REAL `/images/technologies/<name>` path is resolved from the pending
//   FileUploadSelection at save time, and the keep-current semantics
//   (url unchanged without a new file) live in the component.
// - `invertInDark`: boolean (kit Select maps 'true'/'false' strings).
//
// Every refine carries its i18n key as the message — the form maps
// failures to `t()` (i18n-first, no kit copy).

import { z } from 'zod';

import { TechnologySchema } from '@/entities/Technology';

export const makeTechnologyFormSchema = (
  existingKeys: readonly string[],
  mode: 'create' | 'edit' = 'create',
  originalKey?: string
) =>
  z.object({
    key: z
      .string()
      .trim()
      .refine((value) => TechnologySchema.shape.key.safeParse(value).success, {
        message: 'adminTechKeyInvalid',
      })
      .refine(
        (value) => (mode === 'edit' ? value === originalKey : !existingKeys.includes(value)),
        { message: mode === 'edit' ? 'adminTechKeyInvalid' : 'adminTechKeyExists' }
      ),
    // A1: create needs a picked file; edit keeps the stored url until a
    // replacement is chosen (the marker never reaches the record — the
    // component resolves the real path or falls back to the record).
    iconUrl: z
      .string()
      .trim()
      .refine((value) => (mode === 'edit' ? true : value !== ''), {
        message: 'adminTechIconRequired',
      }),
    invertInDark: z.boolean(),
  });

/** Form values — no transforms (input === output), plain and stable. */
export interface TechnologyFormValues {
  key: string;
  iconUrl: string;
  invertInDark: boolean;
}

/** Fresh blank values (never share one mutable object across mounts). */
export const emptyTechnologyFormValues = (): TechnologyFormValues => ({
  key: '',
  iconUrl: '',
  invertInDark: false,
});

/** Record → form values (edit-mode defaults; false for the absent flag). */
export const toTechnologyFormValues = (technology: {
  key: string;
  url: string;
  invertInDark?: boolean;
}): TechnologyFormValues => ({
  key: technology.key,
  iconUrl: technology.url,
  invertInDark: technology.invertInDark ?? false,
});
