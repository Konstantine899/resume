// src/shared/lib/utils/externalLink.test.ts

import { describe, expect, it } from 'vitest';
import { getExternalLinkProps, isExternalLink } from './externalLink';

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
