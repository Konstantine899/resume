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

  it('warns when loading and disabled are combined', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, true, true);
    expect(
      warnings.some((w) => w.prop === 'loading' && w.message.includes('loading and disabled'))
    ).toBe(true);
  });

  it('does not warn when only loading is set', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, false, true);
    expect(warnings.some((w) => w.prop === 'loading')).toBe(false);
  });

  it('does not warn when only disabled is set', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, true, false);
    expect(warnings.some((w) => w.prop === 'loading')).toBe(false);
  });

  it('warns when asChild receives multiple children', () => {
    const warnings = validateInputProps(
      'default',
      'md',
      false,
      undefined,
      false,
      false,
      {},
      undefined,
      3
    );
    expect(
      warnings.some((w) => w.prop === 'children' && w.message.includes('exactly one child'))
    ).toBe(true);
  });

  it('does not warn when asChild receives exactly one child', () => {
    const warnings = validateInputProps(
      'default',
      'md',
      false,
      undefined,
      false,
      false,
      {},
      undefined,
      1
    );
    expect(warnings.some((w) => w.prop === 'children')).toBe(false);
  });

  it('does not warn about children when asChild is off', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, false, false, {
      label: 'Email',
    });
    expect(warnings.some((w) => w.prop === 'children')).toBe(false);
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

  it('warns when accessible name is whitespace-only', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, false, false, {
      label: '   ',
    });
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

  it('does not warn in asChild mode when the child carries an accessible name', () => {
    const warnings = validateInputProps(
      'default',
      'md',
      false,
      undefined,
      false,
      false,
      {},
      {
        ariaLabel: 'Search',
      }
    );
    expect(
      warnings.some((w) => w.prop === 'label' && w.message.includes('Missing accessible name'))
    ).toBe(false);
  });

  it('does not warn in asChild mode when the child carries aria-labelledby', () => {
    const warnings = validateInputProps(
      'default',
      'md',
      false,
      undefined,
      false,
      false,
      {},
      {
        ariaLabelledby: 'search-label',
      }
    );
    expect(
      warnings.some((w) => w.prop === 'label' && w.message.includes('Missing accessible name'))
    ).toBe(false);
  });

  it('warns in asChild mode when neither the Input nor the child has a name', () => {
    const warnings = validateInputProps('default', 'md', false, undefined, false, false, {}, {});
    expect(
      warnings.some((w) => w.prop === 'label' && w.message.includes('Missing accessible name'))
    ).toBe(true);
  });

  it('prioritizes the Input name when both Input and child provide one', () => {
    const warnings = validateInputProps(
      'default',
      'md',
      false,
      undefined,
      false,
      false,
      {
        label: 'Email',
      },
      {
        ariaLabel: 'Search',
      }
    );
    expect(
      warnings.some((w) => w.prop === 'label' && w.message.includes('Missing accessible name'))
    ).toBe(false);
  });
});
