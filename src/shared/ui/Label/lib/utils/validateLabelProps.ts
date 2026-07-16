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
 * validateLabelProps({ htmlFor: '', error: true, success: true });
 * // → "Label: htmlFor prop is required for accessibility"
 * // → "Label: cannot have both error and success props simultaneously"
 */
export const validateLabelProps = (props: LabelProps): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { htmlFor, error, success, size, variant } = props;

  if (!htmlFor) {
    console.warn('Label: htmlFor prop is required for accessibility');
  }

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
