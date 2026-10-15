// skillsSlice tests (plan_skills_crud §4 actions, §5 lazy hydration).
// Persist-first order is enforced at the call site (admin form, WU-5) —
// here we pin reducer behavior: immutable nested edits, seed fallback and
// a cloned (never shared-reference) reset.

import { describe, expect, it, beforeEach } from 'vitest';

import { SKILLS_DATA, type SkillCategoryData, type Technology } from '@/entities/Skill';
import {
  addSkillCategory,
  addTechnology,
  deleteSkillCategory,
  deleteTechnology,
  resetToDefaults,
  skillsReducer,
  updateSkillCategory,
  updateTechnology,
} from './skillsSlice';
import { SKILLS_STORAGE_KEY, persistSkills } from '../services/storage';

const hydrated = (): SkillCategoryData[] => skillsReducer(undefined, { type: '@@INIT' });

const frontendTech: Technology = { name: 'Preact', iconSvg: 'preact' };

beforeEach(() => {
  localStorage.clear();
});

describe('lazy hydration (resume-rtk-lazy-hydration)', () => {
  it('falls back to the seed when nothing is stored', () => {
    expect(hydrated()).toEqual(SKILLS_DATA);
  });

  it('hydrates the stored envelope on the FIRST reducer call, not at import', () => {
    const stored: SkillCategoryData[] = JSON.parse(JSON.stringify(SKILLS_DATA));
    const [first] = stored;
    expect(first).toBeDefined();
    if (first) first.categoryName = 'Frontend Edited';
    expect(persistSkills(stored)).toBe(true);

    const state = skillsReducer(undefined, { type: '@@INIT' });
    expect(state[0]?.categoryName).toBe('Frontend Edited');
    expect(localStorage.getItem(SKILLS_STORAGE_KEY)).not.toBeNull();
  });

  it('falls back to the seed when the stored envelope is corrupt', () => {
    localStorage.setItem(SKILLS_STORAGE_KEY, '{broken');
    expect(hydrated()).toEqual(SKILLS_DATA);
  });
});

describe('addSkillCategory', () => {
  it('appends a new category', () => {
    const state = hydrated();
    const next = skillsReducer(
      state,
      addSkillCategory({
        category: 'methodologies',
        categoryName: 'Methodologies',
        technologies: [],
      })
    );
    expect(next).toHaveLength(state.length + 1);
    expect(next[next.length - 1]?.category).toBe('methodologies');
  });
});

describe('addTechnology', () => {
  it('appends a technology to the matching category', () => {
    const state = hydrated();
    const next = skillsReducer(
      state,
      addTechnology({ categoryId: 'backend', technology: frontendTech })
    );
    const backend = next.find((category) => category.category === 'backend');
    const techs = backend?.technologies ?? [];
    expect(techs[techs.length - 1]).toEqual(frontendTech);
  });

  it('leaves the state untouched for an unknown category', () => {
    const state = hydrated();
    const next = skillsReducer(
      state,
      addTechnology({ categoryId: 'mobile', technology: frontendTech })
    );
    expect(next).toEqual(state);
  });
});

describe('updateSkillCategory', () => {
  it('merges the patch into the matching category', () => {
    const state = hydrated();
    const next = skillsReducer(
      state,
      updateSkillCategory({ category: 'frontend', patch: { categoryName: 'Front UI' } })
    );
    expect(next.find((c) => c.category === 'frontend')?.categoryName).toBe('Front UI');
  });

  it('leaves other categories untouched (R-8 immutability)', () => {
    const state = hydrated();
    const beforeBackend = JSON.stringify(state.find((c) => c.category === 'backend'));
    const next = skillsReducer(
      state,
      updateSkillCategory({ category: 'frontend', patch: { categoryName: 'X' } })
    );
    expect(JSON.stringify(next.find((c) => c.category === 'backend'))).toBe(beforeBackend);
  });
});

describe('updateTechnology', () => {
  it('merges the patch into the matching technology', () => {
    const state = hydrated();
    const next = skillsReducer(
      state,
      updateTechnology({ categoryId: 'frontend', techName: 'React', patch: { invertInDark: true } })
    );
    const react = next
      .find((c) => c.category === 'frontend')
      ?.technologies.find((tech) => tech.name === 'React');
    expect(react?.invertInDark).toBe(true);
    expect(react?.iconSvg).toBe(
      SKILLS_DATA[0]?.technologies.find((t) => t.name === 'React')?.iconSvg
    );
  });

  it('leaves the state untouched for an unknown technology name', () => {
    const state = hydrated();
    const next = skillsReducer(
      state,
      updateTechnology({ categoryId: 'frontend', techName: 'Solid', patch: { invertInDark: true } })
    );
    expect(next).toEqual(state);
  });

  it('leaves the state untouched for an unknown category', () => {
    const state = hydrated();
    const next = skillsReducer(
      state,
      updateTechnology({ categoryId: 'mobile', techName: 'React', patch: { invertInDark: true } })
    );
    expect(next).toEqual(state);
  });
});

describe('deleteTechnology', () => {
  it('removes the technology by name inside the category', () => {
    const state = hydrated();
    const before = state.find((c) => c.category === 'frontend')?.technologies.length ?? 0;
    const next = skillsReducer(
      state,
      deleteTechnology({ categoryId: 'frontend', techName: 'React' })
    );
    const after = next.find((c) => c.category === 'frontend')?.technologies.length ?? 0;
    expect(after).toBe(before - 1);
  });

  it('leaves the state untouched for an unknown technology name', () => {
    const state = hydrated();
    const next = skillsReducer(
      state,
      deleteTechnology({ categoryId: 'frontend', techName: 'Solid' })
    );
    expect(next).toEqual(state);
  });
});

describe('deleteSkillCategory', () => {
  it('removes the whole category', () => {
    const state = hydrated();
    const next = skillsReducer(state, deleteSkillCategory('devops'));
    expect(next.some((c) => c.category === 'devops')).toBe(false);
    expect(next).toHaveLength(state.length - 1);
  });

  it('leaves the state untouched for an unknown category', () => {
    const state = hydrated();
    const next = skillsReducer(state, deleteSkillCategory('mobile'));
    expect(next).toEqual(state);
  });
});

describe('resetToDefaults', () => {
  it('returns the seed data', () => {
    const state = hydrated();
    const next = skillsReducer(state, resetToDefaults());
    expect(next).toEqual(SKILLS_DATA);
  });

  it('returns a CLONE — mutating the reset must not corrupt the seed constant', () => {
    const state = hydrated();
    const next = skillsReducer(state, resetToDefaults());
    expect(next).not.toBe(SKILLS_DATA);
    expect(next[0]).not.toBe(SKILLS_DATA[0]);
    expect(next[0]?.technologies).not.toBe(SKILLS_DATA[0]?.technologies);
  });
});
