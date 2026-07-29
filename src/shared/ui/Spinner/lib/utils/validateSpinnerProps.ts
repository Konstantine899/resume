import { SPINNER_CONSTANTS } from '../../model/constants';

export interface SpinnerValidationWarning {
  prop: string;
  message: string;
}

export const validateSpinnerProps = (
  variant: string,
  size: string,
  color: string,
  speed: string,
  thickness: string
): SpinnerValidationWarning[] => {
  const warnings: SpinnerValidationWarning[] = [];

  const validVariants = SPINNER_CONSTANTS.VALID_VARIANTS as readonly string[];
  if (!validVariants.includes(variant)) {
    warnings.push({
      prop: 'variant',
      message: `[Spinner] Invalid variant "${variant}". Valid values: ${validVariants.join(', ')}`,
    });
  }

  const validSizes = SPINNER_CONSTANTS.VALID_SIZES as readonly string[];
  if (!validSizes.includes(size)) {
    warnings.push({
      prop: 'size',
      message: `[Spinner] Invalid size "${size}". Valid values: ${validSizes.join(', ')}`,
    });
  }

  const validColors = SPINNER_CONSTANTS.VALID_COLORS as readonly string[];
  if (!validColors.includes(color)) {
    warnings.push({
      prop: 'color',
      message: `[Spinner] Invalid color "${color}". Valid values: ${validColors.join(', ')}`,
    });
  }

  const validSpeeds = SPINNER_CONSTANTS.VALID_SPEEDS as readonly string[];
  if (!validSpeeds.includes(speed)) {
    warnings.push({
      prop: 'speed',
      message: `[Spinner] Invalid speed "${speed}". Valid values: ${validSpeeds.join(', ')}`,
    });
  }

  const validThicknesses = SPINNER_CONSTANTS.VALID_THICKNESSES as readonly string[];
  if (!validThicknesses.includes(thickness)) {
    warnings.push({
      prop: 'thickness',
      message: `[Spinner] Invalid thickness "${thickness}". Valid values: ${validThicknesses.join(', ')}`,
    });
  }

  return warnings;
};
