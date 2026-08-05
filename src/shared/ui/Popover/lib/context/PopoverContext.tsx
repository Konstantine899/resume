/* eslint-disable react-refresh/only-export-components */
import { createContext, memo, useContext } from 'react';
import { usePopover } from '../hooks/usePopover';
import type { PopoverConfig, PopoverContextValue, PopoverProviderProps } from '../../model/types';

/**
 * Контекст состояния поповер — мост между PopoverProvider (владеет usePopover)
 * и частями compound API: PopoverTrigger, PopoverContent.
 *
 * Тип значения — PopoverContextValue из model/types.ts (единый источник).
 */

export const PopoverContext = createContext<PopoverContextValue | null>(null);

/**
 * Provider — владеет состоянием через usePopover.
 * Части (Trigger/Content) потребляют его через usePopoverContext.
 */
export const PopoverProvider = memo((props: PopoverProviderProps) => {
  const {
    position,
    offset,
    autoAdjust,
    disabled,
    closeOnContentClick,
    closeOnClickOutside,
    closeOnEsc,
    children,
  } = props;
  const config: PopoverConfig = {
    position,
    offset,
    autoAdjust,
    disabled,
    closeOnContentClick,
    closeOnClickOutside,
    closeOnEsc,
  };

  const value = usePopover(config);

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
});

PopoverProvider.displayName = 'PopoverProvider';

/**
 * Noop-значение для частей, отрендеренных вне Provider: Trigger рендерится
 * без поведения, Content рендерит null. Позволяет безопасно использовать
 * части вне Provider (Storybook, изоляция) без падения.
 *
 * Каждый lookup создаёт свежий объект с собственными refs — общий объект
 * с мутабельными refs ломал бы использование частей вне Provider.
 */
const createNoopContext = (): PopoverContextValue => ({
  isVisible: false,
  calculatedStyle: {},
  adjustedPosition: 'top',
  triggerRef: { current: null },
  popoverRef: { current: null },
  handlers: {
    handleClick: () => undefined,
    handleKeyDown: () => undefined,
    handleContentClick: () => undefined,
  },
  shouldRender: false,
  open: () => undefined,
  close: () => undefined,
  enabled: false,
  disabled: false,
});

/**
 * Хук доступа к состоянию Popover. Должен вызываться внутри PopoverProvider.
 */
export const usePopoverContext = (): PopoverContextValue => {
  const ctx = useContext(PopoverContext);
  return ctx ?? createNoopContext();
};
