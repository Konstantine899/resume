// ============================================
// technology form schema tests (WU-5, plan_skills_crud §7)
// ============================================

import { describe, expect, it } from 'vitest';

import {
  emptyTechnologyFormValues,
  makeTechnologyFormSchema,
  toTechnologyFormValues,
} from './technologyFormSchema';

const VALID = {
  name: 'React',
  iconSvg: 'react',
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

  it('rejects an icon key that is not among the available files', () => {
    const result = makeTechnologyFormSchema([]).safeParse({ ...VALID, iconSvg: 'unknown-icon' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'iconSvg');
      expect(issue?.code).toBe('custom');
      expect(issue?.message).toBe('skillsErrIcon');
    }
  });

  it('accepts an unknown stored icon when the caller widens knownIcons (edit mode)', () => {
    const result = makeTechnologyFormSchema([], ['react', 'legacy-unknown']).safeParse({
      ...VALID,
      iconSvg: 'legacy-unknown',
    });
    expect(result.success).toBe(true);
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
  it('empty values start blank with the first icon key', () => {
    expect(emptyTechnologyFormValues()).toEqual({
      name: '',
      iconSvg: expect.stringMatching(/^(?!.*\s)\S+$/),
      iconFilter: '',
      invertInDark: false,
    });
    expect(emptyTechnologyFormValues().iconSvg.length).toBeGreaterThan(0);
  });

  it('toTechnologyFormValues maps a record, defaulting optionals', () => {
    expect(toTechnologyFormValues({ name: 'Node.js', iconSvg: 'nodejs' })).toEqual({
      name: 'Node.js',
      iconSvg: 'nodejs',
      iconFilter: '',
      invertInDark: false,
    });
  });
});
