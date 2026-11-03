import { describe, expect, it } from 'vitest';
import {
  emptyTechnologyFormValues,
  makeTechnologyFormSchema,
  toTechnologyFormValues,
} from './technologyFormSchema';

const VALID = { techKey: 'react', invertInDark: false };

describe('makeTechnologyFormSchema', () => {
  it('accepts a valid technology', () => {
    expect(makeTechnologyFormSchema([], ['react']).safeParse(VALID).success).toBe(true);
  });

  it('rejects an empty techKey (not selected)', () => {
    const result = makeTechnologyFormSchema([], ['react']).safeParse({ ...VALID, techKey: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a techKey that is not in the technology catalog', () => {
    const result = makeTechnologyFormSchema([], ['react']).safeParse({
      techKey: 'nodejs',
      invertInDark: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'techKey');
      expect(issue?.message).toBe('skillsErrTechName');
    }
  });

  it('rejects a duplicated tech key in create mode', () => {
    const result = makeTechnologyFormSchema(['react'], ['react'], 'create').safeParse(VALID);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((entry) => entry.path[0] === 'techKey');
      expect(issue?.message).toBe('skillsErrTechExists');
    }
  });

  it('edit mode accepts the current selected key', () => {
    expect(makeTechnologyFormSchema(['react'], ['react'], 'edit').safeParse(VALID).success).toBe(
      true
    );
  });

  it('rejects a non-boolean invertInDark', () => {
    const result = makeTechnologyFormSchema([], ['react']).safeParse({
      ...VALID,
      invertInDark: 'yes',
    });
    expect(result.success).toBe(false);
  });
});

describe('technology form value helpers', () => {
  it('empty values start without a selected technology', () => {
    expect(emptyTechnologyFormValues()).toEqual({ techKey: '', invertInDark: false });
  });

  it('toTechnologyFormValues uses the stored catalog key', () => {
    expect(
      toTechnologyFormValues({
        name: 'Node.js',
        iconSvg: '/images/node.svg',
        invertInDark: true,
        techKey: 'nodejs',
      } as never)
    ).toEqual({ techKey: 'nodejs', invertInDark: true });
  });
});
