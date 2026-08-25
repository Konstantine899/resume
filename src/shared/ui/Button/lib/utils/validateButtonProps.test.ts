import { describe, expect, it } from 'vitest';
import { validateButtonProps } from './validateButtonProps';

describe('validateButtonProps', () => {
  it('returns no warnings for valid props', () => {
    expect(validateButtonProps('primary', 'md', 'spinner')).toEqual([]);
  });

  it('warns on invalid variant', () => {
    expect(validateButtonProps('bad', 'md', 'spinner').some((w) => w.prop === 'variant')).toBe(
      true
    );
  });

  it('warns on invalid size', () => {
    expect(validateButtonProps('primary', 'xxl', 'spinner').some((w) => w.prop === 'size')).toBe(
      true
    );
  });

  it('warns on invalid loadingVariant', () => {
    expect(
      validateButtonProps('primary', 'md', 'pulse').some((w) => w.prop === 'loadingVariant')
    ).toBe(true);
  });

  it('warns when loadingVariant is skeleton but loading is false', () => {
    expect(
      validateButtonProps('primary', 'md', 'skeleton', false).some((w) => w.prop === 'loading')
    ).toBe(true);
  });

  it('warns on invalid colorScheme', () => {
    expect(
      validateButtonProps('primary', 'md', 'spinner', true, 'pink').some(
        (w) => w.prop === 'colorScheme'
      )
    ).toBe(true);
  });

  it('does not warn for a valid colorScheme', () => {
    expect(
      validateButtonProps('primary', 'md', 'spinner', true, 'brand').some(
        (w) => w.prop === 'colorScheme'
      )
    ).toBe(false);
  });
});
