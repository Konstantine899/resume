// Schema tests (TDD red → green, plan_skills_crud §6 + §7).
// Expected values are independent literals — never recomputed the way
// the implementation computes them.

import { describe, expect, it } from 'vitest';

import { SKILLS_DATA } from '../constants';
import type { SkillCategoryData } from '../types';
import { SkillsEnvelopeSchema, SkillCategoryDataSchema, TechnologySchema } from './schema';

const VALID_CATEGORY: SkillCategoryData = {
  category: 'frontend',
  categoryName: 'Frontend',
  technologies: [
    { name: 'React', iconSvg: '/assets/react.svg' },
    { name: 'TypeScript', iconSvg: '/assets/typescript.svg', invertInDark: true },
    {
      name: 'Hugging Face',
      iconSvg: '/assets/hugging-face.svg',
      iconFilter: 'brightness(0) saturate(100%) invert(87%) sepia(99%) saturate(339%)',
    },
  ],
};

describe('TechnologySchema', () => {
  it('accepts a valid technology', () => {
    expect(TechnologySchema.safeParse(VALID_CATEGORY.technologies[0]).success).toBe(true);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(TechnologySchema.safeParse({ name: 'R', iconSvg: '/assets/react.svg' }).success).toBe(
      false
    );
  });

  it('rejects name longer than 30 chars', () => {
    expect(
      TechnologySchema.safeParse({ name: 'a'.repeat(31), iconSvg: '/assets/x.svg' }).success
    ).toBe(false);
  });

  it('rejects empty iconSvg', () => {
    expect(TechnologySchema.safeParse({ name: 'React', iconSvg: '' }).success).toBe(false);
  });

  it('rejects iconFilter longer than 200 chars', () => {
    expect(
      TechnologySchema.safeParse({
        name: 'React',
        iconSvg: '/a.svg',
        iconFilter: `brightness(0) ${'x'.repeat(200)}`,
      }).success
    ).toBe(false);
  });

  it('rejects iconFilter without brightness( or invert(', () => {
    expect(
      TechnologySchema.safeParse({
        name: 'React',
        iconSvg: '/a.svg',
        iconFilter: 'drop-shadow(0 0 2px red)',
      }).success
    ).toBe(false);
  });
});

describe('SkillCategoryDataSchema', () => {
  it('accepts a valid category', () => {
    expect(SkillCategoryDataSchema.safeParse(VALID_CATEGORY).success).toBe(true);
  });

  it('output is assignable to SkillCategoryData (contract compatibility)', () => {
    const parsed = SkillCategoryDataSchema.parse(VALID_CATEGORY);
    const typed: SkillCategoryData = parsed;
    expect(typed.category).toBe('frontend');
  });

  it('rejects a category outside the SkillCategory union', () => {
    expect(
      SkillCategoryDataSchema.safeParse({ ...VALID_CATEGORY, category: 'mobile' }).success
    ).toBe(false);
  });

  it('rejects duplicate technology names inside one category (render key)', () => {
    const duplicate: SkillCategoryData = {
      category: 'frontend',
      categoryName: 'Frontend',
      technologies: [
        { name: 'React', iconSvg: '/a.svg' },
        { name: 'React', iconSvg: '/b.svg' },
      ],
    };
    expect(SkillCategoryDataSchema.safeParse(duplicate).success).toBe(false);
  });
});

describe('SkillsEnvelopeSchema', () => {
  it('accepts the exact persisted envelope { v: 1, data }', () => {
    expect(SkillsEnvelopeSchema.safeParse({ v: 1, data: [VALID_CATEGORY] }).success).toBe(true);
  });

  it('rejects an unknown envelope version (migration guard)', () => {
    expect(SkillsEnvelopeSchema.safeParse({ v: 2, data: [VALID_CATEGORY] }).success).toBe(false);
  });

  it('rejects duplicate categories inside one envelope', () => {
    expect(
      SkillsEnvelopeSchema.safeParse({ v: 1, data: [VALID_CATEGORY, VALID_CATEGORY] }).success
    ).toBe(false);
  });

  it('rejects a non-array data payload', () => {
    expect(SkillsEnvelopeSchema.safeParse({ v: 1, data: {} }).success).toBe(false);
  });

  it('accepts the full SKILLS_DATA seed (seed/schema drift guard)', () => {
    expect(SkillsEnvelopeSchema.safeParse({ v: 1, data: SKILLS_DATA }).success).toBe(true);
  });
});
