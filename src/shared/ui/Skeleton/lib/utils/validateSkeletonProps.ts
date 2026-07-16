// src/shared/ui/Skeleton/lib/utils/validateSkeletonProps.ts

import { SkeletonProps } from '../../model/types';
import { SKELETON_CONSTANTS } from '../../model/constants';

/**
 * Dev-валидация props для Skeleton
 * @description Проверяет variant, lines, delay, duration в development режиме
 *
 * @note ESLint no-console отключён — намеренное использование console.warn
 *       для dev-only валидации, которая удаляется в production сборке.
 */

/* eslint-disable no-console */

export const validateSkeletonProps = (props: SkeletonProps): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { variant, lines, delay, duration } = props;

  if (variant && !SKELETON_CONSTANTS.VALID_VARIANTS.includes(variant)) {
    console.warn(
      `Skeleton: invalid variant "${variant}". Valid values: ${SKELETON_CONSTANTS.VALID_VARIANTS.join(', ')}`
    );
  }

  if (
    lines !== undefined &&
    (lines < SKELETON_CONSTANTS.MIN_LINES || lines > SKELETON_CONSTANTS.MAX_LINES)
  ) {
    console.warn(
      `Skeleton: invalid lines "${lines}". Valid range: ${SKELETON_CONSTANTS.MIN_LINES}-${SKELETON_CONSTANTS.MAX_LINES}`
    );
  }

  if (delay !== undefined && delay < 0) {
    console.warn(`Skeleton: invalid delay "${delay}". Must be >= 0`);
  }

  if (duration !== undefined && duration <= 0) {
    console.warn(`Skeleton: invalid duration "${duration}". Must be > 0`);
  }
};
