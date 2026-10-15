// ============================================
// fieldSchemas — shared per-field zod slices (mywork-field-actions WU-2)
// ============================================
//
// SINGLE source of truth for the per-field validation rules used by BOTH
// the full ProjectForm (projectFormSchema composes from the same shared
// contract) and the field-scoped FieldEditForm (one field at a time).
// Every scalar slice DELEGATES via `ProjectFormSchema.shape.*` — no
// second copy of min/max may live anywhere else (SPEC R-B5, D2-parity
// with AdminJobs ui/JobForm/lib/fieldSchemas).
//
// Message keys stay i18n-first (every message IS the key — parity with
// projectFormSchema): the FieldEditForm maps errors to t(...) exactly
// like the full form.
//
// metric-N rows are NOT a scalar member of fieldEditSchemas — the index
// is dynamic, so `metricFieldSchema` + `toUpdateDto` handle the splice
// against the record's existing metrics array.

import { z } from 'zod';

import type { Project, ProjectCategory, ProjectStatus } from '@/entities/Project';
import type { ProjectUpdatePatch } from '../../../model/types/types';
import { ProjectFormSchema } from './projectFormSchema';

/** Scalar field keys — the static half of the detail-table rows. */
export type ScalarEditField =
  | 'title'
  | 'category'
  | 'status'
  | 'featured'
  | 'year'
  | 'link'
  | 'description'
  | 'role'
  | 'techIcons';

/** Every editable row key of the detail table (image has NO actions — R-B1). */
export type EditProjectField = ScalarEditField | `metric-${number}`;

/** Parse the dynamic metric row key; NaN-guarded (never trust the union). */
export const metricIndexOf = (field: EditProjectField): number => {
  const index = Number(field.slice('metric-'.length));
  return Number.isNaN(index) ? 0 : index;
};

/** One metric line: same UX rule as the full form's blank-line dropping. */
export const metricFieldSchema = z.object({
  metric: z
    .string()
    .trim()
    .min(1, 'projectMetricInvalid')
    .max(40, 'projectMetricInvalid'),
});

// ---- field-modal schemas (one field at a time, all delegating) ----

export const fieldEditSchemas = {
  title: z.object({ title: ProjectFormSchema.shape.title }),
  category: z.object({ category: ProjectFormSchema.shape.category }),
  status: z.object({ status: ProjectFormSchema.shape.status }),
  featured: z.object({ featured: ProjectFormSchema.shape.featured }),
  year: z.object({ year: ProjectFormSchema.shape.year }),
  link: z.object({ link: ProjectFormSchema.shape.link }),
  description: z.object({ description: ProjectFormSchema.shape.description }),
  role: z.object({ role: ProjectFormSchema.shape.role }),
  techIcons: z.object({ techIcons: ProjectFormSchema.shape.techIcons }),
} as const;

/** Resolver schema for ANY row key (scalar record or metric slice). */
export const schemaFor = (field: EditProjectField) =>
  field.startsWith('metric-')
    ? metricFieldSchema
    : fieldEditSchemas[field as ScalarEditField];

/** Input-side form state; only the ACTIVE field's keys are actually used. */
export type FieldFormValues = {
  title?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  featured?: boolean;
  year?: string;
  link?: string;
  description?: { en: string; ru: string };
  role?: { en: string; ru: string };
  techIcons?: string[];
  metric?: string;
};

/** Record → input defaults for the active field only (RHF needs DOM forms). */
export const defaultValuesFor = (field: EditProjectField, project: Project): FieldFormValues => {
  switch (field) {
    case 'title':
      return { title: project.title };
    case 'category':
      return { category: project.category };
    case 'status':
      return { status: project.status };
    case 'featured':
      return { featured: project.featured };
    case 'year':
      return { year: project.year === undefined ? '' : String(project.year) };
    case 'link':
      return { link: project.link ?? '' };
    case 'description':
      return { description: { ...project.description } };
    case 'role':
      return { role: project.role ? { ...project.role } : { en: '', ru: '' } };
    case 'techIcons':
      return { techIcons: [...project.techIcons] };
    default:
      return { metric: project.metrics?.[metricIndexOf(field)] ?? '' };
  }
};

/** Resolver output — per-field DTO-ready slices (transforms applied). */
export type FieldFormOutput =
  | { title: string }
  | { category: ProjectCategory }
  | { status: ProjectStatus }
  | { featured: boolean }
  | { year: number | undefined }
  | { link: string | null }
  | { description: { en: string; ru: string } }
  | { role: { en: string; ru: string } | undefined }
  | { techIcons: string[] }
  | { metric: string };

/** Resolver output → ONE-field partial (the record rides only for metrics). */
export const toUpdateDto = (
  field: EditProjectField,
  data: FieldFormOutput,
  project: Project
): Omit<ProjectUpdatePatch, 'updatedAt'> => {
  switch (field) {
    case 'title':
      return { title: (data as { title: string }).title };
    case 'category':
      return { category: (data as { category: ProjectCategory }).category };
    case 'status':
      return { status: (data as { status: ProjectStatus }).status };
    case 'featured':
      return { featured: (data as { featured: boolean }).featured };
    case 'year':
      return { year: (data as { year: number | undefined }).year };
    case 'link':
      return { link: (data as { link: string | null }).link };
    case 'description':
      return { description: (data as { description: { en: string; ru: string } }).description };
    case 'role':
      return { role: (data as { role: { en: string; ru: string } | undefined }).role };
    case 'techIcons':
      return { techIcons: (data as { techIcons: string[] }).techIcons };
    default: {
      const current = project.metrics ?? [];
      const next = [...current];
      next[metricIndexOf(field)] = (data as { metric: string }).metric;
      return { metrics: next };
    }
  }
};
