import type {
  SpinnerColor,
  SpinnerSize,
  SpinnerSpeed,
  SpinnerThickness,
  SpinnerVariant,
} from './types';

export const SPINNER_CONSTANTS = {
  VALID_VARIANTS: ['spinner', 'double-ring'] as const satisfies readonly SpinnerVariant[],
  VALID_SIZES: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const satisfies readonly SpinnerSize[],
  VALID_COLORS: [
    'primary',
    'secondary',
    'accent',
    'orange',
  ] as const satisfies readonly SpinnerColor[],
  VALID_SPEEDS: ['slow', 'normal', 'fast'] as const satisfies readonly SpinnerSpeed[],
  VALID_THICKNESSES: ['thin', 'normal', 'thick'] as const satisfies readonly SpinnerThickness[],
} as const;
