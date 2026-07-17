// src/shared/ui/Button/index.ts

export type {
  ButtonComponentProps,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  ButtonWithIconProps,
  IconButtonProps,
  LoadingVariant,
} from './model/types';

export { Button } from './ui/Button/Button';
export { ButtonWithIcon } from './ui/ButtonWithIcon/ButtonWithIcon';
export { IconButton } from './ui/IconButton/IconButton';

// Constants for configuration and validation
export { BUTTON_CONSTANTS } from './model/constants';
export { validateButtonProps } from './lib/validateButtonProps';
export type { ButtonValidationWarning } from './lib/validateButtonProps';
