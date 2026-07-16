// src/shared/ui/Popover/index.ts

/**
 * Popover компонент - кликабельный popup с контентом
 *
 * @example
 * ```tsx
 * <Popover content="Контент" position="bottom">
 *   <button>Click me</button>
 * </Popover>
 * ```
 */
export type { PopoverPosition, PopoverProps, PopoverSize } from './model/types';
export {
  POPOVER_CONSTANTS,
  POPOVER_DEFAULTS,
  POPOVER_POSITIONS,
  POPOVER_SIZES_ARRAY,
  POPOVER_SIZES,
} from './model/constants';
export { validatePopoverProps } from './lib/utils/validatePopoverProps';
export { Popover } from './ui/Popover';
