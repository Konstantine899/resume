// src/shared/ui/Button/index.ts

export type {
  ButtonComponentProps,
  ButtonOwnProps,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  ButtonWithIconProps,
  IconButtonProps,
  LoadingVariant,
  PolymorphicProps,
} from './model/types';

export { Button } from './ui/Button/Button';
export { ButtonWithIcon } from './ui/ButtonWithIcon/ButtonWithIcon';
export { IconButton } from './ui/IconButton/IconButton';
export { ButtonLoader } from './ui/ButtonLoader/ButtonLoader';

// Hook
export { useButton } from './lib/hooks/useButton';
export type { UseButtonOptions, UseButtonReturn } from './lib/hooks/useButton';

// Constants for configuration and validation
export { BUTTON_CONSTANTS, ICON_SIZE_MAP } from './model/constants';
export { validateButtonProps } from './lib/utils/validateButtonProps';
export type { ButtonValidationWarning } from './lib/utils/validateButtonProps';
