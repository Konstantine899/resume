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
 *
 * Compound API доступен через статики `Popover.Provider/Trigger/Content`
 * или через прямые импорты (PopoverProvider/PopoverTrigger/PopoverContent).
 */
export type {
  PopoverPosition,
  PopoverProps,
  PopoverSize,
  PopoverOwnProps,
  PopoverBaseProps,
  PopoverConfig,
  PopoverComponent,
  PopoverProviderProps,
  PopoverProviderOwnProps,
  PopoverProviderComponent,
  PopoverTriggerProps,
  PopoverTriggerComponent,
  PopoverTriggerOwnProps,
  PopoverContentProps,
  PopoverContentComponent,
  PopoverContextValue,
} from './model/types';
export {
  POPOVER_CONSTANTS,
  POPOVER_DEFAULTS,
  POPOVER_POSITIONS,
  POPOVER_SIZES_ARRAY,
  POPOVER_SIZES,
} from './model/constants';
export { validatePopoverProps } from './lib/utils/validatePopoverProps';
export { usePopover } from './lib/hooks/usePopover';
export { Popover } from './ui/Popover';
export { PopoverProvider, usePopoverContext } from './lib/context/PopoverContext';
export { PopoverTrigger } from './ui/PopoverTrigger/PopoverTrigger';
export { PopoverContent } from './ui/PopoverContent/PopoverContent';
