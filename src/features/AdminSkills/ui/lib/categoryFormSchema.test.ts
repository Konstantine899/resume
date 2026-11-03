// ============================================
// category form schema tests (WU-5, plan_skills_crud §7)
// ============================================

import { describe, expect, it } from 'vitest';

import {
  emptyCategoryFormValues,
  makeCategoryFormSchema,
  toCategoryFormValues,
} from './categoryFormSchema';

const EXISTING = ['frontend', 'backend'] as const;

describe('makeCategoryFormSchema', () => {
  it('accepts a fresh category with a valid display name', () => {
    const result = makeCategoryFormSchema(EXISTING).safeParse({
      category: 'testing',
      categoryName: 'Testing',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a categoryName shorter than 3 characters', () => {
    const result = makeCategoryFormSchema(EXISTING).safeParse({
      category: 'testing',
      categoryName: 'AB',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'categoryName');
      expect(issue?.code).toBe('too_small');
    }
  });

  it('rejects a categoryName longer than 50 characters', () => {
    const result = makeCategoryFormSchema(EXISTING).safeParse({
      category: 'testing',
      categoryName: 'x'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'categoryName');
      expect(issue?.code).toBe('too_big');
    }
  });

  it('rejects a category key that already exists in the store', () => {
    const result = makeCategoryFormSchema(EXISTING).safeParse({
      category: 'frontend',
      categoryName: 'Frontend again',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'category');
      expect(issue?.code).toBe('custom');
      expect(issue?.message).toBe('skillsErrCategoryExists');
    }
  });

  it('allows the record’s own category key in edit mode', () => {
    const schema = makeCategoryFormSchema(EXISTING, 'frontend');
    const result = schema.safeParse({ category: 'frontend', categoryName: 'Frontend' });
    expect(result.success).toBe(true);
  });

  it('rejects a value outside SKILL_CATEGORY_VALUES', () => {
    const result = makeCategoryFormSchema(EXISTING).safeParse({
      category: 'nope',
      categoryName: 'Whatever',
    });
    expect(result.success).toBe(false);
  });
});

describe('category form value helpers', () => {
  it('empty values start blank with the first enum key', () => {
    expect(emptyCategoryFormValues()).toEqual({ category: 'frontend', categoryName: '' });
  });

  it('toCategoryFormValues maps a record 1:1', () => {
    expect(
      toCategoryFormValues({
        category: 'backend',
        categoryName: 'Backend',
        technologies: [],
      })
    ).toEqual({ category: 'backend', categoryName: 'Backend' });
  });
});
