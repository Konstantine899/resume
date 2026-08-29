import { describe, expect, it } from 'vitest';
import { validateCardProps } from './validateCardProps';

describe('validateCardProps', () => {
  it('returns no warnings for valid props', () => {
    expect(validateCardProps('default', 'default', 'rounded')).toEqual([]);
  });

  it('warns on invalid variant', () => {
    expect(validateCardProps('bad', 'default', 'rounded').some((w) => w.prop === 'variant')).toBe(
      true
    );
  });

  it('warns on invalid size', () => {
    expect(validateCardProps('default', 'huge', 'rounded').some((w) => w.prop === 'size')).toBe(
      true
    );
  });

  it('warns on invalid radius', () => {
    expect(validateCardProps('default', 'default', 'circle').some((w) => w.prop === 'radius')).toBe(
      true
    );
  });

  it('does NOT warn for hoverable without onClick (CARD-P1-2 removed the flood)', () => {
    const warnings = validateCardProps('default', 'default', 'rounded');
    expect(warnings.some((w) => w.prop === 'onClick')).toBe(false);
  });
});
