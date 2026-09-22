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

  it('warns when no accessible name (label/aria-label/aria-labelledby) is provided', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, false, false, {});
    expect(
      warnings.some((w) => w.prop === 'label' && w.message.includes('Missing accessible name'))
    ).toBe(true);
  });

  it('does not warn when label is provided', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, false, false, {
      label: 'Email',
    });
    expect(
      warnings.some((w) => w.prop === 'label' && w.message.includes('Missing accessible name'))
    ).toBe(false);
  });

  it('does not warn when aria-label is provided', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, false, false, {
      ariaLabel: 'Search',
    });
    expect(
      warnings.some((w) => w.prop === 'label' && w.message.includes('Missing accessible name'))
    ).toBe(false);
  });

  it('does not warn when aria-labelledby is provided', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, false, false, {
      ariaLabelledby: 'field-label',
    });
    expect(
      warnings.some((w) => w.prop === 'label' && w.message.includes('Missing accessible name'))
    ).toBe(false);
  });
});
