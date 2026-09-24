// src/shared/ui/Image/lib/utils/sanitizeImageSrc.test.ts

import { describe, expect, it } from 'vitest';
import { isSafeImageSource, sanitizeImageSrc, sanitizeImageSrcSet } from './sanitizeImageSrc';

// Disable no-script-url: dangerous javascript:/data: SVG values are intentional
// test fixtures for the src allow-list — asserting they are REJECTED.
/* eslint-disable no-script-url */

describe('isSafeImageSource', () => {
  it('accepts absolute http(s) URLs', () => {
    expect(isSafeImageSource('https://example.com/photo.jpg')).toBe(true);
    expect(isSafeImageSource('http://cdn.example.org/img.webp')).toBe(true);
  });

  it('accepts relative paths', () => {
    expect(isSafeImageSource('/images/photo.png')).toBe(true);
    expect(isSafeImageSource('./photo.jpg')).toBe(true);
    expect(isSafeImageSource('../assets/photo.webp')).toBe(true);
    expect(isSafeImageSource('photo.avif')).toBe(true);
  });

  it('accepts raster data-URIs', () => {
    expect(isSafeImageSource('data:image/png;base64,iVBORw0KGgo=')).toBe(true);
    expect(isSafeImageSource('data:image/jpeg;base64,/9j/4AAQSkZJRg==')).toBe(true);
    expect(isSafeImageSource('data:image/webp;base64,UklGR')).toBe(true);
    expect(isSafeImageSource('data:image/gif;base64,R0lGODlh')).toBe(true);
    expect(isSafeImageSource('data:image/avif;base64,AAAAIGZ0eXB')).toBe(true);
  });

  it('rejects SVG data-URIs (XSS vector, issue #59)', () => {
    expect(isSafeImageSource('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).toBe(false);
    expect(
      isSafeImageSource(
        `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`
      )
    ).toBe(false);
  });

  it('rejects other data-URI MIME types', () => {
    expect(isSafeImageSource('data:text/html;base64,PGh0bWw+')).toBe(false);
    expect(isSafeImageSource('data:application/xml;base64,PD94bWw+')).toBe(false);
  });

  it('rejects dangerous URL schemes', () => {
    expect(isSafeImageSource('javascript:alert(1)')).toBe(false);
    expect(isSafeImageSource('vbscript:msgbox(1)')).toBe(false);
  });

  it('rejects empty and undefined values', () => {
    expect(isSafeImageSource(undefined)).toBe(false);
    expect(isSafeImageSource('')).toBe(false);
    expect(isSafeImageSource('   ')).toBe(false);
  });

  it('rejects data-URI without a known MIME type', () => {
    expect(isSafeImageSource('data:image/svg+xml')).toBe(false);
    expect(isSafeImageSource('data:foo/bar;base64,AAAA')).toBe(false);
  });
});

describe('sanitizeImageSrc', () => {
  it('returns safe values untouched', () => {
    expect(sanitizeImageSrc('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
    expect(sanitizeImageSrc('/images/photo.png')).toBe('/images/photo.png');
    expect(sanitizeImageSrc('data:image/png;base64,iVBORw0KGgo=')).toBe(
      'data:image/png;base64,iVBORw0KGgo='
    );
  });

  it('returns undefined for SVG data-URIs', () => {
    expect(sanitizeImageSrc('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).toBeUndefined();
  });

  it('returns undefined for dangerous schemes', () => {
    expect(sanitizeImageSrc('javascript:alert(1)')).toBeUndefined();
  });

  it('returns undefined for empty values', () => {
    expect(sanitizeImageSrc('')).toBeUndefined();
    expect(sanitizeImageSrc(undefined)).toBeUndefined();
  });
});

describe('sanitizeImageSrcSet', () => {
  it('returns safe srcSet untouched', () => {
    expect(sanitizeImageSrcSet('/photo.jpg 1x, /photo@2x.jpg 2x')).toBe(
      '/photo.jpg 1x, /photo@2x.jpg 2x'
    );
    expect(sanitizeImageSrcSet('https://cdn.example.com/photo.webp 1x')).toBe(
      'https://cdn.example.com/photo.webp 1x'
    );
  });

  it('returns undefined for SVG data-URI in srcSet', () => {
    expect(
      sanitizeImageSrcSet('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4= 1x, /photo@2x.jpg 2x')
    ).toBeUndefined();
  });

  it('returns undefined for empty values', () => {
    expect(sanitizeImageSrcSet(undefined)).toBeUndefined();
    expect(sanitizeImageSrcSet('')).toBe('');
  });
});
