import { describe, expect, it } from 'vitest';
import { IMAGE_VARIANTS, IMAGE_VARIANT_RADIUS, VALIDATION_MESSAGES } from './constants';

describe('Image variant constants', () => {
  it('registers the transparent variant with zero border-radius', () => {
    expect(IMAGE_VARIANTS).toContain('transparent');
    expect(IMAGE_VARIANT_RADIUS.transparent).toBe('0');
  });

  it('keeps a radius entry for every registered variant', () => {
    for (const variant of IMAGE_VARIANTS) {
      expect(IMAGE_VARIANT_RADIUS[variant]).toBeDefined();
    }
  });
});

describe('Image VALIDATION_MESSAGES', () => {
  it('builds dynamic messages that include the offending value', () => {
    expect(VALIDATION_MESSAGES.INVALID_VARIANT('x')).toContain('x');
    expect(VALIDATION_MESSAGES.INVALID_SIZE('x')).toContain('x');
    expect(VALIDATION_MESSAGES.INVALID_OBJECT_FIT('x')).toContain('x');
    expect(VALIDATION_MESSAGES.INVALID_PLACEHOLDER('x')).toContain('x');
    expect(VALIDATION_MESSAGES.INVALID_LAZY_MODE('x')).toContain('x');
  });

  it('exposes static messages', () => {
    expect(VALIDATION_MESSAGES.MISSING_ALT).toContain('alt');
    expect(VALIDATION_MESSAGES.INVALID_SRC).toContain('src');
    expect(VALIDATION_MESSAGES.NEGATIVE_BLUR).toContain('blurAmount');
    expect(VALIDATION_MESSAGES.INVALID_QUALITY).toContain('quality');
  });
});
