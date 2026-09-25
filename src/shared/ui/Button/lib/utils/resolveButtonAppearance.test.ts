// src/shared/ui/Button/lib/utils/resolveButtonAppearance.test.ts

import { describe, expect, it } from 'vitest';
import { resolveButtonAppearance } from './resolveButtonAppearance';

describe('resolveButtonAppearance', () => {
  it('passes a non-danger variant through unchanged', () => {
    expect(resolveButtonAppearance('outline')).toEqual({
      variant: 'outline',
      colorScheme: undefined,
    });
  });

  it('keeps an explicitly provided colorScheme', () => {
    expect(resolveButtonAppearance('outline', 'success')).toEqual({
      variant: 'outline',
      colorScheme: 'success',
    });
  });

  it('maps variant="danger" to primary + danger', () => {
    expect(resolveButtonAppearance('danger')).toEqual({
      variant: 'primary',
      colorScheme: 'danger',
    });
  });

  it('lets an explicit colorScheme win over the derived danger scheme', () => {
    expect(resolveButtonAppearance('danger', 'brand')).toEqual({
      variant: 'primary',
      colorScheme: 'brand',
    });
  });

  it('is idempotent for the danger mapping', () => {
    const once = resolveButtonAppearance('danger');

    expect(resolveButtonAppearance(once.variant, once.colorScheme)).toEqual(once);
  });

  it('is idempotent for a plain appearance', () => {
    const once = resolveButtonAppearance('primary', 'success');

    expect(resolveButtonAppearance(once.variant, once.colorScheme)).toEqual(once);
  });
});
