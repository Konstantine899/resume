import { useCallback, useEffect, useRef, useState } from 'react';
import { POPOVER_CONSTANTS } from '../../model/constants';
import type { PopoverPosition, PopoverProps } from '../../model/types';
import { calculatePopoverPosition } from '../utils/popoverPosition';

interface UsePopoverReturn {
  isVisible: boolean;
  calculatedStyle: React.CSSProperties;
  adjustedPosition: PopoverPosition;
  triggerRef: React.RefObject<HTMLElement | null>;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  handlers: {
    handleClick: (e: React.MouseEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleContentClick: () => void;
  };
  shouldRender: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Custom hook для логики Popover компонента
 */
export const usePopover = ({
  position = POPOVER_CONSTANTS.DEFAULT_POSITION,
  offset = POPOVER_CONSTANTS.DEFAULT_OFFSET,
  autoAdjust = true,
  disabled = false,
  closeOnContentClick = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
}: Pick<PopoverProps, 'position' | 'offset' | 'autoAdjust' | 'disabled'> & {
  closeOnContentClick?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
}): UsePopoverReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedStyle, setCalculatedStyle] = useState<React.CSSProperties>({});
  const [adjustedPosition, setAdjustedPosition] = useState<PopoverPosition>(position);
  const triggerRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Вычисление позиции
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();

    const result = calculatePopoverPosition({
      position,
      triggerRect,
      popoverRect,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      offset,
      autoAdjust,
    });

    setCalculatedStyle({
      top: `${result.top}px`,
      left: `${result.left}px`,
    });

    if (result.adjustedPosition) {
      setAdjustedPosition(result.adjustedPosition);
    }
  }, [position, offset, autoAdjust]);

  // Подписка на resize/scroll
  useEffect(() => {
    if (!isVisible) return;

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible, updatePosition]);

  // Обновление позиции при показе
  useEffect(() => {
    if (isVisible) {
      const raf = requestAnimationFrame(() => {
        if (popoverRef.current && triggerRef.current) {
          updatePosition();
        }
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [isVisible, updatePosition]);

  // Click outside
  useEffect(() => {
    if (!closeOnClickOutside || !isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsidePopover = popoverRef.current?.contains(event.target as Node);
      const isClickInsideTrigger = triggerRef.current?.contains(event.target as Node);

      if (!isClickInsidePopover && !isClickInsideTrigger) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickOutside, isVisible]);

  // ESC key
  useEffect(() => {
    if (!closeOnEsc || !isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === POPOVER_CONSTANTS.ESCAPE_KEY) {
        setIsVisible(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEsc, isVisible]);

  // Обработчики событий
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        setIsVisible((prev) => !prev);
      }
    },
    [disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) {
          setIsVisible((prev) => !prev);
        }
      }
      if (e.key === POPOVER_CONSTANTS.ESCAPE_KEY && isVisible) {
        setIsVisible(false);
        triggerRef.current?.focus();
      }
    },
    [disabled, isVisible]
  );

  const handleContentClick = useCallback(() => {
    if (closeOnContentClick) {
      setIsVisible(false);
    }
  }, [closeOnContentClick]);

  const open = useCallback(() => setIsVisible(true), []);
  const close = useCallback(() => setIsVisible(false), []);

  return {
    isVisible,
    calculatedStyle,
    adjustedPosition,
    triggerRef,
    popoverRef,
    handlers: {
      handleClick,
      handleKeyDown,
      handleContentClick,
    },
    shouldRender: isVisible && !disabled,
    open,
    close,
  };
};
