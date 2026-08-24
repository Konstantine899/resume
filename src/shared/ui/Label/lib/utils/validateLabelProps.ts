// src/shared/ui/Label/lib/utils/validateLabelProps.ts

/* eslint-disable no-console */

import { LabelProps } from '../../model/types';
import { LABEL_CONSTANTS } from '../../model/constants';

/**
 * Dev-валидация props для Label
 * @description Проверяет конфликтующие пропсы и валидность значений в development режиме
 *
 * @param props - пропсы компонента Label
 * @returns void (только console.warn)
 *
 * @example
 * validateLabelProps({ error: true, success: true });
 * // → "Label: cannot have both error and success props simultaneously"
 *
 * @note htmlFor is OPTIONAL since 2026-08-24 (SR3) — no warning is emitted when it is absent.
 */
export const validateLabelProps = (props: LabelProps): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { error, success, size, variant } = props;

  if (error && success) {
    console.warn('Label: cannot have both error and success props simultaneously');
  }

  if (size && !LABEL_CONSTANTS.sizes.includes(size)) {
    console.warn(
      `Label: invalid size "${size}". Valid values: ${LABEL_CONSTANTS.sizes.join(', ')}`
    );
  }

  if (variant && !LABEL_CONSTANTS.variants.includes(variant)) {
    console.warn(
      `Label: invalid variant "${variant}". Valid values: ${LABEL_CONSTANTS.variants.join(', ')}`
    );
  }
};
