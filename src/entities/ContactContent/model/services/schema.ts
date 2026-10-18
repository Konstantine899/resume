// ============================================
// ContactContent zod schemas (plan Contact CRUD §5, §7)
// ============================================
//
// Three schemas, one source of truth:
// - `ContactContentSchema` — resolves the admin form (react-hook-form
//   zodResolver) AND validates a document before it is persisted.
// - `ContactFormDataSchema` — the Create form (§7): imported by
//   `useContactForm` in WU-2 to replace the manual check.
// - `ContactContentEnvelopeSchema` — reads the localStorage envelope
//   `{ v: 1, content }`; `v` is a migration guard, unknown versions
//   fall back to the seed (§7).
//
// Limits come straight from the plan's validation table (§7):
// email valid format after trim; formTexts ≤120; Create name 2–80 after
// trim, message 10–2000 (owner-approved spam floor). contact-rows-crud R-1
// (D1): the per-key texts cap is unified at 600 per locale — an open
// record cannot carry per-key limits, and 600 was the maximum anyway.
// Messages are NOT set here — callers map failures to i18n keys (R-4).

import { z } from 'zod';

import type { ContactContent } from '../types/types';

/** Row identity: slug key, unique per table (uniqueness enforced by the form). */
const rowKey = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);

/** One localized string with a per-table length cap. */
const localizedText = (max: number) =>
  z.object({
    en: z.string().min(1).max(max),
    ru: z.string().min(1).max(max),
  });

export const ContactContentSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  // Open records: rows are dynamic (add/delete ops are valid documents).
  texts: z.record(rowKey, localizedText(600)),
  formTexts: z.record(rowKey, localizedText(120)),
});

/** Create-form payload (§7): the owner-approved min(10) rejects one-word spam. */
export const ContactFormDataSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().pipe(z.email()),
  message: z.string().min(10).max(2000),
});

/** The exact envelope persisted under `resume.contact.content` (§4.1). */
export const ContactContentEnvelopeSchema = z.object({
  v: z.literal(1),
  content: ContactContentSchema,
});

export type ContactContentEnvelope = z.infer<typeof ContactContentEnvelopeSchema>;
export type ContactFormDataInput = z.infer<typeof ContactFormDataSchema>;

// Compile-time guard: the schema's inferred output must stay assignable
// to the FSD contract — a schema drift breaks the build, not the runtime.
const _contractCheck: ContactContent = {} as z.infer<typeof ContactContentSchema>;
void _contractCheck;
