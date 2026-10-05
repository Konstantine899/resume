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
// email valid format after trim; `contactDescription` ≤600 per locale,
// the other texts ≤120; formTexts ≤120; Create name 2–80 after trim,
// message 10–2000 (owner-approved spam floor). Messages are NOT set
// here — callers map failures to i18n keys (R-4: no hardcoded text).

import { z } from 'zod';

import type { ContactContent } from './types';

/** One localized string with a shared per-locale length cap. */
const localizedText = (max: number) =>
  z.object({
    en: z.string().min(1).max(max),
    ru: z.string().min(1).max(max),
  });

export const ContactContentSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  texts: z.object({
    contactDescription: localizedText(600),
    responseTimeHint: localizedText(120),
    nameField: localizedText(120),
    email: localizedText(120),
    message: localizedText(120),
    namePlaceholder: localizedText(120),
    emailPlaceholder: localizedText(120),
    messagePlaceholder: localizedText(120),
    sendMessage: localizedText(120),
    sending: localizedText(120),
  }),
  formTexts: z.object({
    contactFormRequired: localizedText(120),
    contactFormSent: localizedText(120),
    contactFormError: localizedText(120),
    contactFormConfigError: localizedText(120),
  }),
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
