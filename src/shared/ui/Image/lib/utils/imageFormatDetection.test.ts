import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as imageFormatDetection from './imageFormatDetection';

// jsdom не умеет canvas 2d (getContext возвращает null без пакета canvas)
// и canvas.toDataURL('image/webp'|'image/avif') — мокаем современный браузер:
// getContext → пустой 2d-контекст, toDataURL(type) → data:type.

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => ({}) as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function (
    this: HTMLCanvasElement,
    type?: string
  ) {
    return `data:${type ?? 'image/png'}`;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Image format detection (requirement #11)', () => {
  describe('canUseWebp', () => {
    it('returns boolean', () => {
      const result = imageFormatDetection.canUseWebp();
      expect(typeof result).toBe('boolean');
    });

    it('returns true in modern browsers', () => {
      const result = imageFormatDetection.canUseWebp();
      expect(result).toBe(true);
    });
  });

  describe('canUseAvif', () => {
    it('returns boolean', () => {
      const result = imageFormatDetection.canUseAvif();
      expect(typeof result).toBe('boolean');
    });

    it('returns true in modern browsers', () => {
      const result = imageFormatDetection.canUseAvif();
      expect(result).toBe(true);
    });
  });

  describe('getOptimalImageFormat', () => {
    it('returns avif, webp, or jpeg', () => {
      const result = imageFormatDetection.getOptimalImageFormat();
      expect(['avif', 'webp', 'jpeg']).toContain(result);
    });

    it('prefers avif over webp', () => {
      const result = imageFormatDetection.getOptimalImageFormat();
      expect(result).toBe('avif');
    });
  });

  describe('generateResponsiveSrcSet', () => {
    it('returns array of srcSet configurations', () => {
      const result = imageFormatDetection.generateResponsiveSrcSet('/images/photo');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes srcSet with multiple resolutions', () => {
      const result = imageFormatDetection.generateResponsiveSrcSet('/images/photo');
      const [first] = result;
      expect(first?.srcSet).toContain('1x');
      expect(first?.srcSet).toContain('2x');
      expect(first?.srcSet).toContain('3x');
    });

    it('includes sizes attribute', () => {
      const result = imageFormatDetection.generateResponsiveSrcSet('/images/photo');
      const [first] = result;
      expect(first?.sizes).toContain('max-width');
    });

    it('includes type attribute', () => {
      const result = imageFormatDetection.generateResponsiveSrcSet('/images/photo');
      const [first] = result;
      expect(first?.type).toMatch(/^image\/(avif|webp|jpeg)$/);
    });
  });
});
