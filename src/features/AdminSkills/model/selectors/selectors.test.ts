// skills selectors tests (plan_skills_crud §12 WU-1, R-10: the vitrina
// selector hides empty categories, the admin selector shows ALL of them).

import { describe, expect, it } from 'vitest';

import { SKILLS_DATA, type SkillCategoryData } from '@/entities/Skill';
import { selectAllSkillsData, selectSkillCategoryById, selectSkillsData } from './selectors';

const state = (data: SkillCategoryData[]) => ({ adminSkills: data });

const WITH_EMPTY: SkillCategoryData[] = [
  ...SKILLS_DATA,
  { category: 'methodologies', categoryName: 'Methodologies', technologies: [] },
];

describe('selectAllSkillsData', () => {
  it('returns every category including empty ones (admin read path)', () => {
    expect(selectAllSkillsData(state(WITH_EMPTY))).toHaveLength(SKILLS_DATA.length + 1);
  });
});

describe('selectSkillsData', () => {
  it('hides empty categories from the vitrina (R-10)', () => {
    const result = selectSkillsData(state(WITH_EMPTY));
    expect(result).toHaveLength(SKILLS_DATA.length);
    expect(result.some((category) => category.category === 'methodologies')).toBe(false);
  });

  it('keeps categories that still have technologies', () => {
    expect(selectSkillsData(state(SKILLS_DATA)).map((c) => c.category)).toEqual(
      SKILLS_DATA.map((c) => c.category)
    );
  });
});

describe('selectSkillCategoryById', () => {
  it('finds a category by its union key', () => {
    expect(selectSkillCategoryById(state(SKILLS_DATA), 'backend')?.categoryName).toBe('Backend');
  });

  it('returns undefined for an unknown key', () => {
    expect(selectSkillCategoryById(state(SKILLS_DATA), 'mobile')).toBeUndefined();
  });
});
