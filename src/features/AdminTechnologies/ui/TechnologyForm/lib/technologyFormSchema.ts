// ============================================
// makeTechnologyFormSchema — RHF adapter for the technology form (WU-3)
// ============================================
//
// technologies-crud SPEC / D2 layering: field rules delegate to the
// SHARED entity contract (`TechnologySchema`) — single source of truth;
// cross-record rules (uniqueness, edit-mode key immutability) live HERE.
//
// - `key`: slug per the entity contract; UNIQUE in create mode
//   (`adminTechKeyExists` 'custom' issue); IMMUTABLE in edit mode (D7 —
//   `value === originalKey`, `adminTechKeyInvalid`). The disabled Input
//   alone is NOT a guarantee: jsdom and console tampering can still
//   change a disabled field's value, so the schema rejects the change.
// - `iconUrl`: absolute https:// URL per the entity contract.
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
    iconUrl: z
      .string()
      .trim()
      .refine((value) => TechnologySchema.shape.url.safeParse(value).success, {
        message: 'adminTechUrlInvalid',
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
