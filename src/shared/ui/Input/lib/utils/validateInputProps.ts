import { INPUT_CONSTANTS } from '../../model/constants';

export interface InputValidationWarning {
  prop: string;
  message: string;
}

export const validateInputProps = (
  variant: string,
  size: string,
  showCounter?: boolean,
  maxLength?: number,
  loading?: boolean,
  disabled?: boolean
): InputValidationWarning[] => {
  const warnings: InputValidationWarning[] = [];

  const validVariants = INPUT_CONSTANTS.VALID_VARIANTS as readonly string[];
  if (!validVariants.includes(variant)) {
    warnings.push({
      prop: 'variant',
      message: `[Input] Invalid variant "${variant}". Valid values: ${validVariants.join(', ')}`,
    });
  }

  const validSizes = INPUT_CONSTANTS.VALID_SIZES as readonly string[];
  if (!validSizes.includes(size)) {
    warnings.push({
      prop: 'size',
      message: `[Input] Invalid size "${size}". Valid values: ${validSizes.join(', ')}`,
    });
  }

  if (showCounter && !maxLength) {
    warnings.push({
      prop: 'maxLength',
      message:
        '[Input] showCounter is true but maxLength is not set. Counter will not display correctly.',
    });
  }

  if (loading && disabled) {
    warnings.push({
      prop: 'loading',
      message:
        '[Input] `loading` and `disabled` are both set. Native `disabled` removes the element from the accessibility tree, so `aria-busy` is inert — screen readers announce "disabled", not "loading". Prefer `loading` alone (aria-busy + aria-disabled) or drop `loading` when `disabled` is required.',
    });
  }

  return warnings;
};
