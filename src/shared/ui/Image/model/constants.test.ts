import { describe, expect, it } from 'vitest';
import { VALIDATION_MESSAGES } from './constants';

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
