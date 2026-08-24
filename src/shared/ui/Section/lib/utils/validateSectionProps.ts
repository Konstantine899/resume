// src/shared/ui/Section/lib/utils/validateSectionProps.ts

import type { SectionProps } from '../../model/types';
import { SECTION_CONSTANTS } from '../../model/constants';

/**
 * Dev-валидация props для Section
 * @description Проверяет size и as в development режиме
 *
 * @remarks
 * - Runs ONLY when `process.env.NODE_ENV === 'development'`
 * - Uses `console.warn` (does NOT throw errors)
 * - Zero production overhead: function body is effectively a no-op in production
 * - Warning messages include valid values for quick debugging
 *
 * @param props - Section props to validate
 *
 * @example
 * ```typescript
 * // Development mode: logs warning
 * validateSectionProps({ size: 'invalid' })
 * // → console.warn: "Section: invalid size "invalid". Valid values: sm, md, lg, xl, xxl"
 *
 * // Production mode: no-op
 * validateSectionProps({ size: 'invalid' })
 * // → nothing happens
 * ```
 */

/* eslint-disable no-console */

export const validateSectionProps = (props: SectionProps): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { size, as } = props;

  if (size && !SECTION_CONSTANTS.sizes.includes(size)) {
    console.warn(
      `Section: invalid size "${size}". Valid values: ${SECTION_CONSTANTS.sizes.join(', ')}`
    );
  }

  const asValue = as || 'section';
  const validAs = ['section', 'div', 'article', 'aside', 'main', 'nav'] as const;
  if (asValue && !validAs.includes(asValue as (typeof validAs)[number])) {
    console.warn(`Section: invalid as "${asValue}". Valid values: ${validAs.join(', ')}`);
  }
};
