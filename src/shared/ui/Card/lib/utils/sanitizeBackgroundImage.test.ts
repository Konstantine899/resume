// ============================================
// sanitizeBackgroundImage Tests (CARD-P0-5)
// ============================================

import { describe, it, expect } from 'vitest';
import { sanitizeBackgroundImage } from './sanitizeBackgroundImage';

describe('sanitizeBackgroundImage', () => {
  it('returns null for empty/undefined', () => {
    expect(sanitizeBackgroundImage(undefined)).toBeNull();
    expect(sanitizeBackgroundImage('')).toBeNull();
    expect(sanitizeBackgroundImage('   ')).toBeNull();
  });

  it('rejects javascript: scheme without throwing', () => {
    // eslint-disable-next-line no-script-url
    expect(sanitizeBackgroundImage('javascript:alert(1)')).toBeNull();
  });

  it('rejects data: scheme without throwing', () => {
    expect(sanitizeBackgroundImage('data:image/svg+xml,...')).toBeNull();
  });

  it('rejects vbscript: scheme without throwing', () => {
    expect(sanitizeBackgroundImage('vbscript:msgbox(1)')).toBeNull();
  });

  it('rejects CSS breakout via quotes/parens', () => {
    expect(sanitizeBackgroundImage("x'); background:url(y)")).toBeNull();
    expect(sanitizeBackgroundImage('url("onerror")')).toBeNull();
  });

  it('allows same-origin relative path and escapes backslashes', () => {
    expect(sanitizeBackgroundImage('/images/foo.png')).toBe('url("/images/foo.png")');
    expect(sanitizeBackgroundImage('/a\\b/c.png')).toBe('url("/a\\\\b/c.png")');
  });

  it('rejects absolute http(s) URL when host not in allow-list (default restrictive)', () => {
    expect(sanitizeBackgroundImage('https://cdn.example.com/x.png')).toBeNull();
  });

  it('applies safe url() for allowed absolute host', () => {
    const result = sanitizeBackgroundImage('https://cdn.example.com/x.png', {
      allowedHosts: ['cdn.example.com'],
    });
    expect(result).toBe('url("https://cdn.example.com/x.png")');
  });

  it('rejects non-http(s) absolute URL', () => {
    expect(sanitizeBackgroundImage('ftp://example.com/x.png')).toBeNull();
  });
});
