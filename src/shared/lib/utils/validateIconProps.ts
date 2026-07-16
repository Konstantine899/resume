// ============================================
// validateIconProps Utility
// ============================================

import { ICON_CONSTANTS } from '@/shared/ui/Icon/model/constants';

/**
 * Validate icon component props in development mode
 *
 * @param color - Icon color to validate
 * @param size - Icon size to validate
 * @param strokeWidth - Icon stroke width to validate
 *
 * @example
 * ```tsx
 * validateIconProps('primary', 'md', 2);
 * // No warning — valid props
 * ```
 *
 * @example
 * ```tsx
 * validateIconProps('invalid-color', 'md', 2);
 * // Warns: Icon: invalid color "invalid-color"...
 * ```
 */
export const validateIconProps = (color?: string, size?: string | number, strokeWidth?: number) => {
  if (process.env.NODE_ENV !== 'development') return;

  const { VALID_COLORS, VALID_SIZES, VALID_STROKE_WIDTHS } = ICON_CONSTANTS;

  // Validate color (only for preset colors; custom CSS colors are allowed)
  if (color && typeof color === 'string') {
    // Check if it's a custom CSS color (starts with #, rgb, hsl, var)
    const isCustomColor = /^#|^rgb|^hsl|^var/.test(color);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!isCustomColor && !VALID_COLORS.includes(color as any)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Icon: invalid color "${color}". Valid preset colors: ${VALID_COLORS.join(', ')}, or any valid CSS color`
      );
    }
  }

  // Validate size (only for preset string sizes; numbers are allowed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (size && typeof size === 'string' && !VALID_SIZES.includes(size as any)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Icon: invalid size "${size}". Valid values: ${VALID_SIZES.join(', ')}, or a custom number`
    );
  }

  // Validate strokeWidth
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (strokeWidth !== undefined && !VALID_STROKE_WIDTHS.includes(strokeWidth as any)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Icon: invalid strokeWidth "${strokeWidth}". Valid values: ${VALID_STROKE_WIDTHS.join(', ')}`
    );
  }
};
