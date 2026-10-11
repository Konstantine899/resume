// ============================================
// technology form schema tests (WU-5, plan_skills_crud §7)
// + skills-icon-upload rev.2 (WU-2): iconSvg contract
// ============================================

import { describe, expect, it } from 'vitest';

import {
  emptyTechnologyFormValues,
  makeTechnologyFormSchema,
  toTechnologyFormValues,
} from './technologyFormSchema';

const VALID = {
  name: 'React',
  iconSvg: '/images/skills/react.svg',
  iconFilter: '',
  invertInDark: false,
};

describe('makeTechnologyFormSchema', () => {
  it('accepts a valid technology', () => {
    expect(makeTechnologyFormSchema([]).safeParse(VALID).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters (too_small)', () => {
    const result = makeTechnologyFormSchema([]).safeParse({ ...VALID, name: 'R' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'name');
      expect(issue?.code).toBe('too_small');
    }
  });

  it('rejects a name longer than 30 characters (too_big)', () => {
    const result = makeTechnologyFormSchema([]).safeParse({ ...VALID, name: 'x'.repeat(31) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'name');
      expect(issue?.code).toBe('too_big');
    }
  });

  it('rejects a duplicate name inside the category as a custom issue', () => {
    const result = makeTechnologyFormSchema(['React']).safeParse(VALID);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'name');
      expect(issue?.code).toBe('custom');
      expect(issue?.message).toBe('skillsErrTechExists');
    }
  });

  it('create mode: rejects an empty iconSvg (file required)', () => {
    const result = makeTechnologyFormSchema([]).safeParse({ ...VALID, iconSvg: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'iconSvg');
      expect(issue?.code).toBe('custom');
      expect(issue?.message).toBe('skillsErrIcon');
    }
  });

  it('create mode: rejects a bare legacy key — the form only accepts uploaded paths', () => {
    const result = makeTechnologyFormSchema([]).safeParse({ ...VALID, iconSvg: 'react' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'iconSvg');
      expect(issue?.message).toBe('skillsErrIcon');
    }
  });

  it('edit mode: accepts empty iconSvg (keep the current value)', () => {
    const result = makeTechnologyFormSchema([], 'edit').safeParse({ ...VALID, iconSvg: '' });
    expect(result.success).toBe(true);
  });

  it('edit mode: accepts an uploaded path over the previous value', () => {
    const result = makeTechnologyFormSchema([], 'edit').safeParse({
      ...VALID,
      iconSvg: '/images/skills/new-icon.svg',
    });
    expect(result.success).toBe(true);
  });

  it('edit mode: still rejects a bare key (no Select to produce one anymore)', () => {
    const result = makeTechnologyFormSchema([], 'edit').safeParse({ ...VALID, iconSvg: 'nodejs' });
    expect(result.success).toBe(false);
  });

  it('maps an empty iconFilter to undefined', () => {
    const result = makeTechnologyFormSchema([]).safeParse(VALID);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.iconFilter).toBeUndefined();
  });

  it('accepts a brightness( filter', () => {
    const result = makeTechnologyFormSchema([]).safeParse({
      ...VALID,
      iconFilter: 'brightness(0.9)',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.iconFilter).toBe('brightness(0.9)');
  });

  it('rejects a filter without brightness(/invert(', () => {
    const result = makeTechnologyFormSchema([]).safeParse({ ...VALID, iconFilter: 'blur(2px)' });
    expect(result.success).toBe(false);
  });

  it('rejects a filter longer than 200 characters', () => {
    const result = makeTechnologyFormSchema([]).safeParse({
      ...VALID,
      iconFilter: `brightness(${'0'.repeat(200)})`,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'iconFilter');
      expect(issue?.code).toBe('too_big');
    }
  });

  it('rejects a non-boolean invertInDark', () => {
    const result = makeTechnologyFormSchema([]).safeParse({ ...VALID, invertInDark: 'yes' });
    expect(result.success).toBe(false);
  });
});

describe('technology form value helpers', () => {
  it('empty values start with no icon file (create requires an upload)', () => {
    expect(emptyTechnologyFormValues()).toEqual({
      name: '',
      iconSvg: '',
      iconFilter: '',
      invertInDark: false,
    });
  });

  it('toTechnologyFormValues leaves iconSvg empty — the record stays until an upload (edit)', () => {
    expect(toTechnologyFormValues({ name: 'Node.js', iconSvg: 'nodejs' })).toEqual({
      name: 'Node.js',
      iconSvg: '',
      iconFilter: '',
      invertInDark: false,
    });
  });
});
