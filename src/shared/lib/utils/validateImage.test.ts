import { describe, it, expect } from 'vitest';
import { validateImage } from './validateImage';

describe('validateImage', () => {
  it('returns true for valid HTTP URL', () => {
    expect(validateImage('https://example.com/avatar.jpg')).toBe(true);
  });

  it('returns true for valid HTTPS URL', () => {
    expect(validateImage('http://example.com/image.png')).toBe(true);
  });

  it('returns true for relative path starting with /', () => {
    expect(validateImage('/assets/avatar.jpg')).toBe(true);
  });

  it('returns true for relative path starting with ./', () => {
    expect(validateImage('./images/avatar.jpg')).toBe(true);
  });

  it('returns true for relative path starting with ../', () => {
    expect(validateImage('../assets/avatar.jpg')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(validateImage('')).toBe(false);
  });

  it('returns false for invalid URL', () => {
    expect(validateImage('not-a-valid-url')).toBe(false);
  });

  it('returns false for data URL', () => {
    expect(validateImage('data:image/png;base64,abc123')).toBe(false);
  });

  it('returns false for ftp URL', () => {
    expect(validateImage('ftp://example.com/image.jpg')).toBe(false);
  });

  it('returns false for null', () => {
    expect(validateImage(null as any)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(validateImage(undefined as any)).toBe(false);
  });
});
