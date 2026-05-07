import { debounce } from '@/shared/lib/utils/debounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TOOLTIP_CONSTANTS } from '../model/constants';
import type { TooltipPosition, TooltipProps } from '../model/types';
import { calculateTooltipPosition } from './utils/tooltipPosition';

interface UseTooltipReturn {
  isVisible: boolean;
  calculatedStyle: React.CSSProperties;
  adjustedPosition: TooltipPosition;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  handlers: {
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    handleFocus: () => void;
    handleBlur: () => void;
    handleClick: (e: React.MouseEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
  };
  shouldRender: boolean;
}

/**
 * Custom hook для логики Tooltip компонента
 * Инкапсулирует state, эффекты и обработчики событий
 */
export const useTooltip = ({
  position = 'top',
  trigger = 'hover',
  showDelay = TOOLTIP_CONSTANTS.DEFAULT_SHOW_DELAY,
  hideDelay = TOOLTIP_CONSTANTS.DEFAULT_HIDE_DELAY,
  disabled = false,
  offset = TOOLTIP_CONSTANTS.DEFAULT_OFFSET,
  maxWidth = TOOLTIP_CONSTANTS.DEFAULT_MAX_WIDTH,
  autoAdjust = true,
}: Pick<
  TooltipProps,
  | 'position'
  | 'trigger'
  | 'showDelay'
  | 'hideDelay'
  | 'disabled'
  | 'offset'
  | 'maxWidth'
  | 'autoAdjust'
>): UseTooltipReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedStyle, setCalculatedStyle] = useState<React.CSSProperties>({});
  const [adjustedPosition, setAdjustedPosition] = useState<TooltipPosition>(position);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Debounced show/hide
  const debouncedShow = useCallback(() => {
    const fn = debounce(() => setIsVisible(true), showDelay);
    fn();
  }, [showDelay]);

  const debouncedHide = useCallback(() => {
    const fn = debounce(() => setIsVisible(false), hideDelay);
    fn();
  }, [hideDelay]);

  // Вычисление позиции
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const result = calculateTooltipPosition({
      position,
      triggerRect,
      tooltipRect,
      viewportWidth,
      viewportHeight,
      offset,
      autoAdjust,
    });

    setCalculatedStyle({
      top: `${result.top}px`,
      left: `${result.left}px`,
      maxWidth: `${maxWidth}px`,
    });

    if (result.adjustedPosition) {
      setAdjustedPosition(result.adjustedPosition);
    }
  }, [position, offset, maxWidth, autoAdjust]);

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
        if (tooltipRef.current && triggerRef.current) {
          updatePosition();
        }
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [isVisible, updatePosition]);

  // Обработчики событий
  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover' && !disabled) {
      debouncedShow();
    }
  }, [trigger, disabled, debouncedShow]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover' && !disabled) {
      debouncedHide();
    }
  }, [trigger, disabled, debouncedHide]);

  const handleFocus = useCallback(() => {
    if (trigger === 'focus' && !disabled) {
      setIsVisible(true);
    }
  }, [trigger, disabled]);

  const handleBlur = useCallback(() => {
    if (trigger === 'focus' && !disabled) {
      setIsVisible(false);
    }
  }, [trigger, disabled]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (trigger === 'click' && !disabled) {
        setIsVisible((prev) => !prev);
      }
    },
    [trigger, disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
        triggerRef.current?.focus();
      }
    },
    [isVisible]
  );

  // Click outside для click триггера
  useEffect(() => {
    if (trigger === 'click' && isVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsVisible(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [trigger, isVisible]);

  return {
    isVisible,
    calculatedStyle,
    adjustedPosition,
    triggerRef,
    tooltipRef,
    handlers: {
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      handleClick,
      handleKeyDown,
    },
    shouldRender: isVisible && !disabled,
  };
};
