import { describe, it, expect } from 'vitest';
import { getColorValue, getSizeInPixels, ICON_COLORS, ICON_SIZES } from './constants';

describe('Icon Constants', () => {
  describe('ICON_SIZES', () => {
    it('contains correct size mappings', () => {
      expect(ICON_SIZES).toEqual({
        xs: 12,
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32,
      });
    });
  });

  describe('ICON_COLORS', () => {
    it('contains correct color mappings', () => {
      expect(ICON_COLORS).toEqual({
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        foreground: 'var(--foreground)',
        'foreground-muted': 'var(--foreground-muted)',
        inherit: 'currentColor',
      });
    });
  });

  describe('getSizeInPixels', () => {
    it('returns number size as-is', () => {
      expect(getSizeInPixels(24)).toBe(24);
      expect(getSizeInPixels(48)).toBe(48);
      expect(getSizeInPixels(100)).toBe(100);
    });

    it('returns preset size xs', () => {
      expect(getSizeInPixels('xs')).toBe(12);
    });

    it('returns preset size sm', () => {
      expect(getSizeInPixels('sm')).toBe(16);
    });

    it('returns preset size md', () => {
      expect(getSizeInPixels('md')).toBe(20);
    });

    it('returns preset size lg', () => {
      expect(getSizeInPixels('lg')).toBe(24);
    });

    it('returns preset size xl', () => {
      expect(getSizeInPixels('xl')).toBe(32);
    });

    it('returns default size md for invalid input', () => {
      expect(getSizeInPixels('invalid' as any)).toBe(20);
      expect(getSizeInPixels(null as any)).toBe(20);
      expect(getSizeInPixels(undefined as any)).toBe(20);
    });
  });

  describe('getColorValue', () => {
    it('returns CSS variable for preset color primary', () => {
      expect(getColorValue('primary')).toBe('var(--primary)');
    });

    it('returns CSS variable for preset color secondary', () => {
      expect(getColorValue('secondary')).toBe('var(--secondary)');
    });

    it('returns CSS variable for preset color accent', () => {
      expect(getColorValue('accent')).toBe('var(--accent)');
    });

    it('returns CSS variable for preset color success', () => {
      expect(getColorValue('success')).toBe('var(--success)');
    });

    it('returns CSS variable for preset color danger', () => {
      expect(getColorValue('danger')).toBe('var(--danger)');
    });

    it('returns CSS variable for preset color warning', () => {
      expect(getColorValue('warning')).toBe('var(--warning)');
    });

    it('returns CSS variable for preset color foreground', () => {
      expect(getColorValue('foreground')).toBe('var(--foreground)');
    });

    it('returns CSS variable for preset color foreground-muted', () => {
      expect(getColorValue('foreground-muted')).toBe('var(--foreground-muted)');
    });

    it('returns currentColor for preset color inherit', () => {
      expect(getColorValue('inherit')).toBe('currentColor');
    });

    it('returns custom CSS color string', () => {
      expect(getColorValue('#ff0000')).toBe('#ff0000');
      expect(getColorValue('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
      expect(getColorValue('rgba(255, 0, 0, 0.5)')).toBe('rgba(255, 0, 0, 0.5)');
      expect(getColorValue('blue')).toBe('blue');
    });

    it('returns custom color for invalid preset', () => {
      expect(getColorValue('invalid-color')).toBe('invalid-color');
    });
  });
});
