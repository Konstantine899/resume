import { TEXTAREA_CONSTANTS } from '../../model/constants';

export interface TextareaValidationWarning {
  prop: string;
  message: string;
}

export const validateTextareaProps = (
  variant: string,
  size: string,
  showCounter?: boolean,
  maxLength?: number
): TextareaValidationWarning[] => {
  const warnings: TextareaValidationWarning[] = [];

  const validVariants = TEXTAREA_CONSTANTS.VALID_VARIANTS as readonly string[];
  if (!validVariants.includes(variant)) {
    warnings.push({
      prop: 'variant',
      message: `[Textarea] Invalid variant "${variant}". Valid values: ${validVariants.join(', ')}`,
    });
  }

  const validSizes = TEXTAREA_CONSTANTS.VALID_SIZES as readonly string[];
  if (!validSizes.includes(size)) {
    warnings.push({
      prop: 'size',
      message: `[Textarea] Invalid size "${size}". Valid values: ${validSizes.join(', ')}`,
    });
  }

  if (showCounter && !maxLength) {
    warnings.push({
      prop: 'maxLength',
      message:
        '[Textarea] showCounter is true but maxLength is not set. Counter will not display correctly.',
    });
  }

  return warnings;
};
