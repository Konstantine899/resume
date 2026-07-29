import { BUTTON_CONSTANTS } from '../../model/constants';

export interface ButtonValidationWarning {
  prop: string;
  message: string;
}

export const validateButtonProps = (
  variant: string,
  size: string,
  loadingVariant: string,
  loading?: boolean
): ButtonValidationWarning[] => {
  const warnings: ButtonValidationWarning[] = [];

  const validVariants = BUTTON_CONSTANTS.VALID_VARIANTS as readonly string[];
  if (!validVariants.includes(variant)) {
    warnings.push({
      prop: 'variant',
      message: `[Button] Invalid variant "${variant}". Valid values: ${validVariants.join(', ')}`,
    });
  }

  const validSizes = BUTTON_CONSTANTS.VALID_SIZES as readonly string[];
  if (!validSizes.includes(size)) {
    warnings.push({
      prop: 'size',
      message: `[Button] Invalid size "${size}". Valid values: ${validSizes.join(', ')}`,
    });
  }

  const validLoadingVariants = BUTTON_CONSTANTS.VALID_LOADING_VARIANTS as readonly string[];
  if (!validLoadingVariants.includes(loadingVariant)) {
    warnings.push({
      prop: 'loadingVariant',
      message: `[Button] Invalid loadingVariant "${loadingVariant}". Valid values: ${validLoadingVariants.join(', ')}`,
    });
  }

  if (loadingVariant === 'skeleton' && !loading) {
    warnings.push({
      prop: 'loading',
      message:
        '[Button] loadingVariant is "skeleton" but loading is false. Skeleton will not be displayed.',
    });
  }

  return warnings;
};
