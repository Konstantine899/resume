// ============================================
// validateHeadingProps Utility
// ============================================

import {
  HEADING_LEVELS,
  HEADING_SIZES,
  HEADING_THEMES,
  HEADING_ALIGNS,
} from '@/shared/ui/Heading/model/constants';
import type {
  HeadingAlign,
  HeadingLevel,
  HeadingSize,
  HeadingTheme,
} from '@/shared/ui/Heading/model/types';

/**
 * Validate heading component props in development mode
 *
 * @param level - Heading level (h1-h6)
 * @param size - Heading visual size
 * @param theme - Heading color theme
 * @param align - Heading text alignment
 * @param children - Heading content
 *
 * @example
 * ```tsx
 * validateHeadingProps(1, 'invalid', 'primary', 'left', 'Hello');
 * // Warns: Heading: invalid size "invalid"...
 * ```
 */
export const validateHeadingProps = (
  level?: HeadingLevel,
  size?: HeadingSize,
  theme?: HeadingTheme,
  align?: HeadingAlign,
  children?: React.ReactNode
) => {
  if (process.env.NODE_ENV !== 'development') return;

  if (level && !HEADING_LEVELS.includes(level)) {
    // eslint-disable-next-line no-console
    console.warn(`Heading: invalid level "${level}". Valid values: ${HEADING_LEVELS.join(', ')}`);
  }

  if (size && !HEADING_SIZES.includes(size)) {
    // eslint-disable-next-line no-console
    console.warn(`Heading: invalid size "${size}". Valid values: ${HEADING_SIZES.join(', ')}`);
  }

  if (theme && !HEADING_THEMES.includes(theme)) {
    // eslint-disable-next-line no-console
    console.warn(`Heading: invalid theme "${theme}". Valid values: ${HEADING_THEMES.join(', ')}`);
  }

  if (align && !HEADING_ALIGNS.includes(align)) {
    // eslint-disable-next-line no-console
    console.warn(`Heading: invalid align "${align}". Valid values: ${HEADING_ALIGNS.join(', ')}`);
  }

  if (!children) {
    // eslint-disable-next-line no-console
    console.warn('Heading: children prop is required but was not provided');
  }
};
