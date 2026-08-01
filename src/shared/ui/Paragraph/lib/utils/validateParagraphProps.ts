// src/shared/ui/Paragraph/lib/utils/validateParagraphProps.ts

import type {
  LineClamp,
  ParagraphAlign,
  ParagraphSize,
  ParagraphTheme,
  ParagraphWeight,
  ParagraphWrap,
} from '../../model/types';
import {
  isValidLineClamp,
  PARAGRAPH_ALIGNS,
  PARAGRAPH_SIZES,
  PARAGRAPH_THEMES,
  PARAGRAPH_WEIGHTS,
  PARAGRAPH_WRAPS,
} from '../../model/constants';

/**
 * Props, которые валидирует validateParagraphProps
 */
export interface ParagraphValidationProps {
  size?: ParagraphSize;
  theme?: ParagraphTheme;
  align?: ParagraphAlign;
  weight?: ParagraphWeight;
  wrap?: ParagraphWrap;
  truncate?: boolean;
  lineClamp?: LineClamp;
}

/**
 * Dev-валидация props для Paragraph
 * @description Проверяет size/theme/align/weight/wrap, lineClamp (2-5)
 * и конфликт truncate + lineClamp в development режиме
 *
 * @remarks
 * - Runs ONLY when `process.env.NODE_ENV === 'development'`
 * - Uses `console.warn` (does NOT throw errors)
 * - Zero production overhead: function body is effectively a no-op in production
 * - Warning messages include valid values for quick debugging
 *
 * @param props - Paragraph props to validate
 *
 * @example
 * ```typescript
 * // Development mode: logs warning
 * validateParagraphProps({ size: 'invalid' })
 * // → console.warn: "Paragraph: invalid size "invalid". Valid values: xs, s, m, l, xl, 2xl"
 *
 * // Production mode: no-op
 * validateParagraphProps({ size: 'invalid' })
 * // → nothing happens
 * ```
 */

/* eslint-disable no-console */

export const validateParagraphProps = (props: ParagraphValidationProps): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { size, theme, align, weight, wrap, truncate, lineClamp } = props;

  if (size && !PARAGRAPH_SIZES.includes(size)) {
    console.warn(`Paragraph: invalid size "${size}". Valid values: ${PARAGRAPH_SIZES.join(', ')}`);
  }

  if (theme && !PARAGRAPH_THEMES.includes(theme)) {
    console.warn(
      `Paragraph: invalid theme "${theme}". Valid values: ${PARAGRAPH_THEMES.join(', ')}`
    );
  }

  if (align && !PARAGRAPH_ALIGNS.includes(align)) {
    console.warn(
      `Paragraph: invalid align "${align}". Valid values: ${PARAGRAPH_ALIGNS.join(', ')}`
    );
  }

  if (weight && !PARAGRAPH_WEIGHTS.includes(weight)) {
    console.warn(
      `Paragraph: invalid weight "${weight}". Valid values: ${PARAGRAPH_WEIGHTS.join(', ')}`
    );
  }

  if (wrap && !PARAGRAPH_WRAPS.includes(wrap)) {
    console.warn(`Paragraph: invalid wrap "${wrap}". Valid values: ${PARAGRAPH_WRAPS.join(', ')}`);
  }

  // lineClamp validation (2-5), preserved from Paragraph.tsx
  if (lineClamp && !isValidLineClamp(lineClamp)) {
    console.warn(`Paragraph: lineClamp должен быть от 2 до 5, получено: ${lineClamp}`);
  }

  // truncate/lineClamp conflict warn, preserved from Paragraph.tsx
  if (truncate && lineClamp) {
    console.warn(
      'Paragraph: truncate и lineClamp не могут быть использованы одновременно.' +
        ' Будет использован truncate.'
    );
  }
};
