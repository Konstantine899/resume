import { describe, it, expect } from 'vitest';
import { getImageWithFallback } from './getImageWithFallback';

describe('getImageWithFallback', () => {
  it('returns primary URL when provided', () => {
    const result = getImageWithFallback({
      primary: '/avatar.jpg',
      fallback: '/default.png',
    });
    expect(result).toBe('/avatar.jpg');
  });

  it('returns fallback when primary is undefined', () => {
    const result = getImageWithFallback({
      primary: undefined,
      fallback: '/default.png',
    });
    expect(result).toBe('/default.png');
  });

  it('returns fallback when primary is empty string', () => {
    const result = getImageWithFallback({
      primary: '',
      fallback: '/default.png',
    });
    expect(result).toBe('/default.png');
  });

  it('returns placeholder when primary is undefined and placeholder provided', () => {
    const result = getImageWithFallback({
      primary: undefined,
      fallback: '/default.png',
      placeholder: '/placeholder.svg',
    });
    expect(result).toBe('/placeholder.svg');
  });

  it('returns primary even when placeholder is provided', () => {
    const result = getImageWithFallback({
      primary: '/avatar.jpg',
      fallback: '/default.png',
      placeholder: '/placeholder.svg',
    });
    expect(result).toBe('/avatar.jpg');
  });

  it('uses default fallback when not provided', () => {
    const result = getImageWithFallback({
      primary: undefined,
    });
    expect(result).toBe('/placeholder.svg');
  });

  it('returns empty string when primary is empty and no fallbacks', () => {
    const result = getImageWithFallback({
      primary: '',
    });
    expect(result).toBe('/placeholder.svg');
  });
});
