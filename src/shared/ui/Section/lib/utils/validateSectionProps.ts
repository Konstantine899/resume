// src/shared/ui/Section/lib/utils/validateSectionProps.ts

import { SectionProps } from '../../model/types';
import { SECTION_CONSTANTS } from '../../model/constants';

/**
 * Dev-валидация props для Section
 * @description Проверяет variant, padding, size и as в development режиме
 *
 * @note ESLint no-console отключён — намеренное использование console.warn
 *       для dev-only валидации, которая удаляется в production сборке.
 */

/* eslint-disable no-console */

export const validateSectionProps = (props: SectionProps): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { variant, padding, size } = props;
  const as = props.as || 'section';

  if (variant && !SECTION_CONSTANTS.variants.includes(variant)) {
    console.warn(
      `Section: invalid variant "${variant}". Valid values: ${SECTION_CONSTANTS.variants.join(', ')}`
    );
  }

  if (padding && typeof padding === 'string' && !SECTION_CONSTANTS.paddings.includes(padding)) {
    console.warn(
      `Section: invalid padding "${padding}". Valid values: ${SECTION_CONSTANTS.paddings.join(', ')}`
    );
  }

  if (size && !SECTION_CONSTANTS.sizes.includes(size)) {
    console.warn(
      `Section: invalid size "${size}". Valid values: ${SECTION_CONSTANTS.sizes.join(', ')}`
    );
  }

  if (as && !SECTION_CONSTANTS.as.includes(as)) {
    console.warn(`Section: invalid as "${as}". Valid values: ${SECTION_CONSTANTS.as.join(', ')}`);
  }
};
