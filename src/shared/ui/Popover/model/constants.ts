import type { PopoverPosition, PopoverSize } from './types';

export const POPOVER_CONSTANTS = {
  DEFAULT_OFFSET: 8,
  DEFAULT_SIZE: 'md' as const,
  DEFAULT_POSITION: 'top' as const,
  ESCAPE_KEY: 'Escape',
} as const;

export const POPOVER_SIZES = {
  sm: 200,
  md: 280,
  lg: 360,
  auto: 'auto',
} as const;

export const VALID_POSITIONS: readonly PopoverPosition[] = [
  'top',
  'bottom',
  'left',
  'right',
  'center',
];
export const VALID_SIZES: readonly PopoverSize[] = ['sm', 'md', 'lg', 'auto'];
