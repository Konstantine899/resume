// ============================================
// ProjectFormSchema — DOM-input adapter over ProjectFormDataSchema
// ============================================
//
// Plan §10 says "RHF + zodResolver(ProjectFormDataSchema)": RHF however
// always hands the resolver RAW input values (textareas and inputs are
// strings), while `ProjectFormDataSchema` speaks the persisted contract
// (link null, metrics string[], year number, role optional). Every rule
// below is delegated to the SHARED schema via `.pipe()`, so the contract
// in entities stays the single source of truth (§7) and form fields can
// never drift from record fields.
//
// No zod messages are set (i18n-first): the component maps field errors
// to i18n keys exactly like AboutEditorForm.

import { z } from 'zod';

import { ProjectFormDataSchema, type Project } from '@/entities/Project';

/** Textarea contract: one metric per line, blanks dropped (§7: ≤40 each). */
const splitMetricLines = (raw: string): string[] =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

/**
 * Form-input schema: shape comes from `ProjectFormDataSchema`, only the
 * four DOM-string fields are adapted (link, metrics, year, role).
 */
export const ProjectFormSchema = ProjectFormDataSchema.extend({
  /** '' → null, otherwise the shared null | https:// | /… rule. */
  link: z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .pipe(ProjectFormDataSchema.shape.link),
  /** Textarea lines → string[]; blank → undefined (shape.metrics is optional
   *  and zod's .pipe() requires the EXACT input type `string[] | undefined`). */
  metrics: z
    .string()
    .transform((raw) => {
      const lines = splitMetricLines(raw);
      return lines.length === 0 ? undefined : lines;
    })
    .pipe(ProjectFormDataSchema.shape.metrics),
  /** '' → undefined, otherwise an int 2000…2100 (NaN fails is-int). */
  year: z
    .string()
    .trim()
    .transform((value) => (value === '' ? undefined : Number(value)))
    .pipe(ProjectFormDataSchema.shape.year),
  /** Both locales blank → no role; one locale set → shared min(1) per side. */
  role: z
    .object({ en: z.string(), ru: z.string() })
    .transform((value) =>
      value.en.trim() === '' && value.ru.trim() === ''
        ? undefined
        : { en: value.en.trim(), ru: value.ru.trim() }
    )
    .pipe(ProjectFormDataSchema.shape.role),
});

/** Raw DOM values the form works with (RHF `useForm<T>` input type). */
export type ProjectFormValues = z.input<typeof ProjectFormSchema>;
/** Parsed output — identical to the persisted `ProjectFormData` contract. */
export type ProjectFormOutput = z.output<typeof ProjectFormSchema>;

/** Fresh blank values (never share one mutable object across mounts). */
export const emptyProjectFormValues = (): ProjectFormValues => ({
  title: '',
  description: { en: '', ru: '' },
  techIcons: [],
  link: '',
  image: '',
  category: 'other',
  status: 'completed',
  featured: false,
  role: { en: '', ru: '' },
  metrics: '',
  year: '',
});

/** Record → DOM values (edit-mode defaults; RHF needs the string forms). */
export const toProjectFormValues = (project: Project): ProjectFormValues => ({
  title: project.title,
  description: { ...project.description },
  techIcons: [...project.techIcons],
  link: project.link ?? '',
  image: project.image,
  category: project.category,
  status: project.status,
  featured: project.featured,
  role: project.role ? { ...project.role } : { en: '', ru: '' },
  metrics: (project.metrics ?? []).join('\n'),
  year: project.year === undefined ? '' : String(project.year),
});
