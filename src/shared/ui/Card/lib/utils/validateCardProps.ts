import { CARD_CONSTANTS } from '../../model/constants';

export interface CardValidationWarning {
  prop: string;
  message: string;
}

export const validateCardProps = (
  variant: string,
  size: string,
  radius: string
): CardValidationWarning[] => {
  const warnings: CardValidationWarning[] = [];

  const validVariants = CARD_CONSTANTS.VALID_VARIANTS as readonly string[];
  if (!validVariants.includes(variant)) {
    warnings.push({
      prop: 'variant',
      message: `[Card] Invalid variant "${variant}". Valid values: ${validVariants.join(', ')}`,
    });
  }

  const validSizes = CARD_CONSTANTS.VALID_SIZES as readonly string[];
  if (!validSizes.includes(size)) {
    warnings.push({
      prop: 'size',
      message: `[Card] Invalid size "${size}". Valid values: ${validSizes.join(', ')}`,
    });
  }

  const validRadii = CARD_CONSTANTS.VALID_RADIUS as readonly string[];
  if (!validRadii.includes(radius)) {
    warnings.push({
      prop: 'radius',
      message: `[Card] Invalid radius "${radius}". Valid values: ${validRadii.join(', ')}`,
    });
  }

  return warnings;
};
