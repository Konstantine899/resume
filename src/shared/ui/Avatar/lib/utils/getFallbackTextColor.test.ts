import { describe, expect, it } from 'vitest';
import { FALLBACK_COLORS } from '@/shared/ui/Avatar/model/constants';
import { getFallbackTextColor } from './getFallbackTextColor';

const toLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const luminance = (hex: string): number => {
  const short = hex.replace('#', '');
  const raw =
    short.length === 3
      ? short
          .split('')
          .map((c) => c + c)
          .join('')
      : short;
  const r = Number.parseInt(raw.slice(0, 2), 16) / 255;
  const g = Number.parseInt(raw.slice(2, 4), 16) / 255;
  const b = Number.parseInt(raw.slice(4, 6), 16) / 255;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

const contrast = (a: string, b: string): number => {
  const la = luminance(a);
  const lb = luminance(b);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
};

describe('getFallbackTextColor', () => {
  it('возвращает #fff или #000 для каждого цвета палитры', () => {
    for (const bg of FALLBACK_COLORS) {
      expect(['#fff', '#000']).toContain(getFallbackTextColor(bg));
    }
  });

  it('каждая пара фон+текст достигает WCAG AA (4.5:1)', () => {
    for (const bg of FALLBACK_COLORS) {
      expect(contrast(getFallbackTextColor(bg), bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('выбранный текст контрастнее альтернативы (максимум из white/black)', () => {
    for (const bg of FALLBACK_COLORS) {
      const chosen = contrast(getFallbackTextColor(bg), bg);
      expect(chosen).toBeGreaterThanOrEqual(contrast('#fff', bg));
      expect(chosen).toBeGreaterThanOrEqual(contrast('#000', bg));
    }
  });
});
