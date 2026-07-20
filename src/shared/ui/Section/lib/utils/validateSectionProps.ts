// src/shared/ui/Section/lib/utils/validateSectionProps.ts

import type { SectionProps } from '../../model/types';
import { SECTION_CONSTANTS } from '../../model/constants';

/**
 * Dev-валидация props для Section
 * @description Проверяет only as в development режиме
 *
 * @note ESLint no-console отключён — намеренное использование console.warn
 *       для dev-only валидации, которая удаляется в production сборке.
 */

/* eslint-disable no-console */

export const validateSectionProps = (props: SectionProps): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { size } = props;

  if (size && !SECTION_CONSTANTS.sizes.includes(size)) {
    console.warn(
      `Section: invalid size "${size}". Valid values: ${SECTION_CONSTANTS.sizes.join(', ')}`
    );
  }

  const as = props.as || 'section';
  const validAs = ['section', 'div', 'article', 'aside', 'main', 'nav'] as const;
  if (as && !validAs.includes(as as (typeof validAs)[number])) {
    console.warn(`Section: invalid as "${as}". Valid values: ${validAs.join(', ')}`);
  }
};
