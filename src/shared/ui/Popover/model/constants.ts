import type { PopoverPosition, PopoverSize } from './types';

/**
 * Доступные позиции Popover
 */
export const POPOVER_POSITIONS: readonly PopoverPosition[] = [
  'top',
  'bottom',
  'left',
  'right',
  'center',
] as const;

/**
 * Доступные размеры Popover
 */
export const POPOVER_SIZES_ARRAY: readonly PopoverSize[] = ['sm', 'md', 'lg', 'auto'] as const;

/**
 * Дефолтные значения props
 */
export const POPOVER_DEFAULTS = {
  position: 'top' as PopoverPosition,
  size: 'md' as PopoverSize,
  offset: 8,
  closeOnContentClick: true,
  closeOnClickOutside: true,
  closeOnEsc: true,
  autoAdjust: true,
  disabled: false,
} as const;

/**
 * Маппинг размеров в пиксели
 */
export const POPOVER_SIZES = {
  sm: 200,
  md: 280,
  lg: 360,
  auto: 'auto',
} as const;

export const POPOVER_CONSTANTS = {
  DEFAULT_OFFSET: POPOVER_DEFAULTS.offset,
  DEFAULT_SIZE: POPOVER_DEFAULTS.size,
  DEFAULT_POSITION: POPOVER_DEFAULTS.position,
  ESCAPE_KEY: 'Escape',
  defaults: POPOVER_DEFAULTS,
  validPositions: POPOVER_POSITIONS,
  validSizes: POPOVER_SIZES_ARRAY,
} as const;

export const VALID_POSITIONS: readonly PopoverPosition[] = [
  'top',
  'bottom',
  'left',
  'right',
  'center',
];
export const VALID_SIZES: readonly PopoverSize[] = ['sm', 'md', 'lg', 'auto'];
