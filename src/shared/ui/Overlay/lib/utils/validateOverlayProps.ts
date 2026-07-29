import { OVERLAY_CONSTANTS } from '../../model/constants';

export interface OverlayValidationWarning {
  prop: string;
  message: string;
}

export const validateOverlayProps = (blur: boolean, dark: boolean): OverlayValidationWarning[] => {
  const warnings: OverlayValidationWarning[] = [];

  if (blur && dark) {
    warnings.push({
      prop: 'blur, dark',
      message:
        `${OVERLAY_CONSTANTS.DEV_WARNING_PREFIX} Using both blur and dark simultaneously ` +
        'may produce unexpected visual results.',
    });
  }

  return warnings;
};
