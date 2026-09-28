// src/shared/lib/utils/externalLink.test.ts

// Disable no-script-url: dangerous javascript:/data: values are intentional
// test fixtures for the scheme allow-list — asserting they are REJECTED.
/* eslint-disable no-script-url */

import { describe, expect, it } from 'vitest';
import {
  getExternalLinkProps,
  hasSafeUrlScheme,
  isExternalLink,
  sanitizeHref,
} from './externalLink';

describe('isExternalLink', () => {
  it('should return true for https:// URLs', () => {
    expect(isExternalLink('https://github.com')).toBe(true);
  });

  it('should return true for http:// URLs', () => {
    expect(isExternalLink('http://example.com')).toBe(true);
  });

  it('should return false for relative paths', () => {
    expect(isExternalLink('/about')).toBe(false);
  });

  it('should return false for hash fragments', () => {
    expect(isExternalLink('#main-content')).toBe(false);
  });

  it('should return false for protocol-relative and bare values', () => {
    expect(isExternalLink('//cdn.example.com/lib.js')).toBe(false);
    expect(isExternalLink('')).toBe(false);
  });
});

describe('getExternalLinkProps', () => {
  it('should return target="_blank" with noopener noreferrer', () => {
    expect(getExternalLinkProps()).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('should merge caller rel with noopener noreferrer', () => {
    const props = getExternalLinkProps('nofollow');

    expect(props.target).toBe('_blank');
    expect(props.rel).toContain('nofollow');
    expect(props.rel).toContain('noopener');
    expect(props.rel).toContain('noreferrer');
  });

  it('should keep the rel tokens order: caller first, then security tokens', () => {
    expect(getExternalLinkProps('nofollow').rel).toBe('nofollow noopener noreferrer');
  });
});

describe('hasSafeUrlScheme', () => {
  it('should allow http:// and https://', () => {
    expect(hasSafeUrlScheme('https://github.com')).toBe(true);
    expect(hasSafeUrlScheme('http://example.com')).toBe(true);
  });

  it('should allow mailto: and tel:', () => {
    expect(hasSafeUrlScheme('mailto:hi@example.com')).toBe(true);
    expect(hasSafeUrlScheme('tel:+15551234567')).toBe(true);
  });

  it('should allow relative paths and hash fragments', () => {
    expect(hasSafeUrlScheme('/about')).toBe(true);
    expect(hasSafeUrlScheme('#main-content')).toBe(true);
  });

  it('should allow scheme-less values', () => {
    expect(hasSafeUrlScheme('example.com/page')).toBe(true);
  });

  it('should reject javascript: URIs', () => {
    expect(hasSafeUrlScheme('javascript:alert(1)')).toBe(false);
  });

  it('should reject data: URIs', () => {
    expect(hasSafeUrlScheme('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('should reject vbscript: and other unknown schemes', () => {
    expect(hasSafeUrlScheme('vbscript:msgbox(1)')).toBe(false);
  });
});

describe('sanitizeHref', () => {
  it('should return safe hrefs untouched', () => {
    expect(sanitizeHref('https://github.com')).toBe('https://github.com');
    expect(sanitizeHref('/about')).toBe('/about');
  });

  it('should return undefined for dangerous schemas', () => {
    expect(sanitizeHref('javascript:alert(1)')).toBeUndefined();
    expect(sanitizeHref('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('should pass through undefined and empty href', () => {
    expect(sanitizeHref(undefined)).toBeUndefined();
    expect(sanitizeHref('')).toBe('');
  });
});
