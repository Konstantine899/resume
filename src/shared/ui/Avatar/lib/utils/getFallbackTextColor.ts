// ============================================
// getFallbackTextColor Utility
// ============================================

const toLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

/**
 * Pick an AA-compliant foreground for a fallback background color.
 *
 * FALLBACK_COLORS are theme-independent, while `--color-text-inverse` flips
 * with the theme (white in light, near-black in dark), so a single
 * theme-driven foreground always fails on part of the palette
 * (white on #FDE3A7 = 1.26:1, near-black on #663399 = 2.43:1).
 * The foreground is therefore derived from the background's own luminance.
 *
 * @param backgroundColor - Hex color code (FALLBACK_COLORS entry)
 * @returns '#fff' or '#000' — whichever yields the higher contrast ratio
 */
export const getFallbackTextColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;

  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // White/black contrast crossover over this background:
  // (L + 0.05)^2 = 0.0525 → L ≈ 0.179.
  return luminance <= 0.179 ? '#fff' : '#000';
};
