import { describe, expect, it } from 'vitest';
import { validateInputProps } from './validateInputProps';

describe('validateInputProps', () => {
  it('returns no warnings for valid props', () => {
    expect(validateInputProps('default', 'md')).toEqual([]);
  });

  it('warns on invalid variant', () => {
    expect(validateInputProps('bad', 'md').some((w) => w.prop === 'variant')).toBe(true);
  });

  it('warns on invalid size', () => {
    expect(validateInputProps('default', 'xxl').some((w) => w.prop === 'size')).toBe(true);
  });

  it('warns when showCounter is set without maxLength', () => {
    expect(validateInputProps('default', 'md', true).some((w) => w.prop === 'maxLength')).toBe(
      true
    );
  });

  it('does not warn when showCounter has maxLength', () => {
    expect(validateInputProps('default', 'md', true, 10).some((w) => w.prop === 'maxLength')).toBe(
      false
    );
  });
});
