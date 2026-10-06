// ============================================
// makeCategoryFormSchema — RHF adapter for the category form (WU-5)
// ============================================
//
// Plan §7 rules:
// - `category`: one of SKILL_CATEGORY_VALUES, UNIQUE in the store (create)
//   or unchanged from the record being edited (edit) → skillsErrCategoryExists;
// - `categoryName`: required, 3–50 → skillsErrCategoryName (mapped by the
//   component on field-error presence — the only rule on that field).
//
// Uniqueness messages are i18n KEY TOKENS, not prose: the component looks
// at `error.type === 'custom'` / the token and renders the translated
// text (i18n-first — zod itself never carries user-facing copy).

import { z } from 'zod';

import {
  SKILL_CATEGORY_VALUES,
  type SkillCategory,
  type SkillCategoryData,
} from '@/entities/Skill';

export const makeCategoryFormSchema = (
  existing: readonly SkillCategory[],
  current?: SkillCategory
) =>
  z.object({
    category: z
      .enum(SKILL_CATEGORY_VALUES)
      .refine((value) => value === current || !existing.includes(value), {
        message: 'skillsErrCategoryExists',
      }),
    categoryName: z.string().trim().min(3).max(50),
  });

export type CategoryFormSchema = ReturnType<typeof makeCategoryFormSchema>;
export type CategoryFormValues = z.input<CategoryFormSchema>;
/** No transforms on this form — output mirrors input; named for useForm. */
export type CategoryFormOutput = z.output<CategoryFormSchema>;

/** Fresh blank values (never share one mutable object across mounts). */
export const emptyCategoryFormValues = (): CategoryFormValues => ({
  category: 'frontend',
  categoryName: '',
});

/** Record → form values (edit-mode defaults). */
export const toCategoryFormValues = (category: SkillCategoryData): CategoryFormValues => ({
  category: category.category,
  categoryName: category.categoryName,
});
